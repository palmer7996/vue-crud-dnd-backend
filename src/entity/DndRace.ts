import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsNotEmpty, IsOptional, Length, Min} from "class-validator";



@Entity()
export class DndRace {
    @PrimaryGeneratedColumn()
    @IsOptional()
    id: number


    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: 'Name is Required' })
    name: string


    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: 'abilityScoreType is Required' })
    abilityScoreType: string

    @Column({ type: 'integer', nullable: false })
    @IsNotEmpty({ message: 'abilityScoreBonus is Required' })
    abilityScoreBonus: number



    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: 'ageDesc is Required' })
    ageDesc: string

    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: 'alignmentDesc is Required' })
    alignmentDesc: string
}