import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';
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
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(8) yearOfStudy?: number;
}