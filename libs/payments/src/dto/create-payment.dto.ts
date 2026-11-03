import { IsNotEmpty, IsNumber, IsString, IsUUID, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Loan application UUID the payment is for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  applicationId: string;

  @ApiProperty({
    description: 'Payment amount — fixed at K10,000',
    example: 10000,
    enum: [10000],
  })
  @IsNumber()
  @Equals(10000, { message: 'Payment amount must be exactly K10,000' })
  amount: number;

  @ApiProperty({
    description: 'Payment method used',
    example: 'AIRTEL_MONEY',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    description: 'Unique transaction reference from the payment provider',
    example: 'TXN-20241027-0001',
  })
  @IsString()
  @IsNotEmpty()
  transactionReference: string;
}
