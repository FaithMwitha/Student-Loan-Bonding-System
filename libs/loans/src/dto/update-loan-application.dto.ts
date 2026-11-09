import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsArray, 
  IsInt, 
  Min, 
  Max 
} from 'class-validator';
import { Type } from 'class-transformer';
import { FundingType } from '../enums/funding-type.enum';

export class UpdateLoanApplicationDto {
  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  postalAddress?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankBranch?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  yearOfStudy?: number;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  personalStatement?: string;

  @ApiPropertyOptional({ type: [String], example: ['string'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiPropertyOptional({ enum: FundingType, example: FundingType.TUITION })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;
}