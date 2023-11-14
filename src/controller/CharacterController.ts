import {DeepPartial, Like} from 'typeorm'
import {AppDataSource} from '../data-source'
import {NextFunction, Request, Response} from 'express'

import {Controller} from '../decorator/Controller'
import {Route} from '../decorator/Route'
import {validate, ValidationError, ValidatorOptions} from 'class-validator'
import {Character} from "../entity/Character";
import axios, {AxiosResponse} from 'axios';
import {User} from "../entity/User";

type DndClass = {
    name: string;
    hitDie?: number;
    profChoices?: string;
};

type DndRace = {
    name: string;
    speed?: number;
    abilityScoreType?: string;
    abilityScoreBonus?: number;
    ageDesc?: string;
    alignmentDesc?: string;
};


@Controller('/characters')
export default class CharacterController {
    private readonly characterRepo = AppDataSource.getRepository(Character)
    //private readonly raceRepo = AppDataSource.getRepository(Race)
    //private readonly classRepo = AppDataSource.getRepository(Class)

    // https://github.com/typestack/class-validator#passing-options
    private readonly validOptions: ValidatorOptions = {
        stopAtFirstError: true,
        skipMissingProperties: false,
        validationError: { target: false, value: false }
    }



    @Route('get', '/:id*?')
    async read(req: Request, res: Response, next: NextFunction): Promise<{ count: number; characters: Character[] | Character }> {
        // Check if the client wants the count
        let count: number | undefined;
        if (req.query.count) {
            const findOptions: any = {}; // prepare order and where props
            const existingFields = this.characterRepo.metadata.ownColumns.map((col) => col.propertyName);

            if (req.query.searchwherelike) {
                findOptions.where = [];
                existingFields.forEach((column) => {
                    findOptions.where.push({ [column]: Like('%' + req.query.searchwherelike + '%') });
                });
            }

            count = await this.characterRepo.count(findOptions);
        }

        if (req.params.id) {
            const character = await this.characterRepo.findOneBy({ id: req.params.id });
            return { count: count || 1, characters: character };
        } else {
            const findOptions: any = { order: {} }; // prepare order and where props
            const existingFields = this.characterRepo.metadata.ownColumns.map((col) => col.propertyName);

            // create a where clause ARRAY to eventually add to the findOptions
            // you must also use Like ('% ... %')
            // only add it to the findOptions IF searchwherelike query string is provided

            const sortField: string = existingFields.includes(req.query.sortby) ? req.query.sortby : 'id';
            findOptions.order[sortField] = req.query.reverse ? 'DESC' : 'ASC';
            // findOption looks like { order{ phone: 'DESC' } }

            if (req.query.searchwherelike) {
                findOptions.where = [];
                existingFields.forEach((column) => {
                    findOptions.where.push({ [column]: Like('%' + req.query.searchwherelike + '%') });
                });
            }

            // Return both count and characters
            const characters = await this.characterRepo.find(findOptions);
            return { count: count || characters.length, characters };
        }
    }



    //add get characters by userid
    @Route('get','/users/:id')
    async readById(req: Request, res: Response, next: NextFunction): Promise<Character | Character[]> {
        if (req.params.id) {
            return await this.characterRepo.find({ where: { user: { id: Number(req.params.id) } } });
        }
    }

    @Route('delete', '/:id')
    async delete (req: Request, res: Response, next: NextFunction): Promise<Character> {
        const characterToRemove = await this.characterRepo.findOneBy({ id: req.params.id })
        // res.statusCode = 204 --No Content - browser will complain since we are actually returning content
        if (characterToRemove) return await this.characterRepo.remove(characterToRemove)
        else next()
    }

    @Route('post')
    async create (req: Request, res: Response, next: NextFunction): Promise<Character | ValidationError[] | { error: string }> {

        const newCharacter = Object.assign(new Character(), req.body)
        newCharacter.user = {
            id: req.user.id,
        } //assign the user found during the authenticate method, (user being found through the bearer token they send)

        const violations = await validate(newCharacter, this.validOptions)

        if (req.body.id) {  //don't allow it to be included as a parameter because it'll function as a post and edit other users
            return {error: "You cannot select an ID when creating a character"}
        }
        if (violations.length) {
            res.statusCode = 422 // Unprocessable Entity
            return violations
        } else {
            return await this.characterRepo.save(newCharacter)
        }
    }

    @Route('put', '/:id')
    async update (req: Request, res: Response, next: NextFunction): Promise<Character | ValidationError[]> {
        /*     PRELOAD - https://typeorm.io/#/repository-api
        Creates a new entity from the plain javascript object.
        If the entity already exists in the database, then it loads it and replaces all values with the new ones from the given object,
        and returns a new entity that is actually an entity loaded from the database with all properties replaced from the new object.
        Note that given entity-like object must have an entity id / primary key to find entity by.
        Returns undefined if entity with given id was not found.
    */
        const characterToUpdate = await this.characterRepo.preload(req.body)
        // Extra validation - ensure the id param matched the id submitted in the body
        if (!characterToUpdate || characterToUpdate.id.toString() !== req.params.id) next()
        else {
            const violations = await validate(characterToUpdate, this.validOptions)
            if (violations.length) {
                res.statusCode = 422 // Unprocessable Entity
                return violations
            } else {
                return await this.characterRepo.save(characterToUpdate)
            }
        }
    }


    //utilizing axios this time to call dnd5e api to get class and race related data

    private dnd5eApiUrl = "https://www.dnd5eapi.co/api/";
    private async fetchSpecificData(category: string, index: string): Promise<any> {
        try {
            const response: AxiosResponse = await axios.get(`${this.dnd5eApiUrl}${category}/${index}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching specific data for ${index}:`, error);
            throw error;
        }
    }



    @Route('get', '/classes')
    async getDndClasses(req: Request, res: Response, next: NextFunction): Promise<any[]> {
        try {
            const response: AxiosResponse = await axios.get(`${this.dnd5eApiUrl}classes`)
            const classNames = response.data.results;
            const classArray = [];

            for (const obj of classNames) {
                const data = await this.fetchSpecificData('classes', obj.index)
                const parsedObj = {
                    name: data.name,
                    hitDie: data.hit_die,
                    profChoices: data.proficiency_choices[0].desc
                }
                classArray.push(parsedObj);
            }
            return classArray
            //res.json(raceArray)
        } catch (error) {
            console.error(error);
            await res.status(500).json({error: 'Server Error'})
        }
    }

    @Route('get', '/races')
    async getDndRaces(req: Request, res: Response, next: NextFunction): Promise<any[]> {
        try {
            const response: AxiosResponse = await axios.get(`${this.dnd5eApiUrl}races`)
            const raceNames = response.data.results;
            const raceArray = [];

            for (const obj of raceNames) {
                const data = await this.fetchSpecificData('races', obj.index)

                const parsedObj =
                    {
                    name: data.name, speed: data.speed,
                    abilityScoreType: data.ability_bonuses[0].ability_score.name,
                    abilityScoreBonus: data.ability_bonuses[0].bonus,
                    ageDesc: data.age,
                    alignmentDesc: data.alignment
                    }

                 raceArray.push(parsedObj)
                 }
            return raceArray
            //res.json(raceArray)

        } catch (error) {
            console.error(error)
            await res.status(500).json({error: 'erver Error'})
        }
    }

}
