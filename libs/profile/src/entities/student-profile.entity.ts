import { Column, Entity, Unique, Check} from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('student_profiles')
@Unique('uq_student_university_regno', ['university', 'registrationNumber'])
@Check('"maneb_id" IS NOT NULL OR "registration_number" IS NOT NULL')
export class StudentProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;                       // id only, no relation to the users lib

  @Column({ name: 'maneb_id', type: 'varchar', unique: true, nullable: true })
  manebId: string | null;

  @Column({ name: 'registration_number', type: 'varchar', unique: true, nullable: true })
  registrationNumber: string | null;    // arrives after admission is processed

  @Column({ type: 'varchar' })
  university: string;

  @Column({ type: 'varchar', nullable: true })
  programme: string | null;

  @Column({ name: 'year_of_study', type: 'int', nullable: true })
  yearOfStudy: number | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account_number', type: 'varchar', nullable: true })
  bankAccountNumber: string | null;
}