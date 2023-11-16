import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator'

const abilityTypesArray = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

@Entity()
export class DndRace {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', nullable: false })
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

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'ageDesc is Required' })
    ageDesc: string

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'alignmentDesc is Required' })
    alignmentDesc: string
}
