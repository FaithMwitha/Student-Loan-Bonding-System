import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
@Entity('loan_applications')
export class LoanApplication{
    @PrimaryGeneratedColumn()
    id:number;
     
    @Column()
    status:string;
}