import { Column, Entity } from 'typeorm';
import { BaseEntity, Role, AccountStatus } from '@app/common';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  
  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  primaryRole!: Role;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status!: AccountStatus;

  @Column({
    name: 'password_reset_code_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Exclude()
  passwordResetCodeHash?: string | null;

  @Column({
    name: 'password_reset_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  passwordResetExpiresAt?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  refreshTokenHash?: string;
}