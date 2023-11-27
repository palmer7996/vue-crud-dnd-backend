import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from 'express'
import { User } from '../entity/User'
import { Controller } from '../decorator/Controller'
import { Route } from '../decorator/Route'

@Controller('/users')
export class UserController {
  private readonly userRepository = AppDataSource.getRepository(User)

  // need to make fetch request that allows login
  // post with body as an object with the username and password?
  // return user object, assign it to the User in the front-end

  // disable get and all other requests being made on the user db
  /*
  @Route('GET')
  async all (req: Request, res: Response, next: NextFunction): Promise<User []> {
    return await this.userRepository.find()
  }

  @Route('get', '/:id')
  async one (req: Request, response: Response, next: NextFunction): Promise<User> {
    return await this.userRepository.findOneBy({ id: req.params.id })
  }

   */

  // typescript - private property fully typed object
  // only show first error
  // still validate missing properties
  // hide the target and value from the error object
  // private . . .

  // make a login post request

  @Route('post')
  async login (req: Request, res: Response, next: NextFunction): Promise<any> {
    const usernameProvided = req.body.username
    const passProvided = req.body.password
    if (!usernameProvided || !passProvided) {
      res.status(401).json({ message: 'Please provide a username and password' })
    }

    console.log(usernameProvided)
    console.log(passProvided)

    const users = await this.userRepository.findOneBy({ username: usernameProvided })
    console.log(users)
    if (users == null) {
      res.status(401).json({ message: 'Authentication failed, username is invalid' })
      // should probably say username or password is invalid on a real project to be more secure
    }
    // just going to assume only one username exists in the database (it has unique constraint so should worK)
    if (users.password !== passProvided) {
      res.status(401).json({ message: 'Authentication failed, password is invalid' })
    }

    return res.status(200).json(users)
    // returns the entire user object, can now use the accessLevel to determine what pages they can view
    // and token to use for their other fetches
  }

  /*
  @Route('delete', '/:id')
  async remove (req: Request, res: Response, next: NextFunction): Promise<User> {
    const userToRemove = await this.userRepository.findOneBy({ id: req.params.id })
    return await this.userRepository.remove(userToRemove)
  }

   */
}
