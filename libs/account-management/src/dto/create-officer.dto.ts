import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateStaffProfileDto } from '@app/profile';

export class CreateOfficerDto extends CreateStaffProfileDto {
  @ApiProperty({ example: 'Peter Phiri' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @IsNotEmpty() @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'officer@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, description: 'Temporary password, shared with the officer' })
  @IsString() @MinLength(8)
  password: string;
}