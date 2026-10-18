import { Column, Entity } from "typeorm";
import { BaseEntity } from "@app/common";
import { Exclude } from "class-transformer";
import { Role, AccountStatus } from "@app/common";
@Entity({ name: "users" })
export class UserEntity extends BaseEntity {
  // ...name,  email, passwordHash stay the same...
  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;


  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email!: string;


  @Column({ type: "varchar", length: 255, nullable: false })
  @Exclude()
  passwordHash!: string;

  @Column({
    type: "simple-enum",
    enum: Role,
    default: Role.STUDENT,
  })
  primaryRole!: Role;

  @Column({ type: "simple-enum", enum: AccountStatus, default: AccountStatus.ACTIVE })
  status!: AccountStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Exclude()
  refreshTokenHash?: string;
}
