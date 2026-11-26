import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { MANEB_ID_PATTERN } from '../constants/identifiers';

export class RegisterStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'M20230013/0220' })
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value))
  @Matches(MANEB_ID_PATTERN, { message: 'manebId is not in the expected format' })
  manebId: string;

  @ApiProperty({ example: 'University of Malawi' })
  @IsString()
  university: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  programme?: string;

  @ApiProperty({ example: '15/05/2002' })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'dateOfBirth must be DD/MM/YYYY' })
  dateOfBirth: string;

  @ApiPropertyOptional({ example: '0991234567' })
  @IsOptional()
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
  phone?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8,16}$/, { message: 'Bank account number must be between 8 and 16 digits and contain only numbers.' })
  bankAccountNumber?: string;
}