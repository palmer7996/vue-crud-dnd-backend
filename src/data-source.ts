import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { Student } from './entity/Student'
import { Character } from './entity/Character'
import {DndRace} from "./entity/DndRace";
import {DndClass} from "./entity/DndClass";

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'sqlite.db',
  synchronize: true,
  logging: false,
  entities: [User, Student, Character, DndRace, DndClass],
  migrations: [],
  subscribers: []
})
