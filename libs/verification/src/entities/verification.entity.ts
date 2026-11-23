import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VerificationStatus } from '../enums/verification-status.enum';

@Entity('verifications')
export class VerificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true, nullable: true })
  loanApplicationId?: string;

  @Column({ type: 'varchar', nullable: true })
  studentId?: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status!: VerificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  remarks!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}