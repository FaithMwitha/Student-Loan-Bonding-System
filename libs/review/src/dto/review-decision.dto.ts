import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsBoolean } from 'class-validator';

export class ReviewDecisionDto {
  @ApiProperty({
    description: 'Review decision status. Must be APPROVED or REJECTED.',
    example: 'REJECTED',
    enum: ['APPROVED', 'REJECTED'],
  })
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Reason for rejection. Optional when providing a review decision.',
    example: 'Missing documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({
    description: 'Set to true if the student is allowed to fix the issue and reapply.',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowReapply?: boolean;
}