import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
  @ApiProperty({
    enum: FundingType,
    example: FundingType.TUITION,
    description: 'The type of funding requested',
  })
  @IsEnum(FundingType)
  fundingType: FundingType;

  @ApiProperty({
    example: 500000,
    required: false,
    description: 'The amount requested (optional)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountRequested?: number;
}