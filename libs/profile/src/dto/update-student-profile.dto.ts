import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'M20230013/0220' })
  @IsOptional()
  @IsString()
  manebId?: string;

  @ApiPropertyOptional({ example: 'University of Malawi' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  programme?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Single' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: '15/05/2002' })
  @IsOptional()
  @IsString()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, { 
    message: 'Date must be in DD/MM/YYYY format' 
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
  phone?: string;

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
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
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
  @Matches(/^(099|098|088|089)\d{7}$/, { message: 'Invalid phone' })
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
  @Matches(/^\d{8,16}$/, { message: 'Bank account number must be between 8 and 16 digits and contain only numbers.' })
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  bankBranch?: string;
}