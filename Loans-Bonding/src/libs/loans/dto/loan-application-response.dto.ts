import { ApiProperty } from '@nestjs/swagger';
import { FundingType } from '../enums/funding-type.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

export class LoanApplicationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() studentId: string;
  @ApiProperty({ enum: FundingType }) fundingType: FundingType;
  @ApiProperty({ enum: ApplicationStatus }) status: ApplicationStatus;
  @ApiProperty({ required: false }) amountRequested?: number;
  @ApiProperty({ required: false }) rejectionReason?: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}