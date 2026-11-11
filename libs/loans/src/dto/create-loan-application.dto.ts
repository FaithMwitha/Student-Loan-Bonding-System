import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsInt, 
  Min, 
  Max,
  Matches,
  ValidateIf,
  Allow
} from 'class-validator';
import { Type } from 'class-transformer';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
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

  @ApiProperty({ 
    required: false, 
    example: '15/05/2002',
    description: 'Date of birth in DD/MM/YYYY format'
  })
  @IsOptional()
  @IsString()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, { 
    message: 'Date must be in DD/MM/YYYY format' 
  })
  @ValidateIf((o) => {
    if (!o.dateOfBirth) return false;
    const [day, month, year] = o.dateOfBirth.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    return isNaN(date.getTime());
  }, { message: 'Date of birth must be a real calendar date' })
  dateOfBirth?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
  phoneNumber?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  postalAddress?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Guarantor phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
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
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Next of kin phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
  nextOfKinPhone?: string;

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

  @ApiProperty({ 
    type: 'array', 
    items: { type: 'string', format: 'binary' },
    description: 'Upload exactly 6 documents in this order:\n1. Applicant National ID\n2. Guarantor National ID\n3. Student ID\n4. Map to Home of Origin\n5. Guarantor Consent Form\n6. Bank Deposit Slip',
    required: true
  })
  @Allow()
  documents?: any;

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