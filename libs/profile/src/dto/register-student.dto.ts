import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Matches, 
  MinLength, 
  ValidateIf 
} from 'class-validator';
import { MANEB_ID_PATTERN, REGISTRATION_NUMBER_PATTERN } from '../constants/identifiers';

const clean = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterStudentDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password: string;

  @ApiPropertyOptional({ example: 'M20230013/0220' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @Matches(MANEB_ID_PATTERN, { message: 'manebId is not in the expected format' })
  manebId?: string;

  @ApiPropertyOptional()
  @IsOptional() @Transform(clean) @Matches(REGISTRATION_NUMBER_PATTERN)
  registrationNumber?: string;

  @ApiProperty() @Transform(clean) @IsString() @IsNotEmpty() university: string;
  @ApiPropertyOptional() @IsOptional() @Transform(clean) @IsString() programme?: string;

  @ApiPropertyOptional({ example: 'string' }) @IsOptional() @IsString() nationalId?: string;
  @ApiPropertyOptional({ example: 'string' }) @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional({ example: 'string' }) @IsOptional() @IsString() maritalStatus?: string;
  
  @ApiPropertyOptional({ example: '15/05/2002' })
  @IsOptional() @IsString()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, { message: 'Date must be in DD/MM/YYYY format' })
  @ValidateIf((o) => {
    if (!o.dateOfBirth) return false;
    const [day, month, year] = o.dateOfBirth.split('/');
    return isNaN(new Date(`${year}-${month}-${day}`).getTime());
  }, { message: 'Date of birth must be a real calendar date' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'string' }) @IsOptional() @IsString() @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' }) phone?: string;
}