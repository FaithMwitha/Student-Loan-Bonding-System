import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
    private payments:any[]=[];

    async create(createPaymentDto:CreatePaymentDto){
        const newPayment={
            id:Math.floor(Math.random()*100),
            ...createPaymentDto,
            createdAt: new Date(),
        };
        this.payments.push(newPayment);
        return newPayment;
    }
    async findAll(){
        return this.payments;
    }
    async findMyPayments(){
        return this.payments;
    }
    async findOne(id:number){
        const payment=this.payments.find((p)=>p.id === id);
        if (!payment){
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
      async verifyPayment(reference:string){
        const payment=this.payments.find((p)=>p.transactionReference===reference);
        if(!payment){
            throw new NotFoundException(`Payment with reference ${reference} not found`);
        }
        return{
            reference,
            status:'VERIFIED',
            gatewayResponse:'Transaction successful with external gateway(Mock)',
            payment,
        };
      }  

    
}
