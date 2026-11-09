import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@app/common';

@Entity('universities')
export class University extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'int' })
  tuitionFee: number;
}