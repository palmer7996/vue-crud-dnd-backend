import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  Length,
  Max,
  Min,
  ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate, MaxLength
} from 'class-validator'
import { AppDataSource } from '../data-source'
import { DndRace } from './DndRace'
import { DndClass } from './DndClass'
const genderArray = ['Male', 'Female', 'Non-binary', 'Other']

const alignmentArray = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
]

// get class and race array from the database
// const raceRepo = AppDataSource.getRepository(DndRace)
// const classRepo = AppDataSource.getRepository(DndClass)

// previous method of validation, works for original set, not with custom races/classes
// const raceArray = [
//   'Dragonborn', 'Dwarf', 'Elf',
//   'Gnome', 'Half-Elf', 'Half-Orc',
//   'Halfling', 'Human', 'Tiefling'
// ]
//
// const classArray = [
//   'Barbarian', 'Bard',
//   'Cleric', 'Druid',
//   'Fighter', 'Monk',
//   'Paladin', 'Ranger',
//   'Rogue', 'Sorcerer',
//   'Warlock', 'Wizard'
// ]

export class validatorParent {
  validValues: string[] = null
  async validate (value: any, args: ValidationArguments): Promise<boolean> {
    const category = args.constraints[0] // only a single constraint which is the category name as the first position
    this.validValues = await this.fetchValuesFromDatabase(category) // assign validValues to be used in the default message
    return this.validValues.includes(value)
  }

  protected async fetchValuesFromDatabase (type: string): Promise<string[]> {
    const repo = AppDataSource.getRepository(type === 'class' ? DndClass : DndRace)
    const result = await repo.find()
    return result.map((item) => item.name)
  }
}

// used to be one validatorConstraint for both, but the modification of the instance of validValues messed up the defaultMessage (displayed raceNames as the message for both class and race)
@ValidatorConstraint({ name: 'isValidClassValue', async: true })
export class isValidClassValue extends validatorParent implements ValidatorConstraintInterface {
  defaultMessage (args: ValidationArguments): string {
    const category: string = args.constraints[0]
    const invalidValue: string = args.value // Assuming args.value is the value related to this validator constraint in this case
    // console.log(this.validValues)
    return `Please choose a valid ${category} from the list: ${this.validValues.toString()}. The provided value (${invalidValue}) is not valid.`
  }
}
@ValidatorConstraint({ name: 'isValidRaceValue', async: true })
export class isValidRaceValue extends validatorParent implements ValidatorConstraintInterface {
  defaultMessage (args: ValidationArguments): string {
    const category: string = args.constraints[0]
    const invalidValue: string = args.value
    // console.log(this.validValues)
    return `Please choose a valid ${category} from the list: ${this.validValues.toString()}. The provided value (${invalidValue}) is not valid.`
  }
}

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Length(1, 50, { message: 'Name must be from $constraint1 to $constraint2 characters ' })
  @IsNotEmpty({ message: 'Name is Required' })
    name: string

  @Column({ type: 'integer', nullable: false })
  @Min(0, { message: 'Age must be at least 0' })
  @IsNotEmpty({ message: 'Age is Required' })
    age: number

  @Column({ type: 'varchar', nullable: false })
  @IsIn(['Male', 'Female', 'Non-binary', 'Other'], { message: 'Please choose between the options: ' + genderArray.toString() })
  @IsNotEmpty({ message: 'Gender is Required' })
    gender: string

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'Class is Required' })
  // @IsIn(classArray, { message: 'Please choose between the options: ' })
  @Validate(isValidClassValue, ['class'])
    class: string

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'Race is Required' })
  // @IsIn(raceArray, { message: 'Please choose between the options: ' + raceArray.toString() })
  @Validate(isValidRaceValue, ['race'])
    race: string

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'Alignment is Required' })
  @IsIn(alignmentArray, { message: 'Please choose between the options: ' + alignmentArray.toString() })
    alignment: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @MaxLength(150, { message: 'Description can be at most $constraint1 characters ' })
  // @IsNotEmpty({ message: 'Description is required if provided' }) // to prevent just sending an empty string
    description?: string

  // could implement stats with FK, currently not implementing stats

  // autogenerated column when the character is created
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    dateCreated: Date

  // id related to the user
  @Column({ type: 'integer', nullable: true })
  @IsOptional()
    userId: number

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @Min(1, { message: 'Minimum value is 1' })
  @Max(20, { message: 'Maximum value is 20' })
    strength?: number

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @Min(1, { message: 'Minimum value is 1' })
  @Max(20, { message: 'Maximum value is 20' })
    dexterity?: number

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @Min(1, { message: 'Minimum value is 1' })
  @Max(20, { message: 'Maximum value is 20' })
    constitution?: number

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @Min(1, { message: 'Minimum value is 1' })
  @Max(20, { message: 'Maximum value is 20' })
    intelligence?: number

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @Min(1, { message: 'Minimum value is 1' })
  @Max(20, { message: 'Maximum value is 20' })
    wisdom?: number

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @Min(1, { message: 'Minimum value is 1' })
  @Max(20, { message: 'Maximum value is 20' })
    charisma?: number

  // no longer in use
  // allow user to only input race/class names found in the race and class databases that are edited by the admin
  // @BeforeInsert()

  async validateField (): Promise<void> {
    const validClassValues = await this.fetchClassNamesFromDB()
    const validRaceValues = await this.fetchRaceNamesFromDB()
    if (!validClassValues.includes(this.class)) {
      throw new Error('Please choose between the options: ' + validClassValues)
    }
    if (!validRaceValues.includes(this.race)) {
      throw new Error('Please choose between the options: ' + validRaceValues)
    }
  }

  private async fetchClassNamesFromDB (): Promise<string[]> {
    const classRepo = AppDataSource.getRepository(DndClass)
    const result = await classRepo.find()
    return result.map(item => item.name)
  }

  private async fetchRaceNamesFromDB (): Promise<string[]> {
    const classRepo = AppDataSource.getRepository(DndRace)
    const result = await classRepo.find()
    return result.map(item => item.name)
  }

  // tried as a foreign key to link to user record, caused issues

  // @ManyToOne(() => User, (user) => user.characters, { nullable: true })
  // @JoinColumn({ name: 'userId' }) // specifies the foreign key column name
  // @IsOptional()
  // user: User;
}
