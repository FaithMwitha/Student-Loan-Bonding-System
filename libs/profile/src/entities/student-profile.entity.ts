import { Column, Entity, Unique, Check } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('student_profiles')
@Unique('uq_student_university_regno', ['university', 'registrationNumber'])
@Check('"maneb_id" IS NOT NULL OR "registration_number" IS NOT NULL')
export class StudentProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // --- Identity: filled from the admissions roster, locked for the student ---
  @Column({ name: 'first_names', type: 'varchar', nullable: true })
  firstNames: string | null;

  @Column({ type: 'varchar', nullable: true })
  surname: string | null;

  @Column({ name: 'maneb_id', type: 'varchar', unique: true, nullable: true })
  manebId: string | null;

  @Column({ name: 'registration_number', type: 'varchar', nullable: true })
  registrationNumber: string | null;

  @Column({ type: 'varchar' })
  university: string;

  @Column({ type: 'varchar', nullable: true })
  programme: string | null;

  @Column({ name: 'year_of_study', type: 'int', nullable: true })
  yearOfStudy: number | null;

  @Column({ name: 'national_id', type: 'varchar', nullable: true })
  nationalId: string | null;

  @Column({ type: 'varchar', nullable: true })
  gender: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ name: 'identity_source', type: 'varchar', length: 20, default: 'SELF_DECLARED' })
  identitySource: 'ADMISSIONS' | 'SELF_DECLARED';

  @Column({ name: 'identity_verified_at', type: 'timestamptz', nullable: true })
  identityVerifiedAt: Date | null;

  // --- Self-managed by the student ---
  @Column({ name: 'marital_status', type: 'varchar', nullable: true })
  maritalStatus: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'postal_address', type: 'varchar', nullable: true })
  postalAddress: string | null;

  @Column({ name: 'guarantor_name', type: 'varchar', nullable: true })
  guarantorName: string | null;

  @Column({ name: 'guarantor_phone', type: 'varchar', nullable: true })
  guarantorPhone: string | null;

  @Column({ name: 'guarantor_address', type: 'varchar', nullable: true })
  guarantorAddress: string | null;

  @Column({ name: 'next_of_kin_name', type: 'varchar', nullable: true })
  nextOfKinName: string | null;

  @Column({ name: 'next_of_kin_phone', type: 'varchar', nullable: true })
  nextOfKinPhone: string | null;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account_name', type: 'varchar', nullable: true })
  bankAccountName: string | null;

  @Column({ name: 'bank_account_number', type: 'varchar', nullable: true })
  bankAccountNumber: string | null;

  @Column({ name: 'bank_branch', type: 'varchar', nullable: true })
  bankBranch: string | null;
}