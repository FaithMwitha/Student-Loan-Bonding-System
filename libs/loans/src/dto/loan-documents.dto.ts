import { ApiProperty } from '@nestjs/swagger';

export class FirstTimeDocumentsDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '1. Applicant National ID' })
  applicantId: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '2. Guarantor National ID' })
  guarantorId: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '3. Student ID' })
  studentId: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '4. Map to Home of Origin' })
  mapToHome: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '5. Guarantor Consent Form' })
  guarantorConsent: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '6. Bank Deposit Slip' })
  bankSlip: any;
}

export class ReturningDocumentsDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '1. Map to Home of Origin (New)' })
  mapToHome: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '2. Guarantor Consent Form (New)' })
  guarantorConsent: any;

  @ApiProperty({ type: 'string', format: 'binary', description: '3. Bank Deposit Slip (New)' })
  bankSlip: any;
}