import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
  @ApiProperty({
    enum: FundingType,
    example: FundingType.TUITION,
    description: 'Select the fund type here (Tuition, Upkeep, or Both). The system will calculate the final amount automatically.',
  })
  @IsEnum(FundingType)
  fundingType: FundingType;

  @ApiProperty({
    example: 'UNIMA',
    description: 'The university the student is attending (e.g., UNIMA, MZUNI)',
  })
  @IsString()
  university: string;

  // Note: amountRequested has been removed. The backend handles the math!

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

  @ApiProperty({ required: false, example: 'Kanyenje full primary school post office box 22 Mvera Dowa' })
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

  @ApiProperty({ required: false, example: 'Chidothi traditional authority mkukula dowa' })
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

  @ApiProperty({ required: false, example: 'We are more children in my family hence my parents cannot manage to pay my fees...' })
  @IsOptional()
  @IsString()
  personalStatement?: string;

  // --- Documents ---
  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: ['Guardian National ID.pdf', 'Map to Home of Origin.jpg', 'Bank Deposit Slip.pdf'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}