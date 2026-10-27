import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@app/common';
@Entity('staff_profiles')
export class StaffProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({
    name: 'staff_number',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  staffNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;
}
