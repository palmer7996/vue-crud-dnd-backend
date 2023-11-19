import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator'

@Entity()
export class DndClass {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Length(1, 50, { message: 'Name must be from $constraint1 to $constraint2 characters' })
  @IsNotEmpty({ message: 'name is Required' })
    name: string

  @Column({ type: 'integer', nullable: false })
  @IsNotEmpty({ message: 'hitDie is Required' })
  @Max(14, { message: 'hitDie can be at most 14' })
  @Min(4, { message: 'hitDie must be at least 4' }) // setting max and min for custom classes slightly above the range for regular classes (6-12)
    hitDie: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Length(1, 255, { message: 'profChoices must be from $constraint1 to $constraint2 characters' })
  @IsNotEmpty({ message: 'profChoices is Required' })
    profChoices: string
}
