import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { Character } from './entity/Character'
import { DndRace } from './entity/DndRace'
import { DndClass } from './entity/DndClass'

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'sqlite.db',
  synchronize: true,
  logging: false,
  entities: [User, Character, DndRace, DndClass],
  migrations: [],
  subscribers: []
})
