import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm'
import { IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator'
import { Character } from './Character'

@Entity()
export class User {
  // currently not allowing userdb to be edited, user's are simply manually inputted into the database

  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50, { message: 'username must be from $constraint1 to $constraint2 characters ' })
  @IsNotEmpty({ message: 'username is required' })
    username: string

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50, { message: 'First Name must be from $constraint1 to $constraint2 characters ' })
  @IsNotEmpty({ message: 'First Name is required' })
    firstName: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  @MaxLength(50, { message: 'Last Name can be at most $constraint1 characters' })
  @IsOptional()
    lastName: string

  @Column({ type: 'integer', width: 3 })
    age: number

  // these would be manually inputted

  @Column({ type: 'varchar', width: 50 })
    token: string

  @Column({ type: 'varchar', width: 50 })
    accessLevel: string
  // accessLevels = write, read or admin

  // make a 1-1 connection between user and character (currently not in use)

  // @OneToMany(() => Character, (character) => character.user)
  // characters: Character[];
}
