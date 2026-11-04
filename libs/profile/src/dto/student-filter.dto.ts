import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { UNIVERSITIES } from '../constants/universities';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class StudentFilterDto {
  @ApiPropertyOptional({ enum: UNIVERSITIES })
  @IsOptional() @Transform(upper) @IsIn(UNIVERSITIES) university?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) programme?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(8) yearOfStudy?: number;

  @ApiPropertyOptional({ description: 'Part of a MANEB ID or registration number' })
  @IsOptional() @IsString() @MaxLength(40) search?: string;

  @ApiPropertyOptional({ description: 'Only students who have no registration number yet' })
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  missingRegistrationNumber?: boolean;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
}