
import { Request, Response, NextFunction } from 'express'
import { User } from '../entity/User'
import {AppDataSource} from "../data-source";
import {Character} from "../entity/Character";

//import jwt from 'jsonwebtoken';


//could implement another thing
// if you have write perms and not admin perms you can only edit and delete characters relating to yourself


const userRepo = AppDataSource.getRepository(User)
const characterRepo = AppDataSource.getRepository(Character)


export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const givenToken = req.header('Authorization')?.replace('Bearer ', '')

    console.log("Id of user being edited:" + req.params.id)  //get id of character they're trying to edit or delete

    let user = new User();
    if (!givenToken) {  //if no token provided
        user.accessLevel = 'read'
    } else {
        user = await userRepo.findOne({where: {token: givenToken}})
        if (!user) {
            return res.status(401).json({error: 'User with that token does not exist in the database'})
        }
    }


    const isWriteOperation = ['POST', 'DELETE', 'PUT'].includes(req.method)
    const isEditOperation = ['DELETE', 'PUT'].includes(req.method)

    try {

        if (isWriteOperation) {
            if (!givenToken) {
                return res.status(401).json({error: 'Missing token'})
            }
            if (user.accessLevel === 'admin') {
                //do nothing let it through
            } else if (user.accessLevel === 'write') {
                if (isEditOperation) {
                    const character = await characterRepo.findOneBy({id: req.params.id});  //find the character record to get its userid
                    console.log(character.userId)
                    if(character.userId !== user.id){
                        return res.status(403).json({error: 'Cannot edit character that isn\'t yours as a non-admin'})
                    }
                }
                //else let through
            }else if (user.accessLevel === 'read') {
                return res.status(403).json({error: 'Access level too low'})
            } else {
                return res.status(403).json({error: 'Invalid access level'})
            }


        }
        //else allow user to perform the action
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.status(403).json({ error: 'Invalid operation' })
    }
};





