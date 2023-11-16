import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsInt, IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator'

@Entity()
export class DndClass {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'name is Required' })
    name: string

  @Column({ type: 'integer', nullable: false })
  @IsNotEmpty({ message: 'hitDie is Required' })
  @Max(14, { message: 'hitDie can be at most 14' })
  @Min(4, { message: 'hitDie must be at least 4' }) // setting max and min for custom classes slightly above the range for regular classes (6-12)
    hitDie: number

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'profChoices is Required' })
    profChoices: string
}
