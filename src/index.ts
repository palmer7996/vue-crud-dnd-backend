import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Request, Response } from 'express'
import { AppDataSource } from './data-source'
import { DndClassData } from './data/DndClassData'
import { DndRaceData } from './data/DndRaceData'

//  obsolete import because routes.ts is obsolete:
//  import { Routes } from './routes'
import { UserController } from './controller/UserController'
import * as createError from 'http-errors'
import { RouteDefinition } from './decorator/RouteDefinition'
import * as cors from 'cors'

import StudentController from './controller/StudentController'

import CharacterController from './controller/CharacterController'

import { authenticateToken } from './middleware/authenticate'
import { DndClassController } from './controller/DndClassController'
import { DndRaceController } from './controller/DndRaceController' // import from middleware

const port = 3004
// cors options
const corsOptions = {
  origin: /localhost\:\d{4,5}$/i, // localhost any 4 or 5  digit port
  credentials: true, // needed to set and return cookies
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  methods: 'GET,PUT,POST,DELETE',
  maxAge: 43200 // 12 hours
}

AppDataSource.initialize().then(async () => {
  // make fetch requests from console works on chrome, but not on Microsoft edge
  // create express app
  const app = express() // comment out

  // alternative, utilizing: import { createExpressServer } from "routing-controllers";
  // const app = createExpressServer({
  //   cors: corsOptions,
  //   controllers: [CharacterController, DndClassController, DndRaceController]
  // })

  app.use(bodyParser.json())

  app.use(cors(corsOptions)) // comment out

  // require headers 'X-Requested-With: XmlHttpRequest' and 'Accept:application/json'
  // app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  //   if (req.xhr && req.accepts('application/json')) next()
  //   else next(createError(406))
  // })

  // add handler for pre-flight options request to ANY path
  app.options('*', cors(corsOptions)) // comment out

  // register express routes from defined application routes
  /*  Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
      const result = (new (route.controller as any)())[route.action](req, res, next)
      if (result instanceof Promise) {
        result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
      } else if (result !== null && result !== undefined) {
        res.json(result)
      }
    })
  }) */

  // Iterate over all our controllers and register our routes
  const controllers: any[] = [UserController, StudentController, CharacterController, DndClassController, DndRaceController] // setup controllers in index
  controllers.forEach((controller) => {
    // This is our instantiated class
    // eslint-disable-next-line new-cap
    const instance = new controller()
    // The prefix saved to our controller
    const path = Reflect.getMetadata('path', controller)
    // Our `routes` array containing all our routes for this controller
    const routes: RouteDefinition[] = Reflect.getMetadata('routes', controller)

    // Iterate over all routes and register them to our express application

    routes.forEach((route) => { // implement authenticateToken before allowing access to any route, if successful authentication it will next to allow the route to be executed
      // eslint-disable-next-line max-len
      app[route.method.toLowerCase()](path + route.param, authenticateToken,
        (req: express.Request, res: express.Response, next: express.NextFunction) => {
          const result = instance[route.action](req, res, next)
          if (result instanceof Promise) {
            result.then((result) => result !== null && result !== undefined ? res.send(result) : next())
              .catch((err) => next(createError(500, err)))
          } else if (result !== null && result !== undefined) res.json(result)
        })
    })
  })

  // setup express app here
  // ...

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404))
  })

  // error handler
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.json({ status: err.status, message: err.message, stack: err.stack.split(/\s{4,}/) })
  })

  // start express server
  app.listen(port)

  // test data for characters and users
  // commented below out, uncomment to create test data

  // insert new users for test

  /*

  await AppDataSource.manager.save(
    AppDataSource.manager.create(User, {
      username: "plebian",
      firstName: 'none',
      lastName: 'none',
      age: 27,
        token: "asdf",
        accessLevel:"read",
    })
  )

 */

  // insert new characters for test

  /*

  await AppDataSource.manager.save(
      AppDataSource.manager.create(Character, {
          name: 'New',
          age: 25,
          gender: 'Female',
          class: 'Wizard',
          race: 'Elf',
          alignment: 'Chaotic Evil',
          userId: 1
      })
  )

*/

  // inserting into race and class db's using premade data gained from api calling dnd5eapi

  /*
  for (const item of DndClassData) {
    await AppDataSource.manager.save(
        AppDataSource.manager.create(DndClass, {
          name: item.name,
          hitDie: item.hitDie,
          profChoices: item.profChoices
        })
    )

  }

  for (const item of DndRaceData) {
    await AppDataSource.manager.save(
        AppDataSource.manager.create(DndRace, {
          name: item.name,
          speed: item.speed,
          abilityScoreType: item.abilityScoreType,
          abilityScoreBonus: item.abilityScoreBonus,
          ageDesc: item.ageDesc,
          alignmentDesc: item.alignmentDesc
        })
    )
  }

*/

  console.log('Open http://localhost:' + port + '/characters to see results')
}).catch(error => console.log(error))
