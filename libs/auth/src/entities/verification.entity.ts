import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../common/src';
import { UserEntity } from '../../../users/src/entities/users.entity';
import { Verification } from '../enums/verification.enums';

@Entity('verifications')
@Index(['userId', 'purpose'])
export class VerificationEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  otpCodeHash!: string;

  @Column({
    type: 'enum',
    enum: Verification,
  })
  purpose!: Verification;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed!: boolean;
}