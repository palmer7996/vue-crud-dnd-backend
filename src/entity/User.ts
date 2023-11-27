import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, Unique } from 'typeorm'
import { IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator'
import { Character } from './Character'

@Entity()
@Unique(['username'])
export class User {
  // currently not allowing userdb to be edited, user's are simply manually inputted into the database

  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50, { message: 'username must be from $constraint1 to $constraint2 characters ' })
  @IsNotEmpty({ message: 'username is required' })
    username: string

  @Column({ type: 'varchar', width: 50 })
  @Length(7, 50, { message: 'username must be from $constraint1 to $constraint2 characters ' })
    password: string

  @Column({ type: 'varchar', width: 50 })
  @IsNotEmpty({ message: 'Token is required' })
    token: string

  @Column({ type: 'varchar', width: 50 })
  @IsNotEmpty({ message: 'Token is required' })
    accessLevel: string
  // accessLevels = write, read or admin

  // optional stuff that doesn't matter

  @Column({ type: 'varchar', length: 50 })
  // @Length(1, 50, { message: 'First Name must be from $constraint1 to $constraint2 characters ' })
  @IsOptional()
  // @IsNotEmpty({ message: 'First Name is required' })
    firstName: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  @MaxLength(50, { message: 'Last Name can be at most $constraint1 characters' })
  @IsOptional()
    lastName: string

  @Column({ type: 'integer', width: 3 })
  @IsOptional()
    age: number

  // make a 1-1 connection between user and character (currently not in use)

  // @OneToMany(() => Character, (character) => character.user)
  // characters: Character[];
}
