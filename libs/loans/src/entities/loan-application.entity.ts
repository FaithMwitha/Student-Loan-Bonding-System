import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FundingType } from '../enums/funding-type.enum';
import { ApplicationStatus } from '../enums/application-status.enum';

@Entity('loan_applications')
export class LoanApplication {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'student_id' })
  studentId: string;

  @ApiProperty({ enum: FundingType })
  @Column({ type: 'enum', enum: FundingType, name: 'funding_type' })
  fundingType: FundingType;

  @ApiProperty({ enum: ApplicationStatus })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING_PAYMENT,
  })
  status: ApplicationStatus;

  @ApiProperty({ required: false })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'amount_requested',
  })
  amountRequested?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason?: string;

  // --- Personal & Contact ---
  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'national_id' })
  nationalId?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  gender?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'marital_status' })
  maritalStatus?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'postal_address' })
  postalAddress?: string;

  // --- Guarantor & Next of Kin ---
  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'guarantor_name' })
  guarantorName?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'guarantor_phone' })
  guarantorPhone?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'guarantor_address' })
  guarantorAddress?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'next_of_kin_name' })
  nextOfKinName?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'next_of_kin_phone' })
  nextOfKinPhone?: string;

  // --- Bank Details ---
  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'bank_name' })
  bankName?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'bank_account_name' })
  bankAccountName?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'bank_account_number' })
  bankAccountNumber?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true, name: 'bank_branch' })
  bankBranch?: string;

  // --- Academic & Statement ---
  @ApiProperty({ required: false })
  @Column({ nullable: true })
  programme?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true, name: 'year_of_study' })
  yearOfStudy?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true, name: 'personal_statement' })
  personalStatement?: string;

  // --- Documents ---
  @ApiProperty({ required: false, type: [String] })
  @Column({ type: 'simple-array', nullable: true })
  documents?: string[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}