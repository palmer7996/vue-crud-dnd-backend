import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, Length, Matches, MaxLength } from 'class-validator'

const emailOptions = {
  allow_display_name: false,
  ignore_max_length: false,
  allow_ip_domain: false,
  // additional validation, e.g. disallowing certain valid emails that are rejected by GMail.
  domain_specific_validation: true
}

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'nvarchar', length: 50, nullable: false })
  @Length(1, 50, { message: 'Given Name must be from $constraint1 to $constraint2 characters ' })
  @IsNotEmpty({ message: 'Given Name is Required' })
    givenName: string

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  @MaxLength(50, { message: 'Family Name must be at most $constraint1 characters ' })
  @IsOptional()
    familyName: string

  @Column({ type: 'varchar', length: 320, nullable: false })
  @IsEmail(emailOptions, { message: 'Email must be in the proper format' })
  @IsNotEmpty({ message: 'Email is Required' })
    email: string // serves as username

  @Column({ type: 'varchar', length: 17, nullable: false })
  @Length(7, 17, { message: 'Phone Number must be from $constraint1 to $constraint2 characters' })
  @IsPhoneNumber('CA', { message: 'Phone Number Must be a valid Canadian format' })
  @IsNotEmpty({ message: 'Phone number is Required' })
    phone: string

  @Column({ type: 'varchar', length: 150, nullable: true })
  @MaxLength(150, { message: 'Address can be at most $constraint1 characters ' })
  @IsOptional()
    address: string

  @Column('nvarchar', { length: 25, nullable: false, select: false /* hide password from regular query */ })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    { message: 'Password must contain uppercase, lowercase, and numbers' })
  @Length(8, 25, { message: 'Password must be from $constraint1 to $constraint2 characters ' })
  @IsNotEmpty({ message: 'Password is Required' })
    password: string
}
