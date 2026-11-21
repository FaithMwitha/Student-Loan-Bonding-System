import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsInt, 
  Min, 
  Max,
  Matches,
  ValidateIf
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

  @ApiPropertyOptional({ 
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

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
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
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Guarantor phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
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
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Next of kin phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
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

  @ApiPropertyOptional({ enum: FundingType, example: FundingType.TUITION })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;
}