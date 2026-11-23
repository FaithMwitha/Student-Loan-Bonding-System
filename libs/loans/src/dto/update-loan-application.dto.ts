import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsInt, 
  Min, 
  Max,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { FundingType } from '../enums/funding-type.enum';

export class UpdateLoanApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
  guarantorPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
  nextOfKinPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankBranch?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  yearOfStudy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personalStatement?: string;

  @ApiPropertyOptional({ enum: FundingType })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;
}