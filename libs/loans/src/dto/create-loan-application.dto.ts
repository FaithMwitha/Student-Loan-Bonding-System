import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
  // --- Personal & Contact ---
  @ApiProperty({ required: false, example: 'OWSH1R3N' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false, example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, example: 'Single' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiProperty({ required: false, example: '2003-09-21' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, example: '0985053589' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false, example: 'Box 22 Mvera Dowa' })
  @IsOptional()
  @IsString()
  postalAddress?: string;

  // --- Guarantor & Next of Kin ---
  @ApiProperty({ required: false, example: 'Nachulu Chunga' })
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiProperty({ required: false, example: '0995486773' })
  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @ApiProperty({ required: false, example: 'Chidothi, Dowa' })
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @ApiProperty({ required: false, example: 'Ruth chibwira' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiProperty({ required: false, example: '0991458535' })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  // --- Bank Details ---
  @ApiProperty({ required: false, example: 'National Bank of Malawi' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ required: false, example: 'PAUL NANGANTANI' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiProperty({ required: false, example: '1013436297' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({ required: false, example: 'Zomba Service Centre' })
  @IsOptional()
  @IsString()
  bankBranch?: string;

  // --- Academic & Statement ---
  @ApiProperty({ required: false, example: 'Bachelor Of Education (computer Science)' })
  @IsOptional()
  @IsString()
  programme?: string;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsNumber()
  yearOfStudy?: number;

  @ApiProperty({ required: false, example: 'I am requesting this loan because...' })
  @IsOptional()
  @IsString()
  personalStatement?: string;

    // --- Documents ---
  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: [
      'Applicant National ID.pdf',
      'Guarantor National ID.pdf',
      'Map to Home of Origin.jpg',
      'Guarantor Consent Form.pdf',
      'Bank Deposit Slip.pdf',
      'Affidavit.pdf'
    ] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  // --- FINAL STEP: UNIVERSITY & FUNDING TYPE ---
  @ApiProperty({
    required: false,
    example: 'UNIMA',
    description: 'The university the student is attending (Final step)',
  })
  @IsOptional()
  @IsString()
  university?: string;

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