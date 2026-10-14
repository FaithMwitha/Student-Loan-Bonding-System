import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { FundingType } from '../enums/funding-type.enum';

export class CreateLoanApplicationDto {
  @ApiProperty({ enum: FundingType, example: FundingType.TUITION })
  @IsEnum(FundingType)
  fundingType: FundingType;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountRequested?: number;
}