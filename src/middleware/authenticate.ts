
import { Request, Response, NextFunction } from 'express'
import { User } from '../entity/User'
import {AppDataSource} from "../data-source";

//import jwt from 'jsonwebtoken';


const userRepo = AppDataSource.getRepository(User)
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const givenToken = req.header('Authorization')?.replace('Bearer ', '')



    let user = new User();
    if(!givenToken){  //if no token proivided
        user.accessLevel = 'read'
    }else{
        user = await userRepo.findOne({ where: { token: givenToken } } )
        if(!user){
            return res.status(401).json({ error: 'User with that token does not exist in the database' })
        }
    }


    const isWriteOperation = ['POST', 'DELETE', 'PUT'].includes(req.method)

    try {

        if(isWriteOperation){
            if (!givenToken) {
                return res.status(401).json({ error: 'Missing token' })
            }
            if(['admin', 'write'].includes(user.accessLevel)){
                //do nothing let it through
            }else if(user.accessLevel==='read'){
                return res.status(403).json({ error: 'Access level too low' })
            }else{
                return res.status(403).json({ error: 'Invalid access level' })
            }
        }

        //else allow user to perform the action
        req.user = user;
        next();

    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' })
    }
};





