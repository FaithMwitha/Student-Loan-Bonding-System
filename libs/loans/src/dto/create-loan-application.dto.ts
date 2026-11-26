import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsInt, 
  Min, 
  Max,
  Matches,
  Allow,
  ValidateIf
} from 'class-validator';
import { Type } from 'class-transformer';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
  @ApiProperty({ example: 1, minimum: 1, maximum: 5, description: 'Year of study (1 to 5)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  yearOfStudy: number;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional()
  @IsString()
  personalStatement?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  postalAddress?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  guarantorName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  @ValidateIf((o) => o.guarantorPhone !== '' && o.guarantorPhone !== undefined)
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
  guarantorPhone?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  guarantorAddress?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  nextOfKinName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  @ValidateIf((o) => o.nextOfKinPhone !== '' && o.nextOfKinPhone !== undefined)
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
  nextOfKinPhone?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  bankName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  bankAccountName?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  @ValidateIf((o) => o.bankAccountNumber !== '' && o.bankAccountNumber !== undefined)
  @Matches(/^\d{8,16}$/, { message: 'Bank account number must be between 8 and 16 digits and contain only numbers.' })
  bankAccountNumber?: string;

  @ApiProperty({ required: false, example: 'string' })
  @IsOptional() @IsString()
  bankBranch?: string;

  @ApiProperty({ 
    type: 'array', 
    items: { type: 'string', format: 'binary' },
    description: 'Upload exactly 5 documents:\n1. Applicant National ID\n2. Guarantor National ID\n3. Student ID\n4. Map to Home of Origin\n5. Guarantor Consent Form',
    required: true
  })
  @Allow()
  documents?: any;

  @ApiProperty({ enum: FundingType, example: FundingType.TUITION, required: false })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;
}