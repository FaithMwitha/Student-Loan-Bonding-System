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
        

    
}
