import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsNotEmpty, IsOptional, Length, Max, Min} from "class-validator";



@Entity()
export class DndClass {
    @PrimaryGeneratedColumn()
    @IsOptional()
    id: number

    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: 'Name is Required' })
    name: string

    @Column({ type: 'integer', nullable: false })
    @Min(4, { message: 'Hit die must be at least 4' }) //setting max and min for custom classes slightly above the range for regular classes (6-12)
    @Max(14, { message: 'Hit die can be at most 14' })
    @IsNotEmpty({ message: 'Hit die is Required' })
    hitDie: number

    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: 'profChoices is Required' })
    profChoices: string

}