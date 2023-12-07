import { Controller } from '../decorator/Controller'
import { NextFunction, Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Route } from '../decorator/Route'
import { validate, ValidatorOptions, ValidationError } from 'class-validator'
import { DndClass } from '../entity/DndClass'
import { Like } from 'typeorm'
@Controller('/info/classes')
export class DndClassController {
  private readonly classRepo = AppDataSource.getRepository(DndClass)

  private readonly validOptions: ValidatorOptions = {
    stopAtFirstError: true,
    skipMissingProperties: false,
    validationError: { target: false, value: false }
  }

  @Route('get', '/:id*?') // the *? makes the param optional - see https://expressjs.com/en/guide/routing.html#route-paramters
  async read (req: Request, res: Response, next: NextFunction): Promise<DndClass | DndClass[]> {
    if (req.params.id) return await this.classRepo.findOneBy({ id: req.params.id })
    else {
      const findOptions: any = { order: {} } // prepare order and where props
      const existingFields = this.classRepo.metadata.ownColumns.map((col) => col.propertyName)

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
      return await this.classRepo.find(findOptions)
    }
  }

  @Route('delete', '/:id')
  async delete (req: Request, res: Response, next: NextFunction): Promise<DndClass> {
    const classToRemove = await this.classRepo.findOneBy({ id: req.params.id })
    // res.statusCode = 204 --No Content - browser will complain since we are actually returning content
    if (classToRemove) return await this.classRepo.remove(classToRemove)
    else next()
  }

  @Route('post')
  // eslint-disable-next-line max-len
  async create (req: Request, res: Response, next: NextFunction): Promise<DndClass | ValidationError[] | { error: string }> {
    // commented it out to make updating easier by using post for creates and updates
    // if (req.body.id) { // don't allow it to be included as a parameter because it could edit already existing classes
    //   return res.status(422).json({ error: 'You cannot select an ID when creating a class' })
    // }

    const newClass = Object.assign(new DndClass(), req.body)
    const violations = await validate(newClass, this.validOptions)
    if (violations.length) {
      res.statusCode = 422 // Unprocessable Entity
      return violations
    } else {
      return await this.classRepo.save(newClass)
    }
  }

  // put not being used because currently no userid linked to race because made for admins only
  @Route('put')
  async update (req: Request, res: Response, next: NextFunction): Promise<DndClass | ValidationError[]> {
    const classToUpdate = await this.classRepo.preload(req.body)
    // Extra validation - ensure the id param matched the id submitted in the body
    if (!classToUpdate || classToUpdate.id.toString() !== req.params.id) next() // pass the buck until 404 error is sent
    else {
      const violations = await validate(classToUpdate, this.validOptions)
      if (violations.length) {
        res.statusCode = 422 // Unprocessable Entity
        return violations
      } else {
        return await this.classRepo.save(classToUpdate)
      }
    }
  }
}
