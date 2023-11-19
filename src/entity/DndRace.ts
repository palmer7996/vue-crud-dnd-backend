import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsIn, IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator'

const abilityTypesArray = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

@Entity()
export class DndRace {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Length(1, 50, { message: 'Name must be from $constraint1 to $constraint2 characters' })
  @IsNotEmpty({ message: 'name is Required' })
    name: string

  @Column({ type: 'integer', nullable: false })
  @IsNotEmpty({ message: 'speed is Required' })
  @Max(50, { message: 'speed can be at most 50' })
  @Min(20, { message: 'speed must be at least 20' }) // setting max and min speed for custom races
    speed: number

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'abilityScoreType is Required' })
  @IsIn(abilityTypesArray, { message: 'Please choose between the options: ' + abilityTypesArray.toString() })
    abilityScoreType: string

  @Column({ type: 'integer', nullable: false })
  @IsNotEmpty({ message: 'abilityScoreBonus is Required' })
  @Max(3, { message: 'abilityScoreBonus can be at most 3' })
  @Min(1, { message: 'abilityScoreBonus must be at least 1' }) // setting max and min abilityScoreBonus for custom races
    abilityScoreBonus: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Length(1, 255, { message: 'ageDesc must be from $constraint1 to $constraint2 characters' })
  @IsNotEmpty({ message: 'ageDesc is Required' })
    ageDesc: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Length(1, 255, { message: 'alignmentDesc must be from $constraint1 to $constraint2 characters' })
  @IsNotEmpty({ message: 'alignmentDesc is Required' })
    alignmentDesc: string
}
