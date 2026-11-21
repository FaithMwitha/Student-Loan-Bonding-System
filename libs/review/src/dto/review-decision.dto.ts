
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewDecisionDto {
  @ApiProperty({
    description: 'Review decision status. Must be UNDER_REVIEW, APPROVED, or REJECTED.',
    example: 'UNDER_REVIEW',
    enum: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  })
  @IsIn(['UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Reason for rejection. Optional when providing a review decision.',
    example: 'Missing documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}