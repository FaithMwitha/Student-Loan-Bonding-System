import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('payments')
export class Payment{

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    applicationId: string;

    @Column()
    amount:number;

    @Column()
    PaymentMethod: string;

    @Column()
    transactionReference: string;

    @CreateDateColumn()
    createdAt: Date;
}