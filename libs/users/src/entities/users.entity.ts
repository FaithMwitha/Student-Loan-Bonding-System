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

  @Column({name:'email_verified', type: 'timestamptz', nullable: true})
  emailVerified?: Date | null;

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

}
