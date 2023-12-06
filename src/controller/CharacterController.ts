import { Like } from 'typeorm'
import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from 'express'

import { Controller } from '../decorator/Controller'
import { Route } from '../decorator/Route'
import { validate, ValidationError, ValidatorOptions } from 'class-validator'
import { Character } from '../entity/Character'
import axios, { AxiosResponse } from 'axios'

@Controller('/characters')
export default class CharacterController {
  private readonly characterRepo = AppDataSource.getRepository(Character)
  // private readonly raceRepo = AppDataSource.getRepository(Race)
  // private readonly classRepo = AppDataSource.getRepository(Class)

  // https://github.com/typestack/class-validator#passing-options
  private readonly validOptions: ValidatorOptions = {
    stopAtFirstError: true,
    skipMissingProperties: false,
    validationError: { target: false, value: false }
  }

  @Route('get', '/:id(\\d+)*?') // using regex because it accepted non-number ids and intercepted other routes
  // return a character count and array of characters, or return a single character's attributes
  async read (req: Request, res: Response, next: NextFunction): Promise<{ count: number, characters: Character[] } | Character> {
    if (req.params.id) {
      return await this.characterRepo.findOneBy({ id: req.params.id })
    } else {
      const findOptions: any = { order: {} } // prepare order and where props
      const existingFields = this.characterRepo.metadata.ownColumns.map((col) => col.propertyName)

      // create a where clause ARRAY to eventually add to the findOptions
      // you must also use Like ('% ... %')
      // only add it to the findOptions IF searchwherelike query string is provided

      const sortField: string = existingFields.includes(req.query.sortby) ? req.query.sortby : 'id'
      findOptions.order[sortField] = req.query.reverse ? 'DESC' : 'ASC'
      // findOption looks like { order{ phone: 'DESC' } }

      if (req.query.searchwherelike) {
        findOptions.where = []
        existingFields.forEach((column) => {
          findOptions.where.push({ [column]: Like('%' + req.query.searchwherelike + '%') })
        })
      }

      // Return both count and characters
      const characters = await this.characterRepo.find(findOptions)
      return { count: characters.length, characters }
    }
  }

  @Route('get', '/users/:id(\\d+)*?')
  // return count and character array same as above
  async readById (req: Request, res: Response, next: NextFunction): Promise<{ count: number, characters: Character[] }> {
    if (req.params.id) {
      const characters = await this.characterRepo.find({ where: { userId: Number(req.params.id) } })
      return { count: characters.length, characters }
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
    // if (req.body.id) { // don't allow it to be included as a parameter because it could edit already existing character
    //   return res.status(422).json({ error: 'You cannot select an ID when creating a character' })
    // }

    const newCharacter = Object.assign(new Character(), req.body)
    // assign the userid found during the authenticate method, (user being found through the bearer token they send)
    newCharacter.userId = req.user.id

    const violations = await validate(newCharacter, this.validOptions)
    if (violations.length) {
      res.statusCode = 422 // Unprocessable Entity
      return violations
    } else {
      return await this.characterRepo.save(newCharacter)
    }
  }

  @Route('put', '/:id')
  async update (req: Request, res: Response, next: NextFunction): Promise<Character | ValidationError[]> {
    const characterToUpdate = await this.characterRepo.preload(req.body)
    // Extra validation - ensure the id param matched the id submitted in the body
    if (!characterToUpdate || characterToUpdate.id.toString() !== req.params.id) {
      next() // pass to the 404
    } else {
      const violations = await validate(characterToUpdate, this.validOptions)
      if (violations.length) {
        res.statusCode = 422 // Unprocessable Entity
        return violations
      } else {
        return await this.characterRepo.save(characterToUpdate)
      }
    }
  }

  // utilizing axios this time to call dnd5e api to get the original class and race related data

  private readonly dnd5eApiUrl = 'https://www.dnd5eapi.co/api/'
  private async fetchSpecificData (category: string, index: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(`${this.dnd5eApiUrl}${category}/${index}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching specific data for ${index}:`, error)
      throw error
    }
  }

  @Route('get', '/original_classes')
  async getDndClassesFromApi (req: Request, res: Response, next: NextFunction): Promise<any[]> {
    try {
      const response: AxiosResponse = await axios.get(`${this.dnd5eApiUrl}classes`)
      const classNames = response.data.results
      const classArray = []

      for (const obj of classNames) {
        const data = await this.fetchSpecificData('classes', obj.index)
        const parsedObj = {
          name: data.name,
          hitDie: data.hit_die,
          profChoices: data.proficiency_choices[0].desc
        }
        classArray.push(parsedObj)
      }
      return classArray
      // res.json(raceArray)
    } catch (error) {
      console.error(error)
      await res.status(500).json({ error: 'Server Error' })
    }
  }

  @Route('get', '/original_races')
  async getDndRacesFromApi (req: Request, res: Response, next: NextFunction): Promise<any[]> {
    try {
      const response: AxiosResponse = await axios.get(`${this.dnd5eApiUrl}races`)
      const raceNames = response.data.results
      const raceArray = []

      for (const obj of raceNames) {
        const data = await this.fetchSpecificData('races', obj.index)

        const parsedObj =
                    {
                      name: data.name,
                      speed: data.speed,
                      abilityScoreType: data.ability_bonuses[0].ability_score.name,
                      abilityScoreBonus: data.ability_bonuses[0].bonus,
                      ageDesc: data.age,
                      alignmentDesc: data.alignment
                    }

        raceArray.push(parsedObj)
      }
      return raceArray
      // res.json(raceArray)
    } catch (error) {
      console.error(error)
      await res.status(500).json({ error: 'erver Error' })
    }
  }
}
