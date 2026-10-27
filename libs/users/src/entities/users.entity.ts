import { Column, Entity } from 'typeorm';
import { BaseEntity,Role, AccountStatus} from '@app/common'
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  // ...name,  email, passwordHash stay the same...
  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  refreshTokenHash?: string;
//Adding a new column for OTP code
@Column({ type: 'boolean', default: false })
isEmailVerified!: boolean;

@Column({ type: 'varchar', length: 64, nullable: true })
@Exclude()
otpCode!: string | null;

@Column({ type: 'timestamptz', nullable: true })
otpExpiresAt!: Date | null;

@Column({ type: 'varchar', length: 64, nullable: true })
@Exclude()
passwordResetCodeHash!: string | null;

@Column({ type: 'timestamptz', nullable: true })
passwordResetExpiresAt!: Date | null;

}
