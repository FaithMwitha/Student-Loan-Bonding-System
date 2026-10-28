import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('email_verifications')
@Index(['userId'])
export class EmailVerification extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ name: 'code_hash', type: 'varchar' }) codeHash: string;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt: Date;
  @Column({ type: 'int', default: 0 }) attempts: number;
  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true }) consumedAt: Date | null;
}