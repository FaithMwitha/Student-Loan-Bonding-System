import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewDecisionDto {
  @ApiProperty({ example: 'APPROVED' })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({ example: 'Missing documents', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}