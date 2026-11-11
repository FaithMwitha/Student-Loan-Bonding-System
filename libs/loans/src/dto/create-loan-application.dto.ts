import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsInt, 
  Min, 
  Max 
} from 'class-validator';
import { Type } from 'class-transformer';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
  // --- Personal & Contact ---
  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  postalAddress?: string;

  // --- Guarantor & Next of Kin ---
  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  // --- Bank Details ---
  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  bankBranch?: string;

  // --- Academic & Statement ---
  @ApiProperty({ 
    example: 1, 
    minimum: 1, 
    maximum: 5, 
    description: 'Year of study (1 to 5)' 
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  yearOfStudy: number;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  personalStatement?: string;

  // --- Documents ---
  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: ['string'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  // --- FINAL STEP: FUNDING TYPE ---
  @ApiProperty({
    required: false,
    enum: FundingType,
    example: FundingType.TUITION,
    description: 'Select the fund type here. The system will calculate the final amount automatically.',
  })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;
}