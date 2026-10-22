
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,=
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  applicationId!: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  decision!: 'APPROVED' | 'REJECTED';

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  reason!: string | null;

  @Column({
    type: 'integer',
    nullable: true,
  })
  reviewedBy!: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
