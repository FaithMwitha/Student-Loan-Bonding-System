import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({
    description: 'Transaction reference from the payment provider',
    example: 'TXN-20241027-0001',
  })
  @IsString()
  @IsNotEmpty()
  transactionReference: string;

  @ApiProperty({
    description: 'Payment status reported by the provider',
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
  })
  @IsString()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  status: string;

  @ApiProperty({
    description: 'Payment amount (optional — most providers include it)',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;
}
