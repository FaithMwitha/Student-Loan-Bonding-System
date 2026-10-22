import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "@app/common";
@Entity('payments')
export class Payment extends BaseEntity {

    @Column({nullable:true})
    applicationId: string;

    @Column('decimal',{nullable: true})
    amount:number;

    @Column({nullable:true})
    PaymentMethod: string;

    @Column({unique:true, nullable:true})
    transactionReference: string;
     
    @Column({default:'PENDING'})
    status: string;
}