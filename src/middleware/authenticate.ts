import { Request, Response, NextFunction } from 'express'
import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import { Character } from '../entity/Character'
import { DndRace } from '../entity/DndRace'
import { DndClass } from '../entity/DndClass'

// import jwt from 'jsonwebtoken';

// could implement another thing
// if you have write perms and not admin perms you can only edit and delete characters relating to yourself

const userRepo = AppDataSource.getRepository(User)
const characterRepo = AppDataSource.getRepository(Character)
const raceRepo = AppDataSource.getRepository(DndRace)
const classRepo = AppDataSource.getRepository(DndClass)

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const givenToken = req.header('Authorization')?.replace('Bearer ', '')

  try {
    if (req.route.path.startsWith('/characters')) {
      await handleCharacterPath(req, res, next, givenToken)
    } else if (req.route.path.startsWith('/info/races')) {
      await handleInfoPath(req, res, next, givenToken, 'races')
    } else if (req.route.path.startsWith('/info/classes')) {
      await handleInfoPath(req, res, next, givenToken, 'classes')
    } else { // included for student post
      // next()
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error: 'Invalid operation' })
  }
}

const handleInfoPath = async (req: Request, res: Response, next: NextFunction, givenToken: string, type: string) => {
  let selected = null
  // check if the selected id (if there is one, refers to an id in the db)
  if (req.params.id) {
    if (type === 'races') {
      selected = await raceRepo.findOneBy({ id: req.params.id }) // find the character record to get its userid
    } else if (type === 'classes') {
      selected = await classRepo.findOneBy({ id: req.params.id }) // find the character record to get its userid
    }
    // if it isn't type races or classes or if they return null
    if (selected === null) {
      return res.status(400).json({ error: 'Could not find request object by the id provided' })
    }
  }
  // allow anyone to do a get
  if (req.method === 'GET') {
    next()
    return
  }

  const isWriteOperation = ['POST', 'DELETE', 'PUT'].includes(req.method)

  // only allow admin to do edits
  // allow admin to make any put/post/delete

  let user = new User()
  user.accessLevel = 'read'
  if (givenToken) {
    // user = await userRepo.findOne({ where: { token: givenToken } });
    user = await userRepo.findOneBy({ token: givenToken })
  } else {
    return res.status(401).json({ error: 'User with that token does not exist in the database' })
  }

  if (isWriteOperation) {
    if (user.accessLevel !== 'admin') {
      return res.status(403).json({ error: 'Inusfficient access level' })
    }
  }
  next()
}

const handleCharacterPath = async (req: Request, res: Response, next: NextFunction, givenToken: string) => {
  // make sure the id refers to a character in the database (for both gets and put/delete)
  const character = new Character()
  if (req.params.id) {
    console.log('Id of character being requested for get or edit: ' + req.params.id)
    const character = await characterRepo.findOneBy({ id: req.params.id }) // find the character record to get its userid to make sure edits are allowed later on
    if (character == null) {
      return res.status(400).json({ error: 'Could not find specified character by the id provided' })
    }
  }
  // allow anyone to do a get (without tokens)
  if (req.method === 'GET') {
    next()
    return
  }

  // get the user record from the db using the given token
  let user = new User()
  user.accessLevel = 'read' // auto-assign tokenless users to a read access level no token provided
  if (givenToken) { // re-assign based on token
    user = await userRepo.findOneBy({ token: givenToken })
    if (!user) {
      return res.status(401).json({ error: 'User with that token does not exist in the database' })
    }
  }

  const isWriteOperation = ['POST', 'DELETE', 'PUT'].includes(req.method)
  const isEditOperation = ['DELETE', 'PUT'].includes(req.method)

  if (isWriteOperation) {
    if (!givenToken) {
      return res.status(401).json({ error: 'Missing token' })
    }

    if (user.accessLevel === 'admin') {
      // do nothing
    } else if (user.accessLevel === 'write') {
      // do nothing
    } else if (user.accessLevel === 'read') {
      return res.status(403).json({ error: 'Access level too low' })
    } else {
      return res.status(403).json({ error: 'Invalid access level' })
    }

    // if editing
    // check if the character exists, if not return specific error message
    // check if the user trying to edit owns the character if they have write perms, if admin perms don't need to do anything
    if (isEditOperation) {
      // if user trying to edit and user not an admin check if the id of the user matches the userId on the character
      if (user.accessLevel === 'write') {
        if (isEditOperation) {
          console.log('Character owned by: ' + character?.userId) // ? because in case userId is null, which it shouldn't ever be
          console.log('User with write perms attempting edit: ' + user.id)
          if (character?.userId !== user.id) {
            // if userId is null/undefined it will still trigger this message to prevent them form editing characters not explicitly assigned to them
            return res.status(403).json({ error: 'Cannot edit character that isn\'t yours as a non-admin' })
          }
          // else let through
        }
      }
    }
  }
  // else allow user to perform the action
  req.user = user
  next()
}
