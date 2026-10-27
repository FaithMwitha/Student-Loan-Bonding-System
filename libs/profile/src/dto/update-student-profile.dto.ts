import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) bankName?: string;

  // 6-20 digits is a guess; adjust to the banks your students use
  @ApiPropertyOptional() @IsOptional() @Matches(/^\d{6,20}$/) bankAccountNumber?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) programme?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(8) yearOfStudy?: number;
}