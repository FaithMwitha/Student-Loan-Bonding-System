import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('admissions_roster')
@Unique('uq_roster_maneb_intake', ['manebId', 'intakeYear'])
export class SelectedStudent extends BaseEntity {
  @Column({ name: 'maneb_id', type: 'varchar', length: 20 }) manebId: string;
  @Column({ name: 'intake_year', type: 'int' }) intakeYear: number;
  @Column({ name: 'university_name', type: 'varchar', length: 150 })
  universityName: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) programme:
    string | null;
  @Column({ name: 'year_of_study', type: 'int', default: 1 })
  yearOfStudy: number;
  @Column({ name: 'first_names', type: 'varchar', length: 150 })
  firstNames: string;
  @Column({ type: 'varchar', length: 100 }) surname: string;
  @Column({ name: 'date_of_birth', type: 'date' }) dateOfBirth: string; // 'YYYY-MM-DD'
  @Column({ type: 'varchar', length: 20 }) gender: string; // as supplied by the school
  @Column({
    name: 'national_id_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  nationalIdNumber: string | null;
  @Column({
    name: 'registration_number',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  registrationNumber: string | null;
  @Column({ name: 'claimed_by_user_id', type: 'uuid', nullable: true })
  claimedByUserId: string | null;
  @Column({ name: 'import_batch', type: 'varchar', length: 60 })
  importBatch: string;
}
