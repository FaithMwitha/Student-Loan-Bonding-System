import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VerificationStatus } from '../enums/verification-status.enum';

@Entity('loanss_verifications')
export class VerificationsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', unique: true, nullable: true })
  loanApplicationId?: string;

  @Column({ type: 'varchar', nullable: true })
  studentId?: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.APPROVED,
  })
  status!: VerificationStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}