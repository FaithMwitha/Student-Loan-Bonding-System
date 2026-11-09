import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;
}