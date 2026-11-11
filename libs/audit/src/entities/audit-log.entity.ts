import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['actorId', 'createdAt'])
@Index(['entityType', 'entityId'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // WHO
  @Column({ nullable: true })
  actorId: string;

  @Column({ nullable: true })
  actorRole: string;

  @Column({ nullable: true })
  actorEmail: string;

  // WHAT
  @Column()
  action: string;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  // BEFORE / AFTER
  @Column('jsonb', { nullable: true })
  before: Record<string, unknown>;

  @Column('jsonb', { nullable: true })
  after: Record<string, unknown>;

  // CONTEXT
  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  // TIMESTAMP — append-only, no UpdateDateColumn
  @CreateDateColumn()
  createdAt: Date;
}
