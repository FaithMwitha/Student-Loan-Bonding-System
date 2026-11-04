import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStaffProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) staffNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
}