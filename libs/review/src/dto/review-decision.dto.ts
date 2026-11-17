import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewDecisionDto {
  @ApiProperty({ example: 'UNDER_REVIEW', enum: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'] })
  @IsIn(['UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ example: 'Missing documents', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}