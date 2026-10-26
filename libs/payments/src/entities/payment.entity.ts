import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('payments')
export class Payment{

    @PrimaryGeneratedColumn('uuid')
    id:string;

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
     
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}