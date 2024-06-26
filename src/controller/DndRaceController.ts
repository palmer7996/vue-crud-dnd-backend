import { Controller } from '../decorator/Controller'
import { NextFunction, Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Route } from '../decorator/Route'
import { validate, ValidatorOptions, ValidationError } from 'class-validator'
import { DndRace } from '../entity/DndRace'
import { Like } from 'typeorm'

@Controller('/info/races')
export class DndRaceController {
  private readonly raceRepo = AppDataSource.getRepository(DndRace)

  private readonly validOptions: ValidatorOptions = {
    stopAtFirstError: true,
    skipMissingProperties: false,
    validationError: { target: false, value: false }
  }

  @Route('get', '/:id*?') // the *? makes the param optional - see https://expressjs.com/en/guide/routing.html#route-paramters
  async read (req: Request, res: Response, next: NextFunction): Promise<DndRace | DndRace[]> {
    if (req.params.id) return await this.raceRepo.findOneBy({ id: req.params.id })
    else {
      const findOptions: any = { order: {} } // prepare order and where props
      const existingFields = this.raceRepo.metadata.ownColumns.map((col) => col.propertyName)

      const sortField: string = existingFields.includes(req.query.sortby) ? req.query.sortby : 'id'
      findOptions.order[sortField] = req.query.reverse ? 'DESC' : 'ASC'
      // findOption looks like { order{ phone: 'DESC' } }
      if (req.query.searchwherelike) {
        findOptions.where = []
        existingFields.forEach((column) => {
          findOptions.where.push({ [column]: Like('%' + req.query.searchwherelike + '%') })
        })
      }
      return await this.raceRepo.find(findOptions)
    }
  }

  @Route('delete', '/:id')
  async delete (req: Request, res: Response, next: NextFunction): Promise<DndRace> {
    const raceToRemove = await this.raceRepo.findOneBy({ id: req.params.id })
    // res.statusCode = 204 --No Content - browser will complain since we are actually returning content
    if (raceToRemove) return await this.raceRepo.remove(raceToRemove)
    else next()
  }

  @Route('post')
  async create (req: Request, res: Response, next: NextFunction): Promise<DndRace | ValidationError[] | { error: string }> {
    // commented it out to make updating easier by using post for creates and updates
    // if (req.body.id) {
    //   return res.status(422).json({ error: 'You cannot select an ID when creating a race' })
    // }

    const newRace = Object.assign(new DndRace(), req.body)
    const violations = await validate(newRace, this.validOptions)
    if (violations.length) {
      res.statusCode = 422 // Unprocessable Entity
      return violations
    } else {
      res.statusCode = 201
      return await this.raceRepo.save(newRace)
    }
  }

  // put not being used because currently no userid linked to race because made for admins only
  @Route('put')
  async update (req: Request, res: Response, next: NextFunction): Promise<DndRace | ValidationError[]> {
    const raceToUpdate = await this.raceRepo.preload(req.body)
    // Extra validation - ensure the id param matched the id submitted in the body
    if (!raceToUpdate || raceToUpdate.id.toString() !== req.params.id) next() // pass the buck until 404 error is sent
    else {
      const violations = await validate(raceToUpdate, this.validOptions)
      if (violations.length) {
        res.statusCode = 422 // Unprocessable Entity
        return violations
      } else {
        return await this.raceRepo.save(raceToUpdate)
      }
    }
  }
}
