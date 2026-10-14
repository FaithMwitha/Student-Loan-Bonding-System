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
    default: ApplicationStatus.SUBMITTED,
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

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}