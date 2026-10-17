import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, ParseIntPipe } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller('payments')
export class PaymentsController{
    constructor(private readonly paymentsService:PaymentsService){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() CreatePaymentDto: CreatePaymentDto){
        return this.paymentsService.create(CreatePaymentDto);
    }

    @Get('my-payments')
    async findMyPayments(){
        return await this.paymentsService.findMyPayments();
    }
    @Get('verify/:reference')
    async verifyPayment(@Param('reference')reference: string){
        return await this.paymentsService.verifyPayment(reference);
    }    
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id:number){
        return await this.paymentsService.findOne(id);
    }
}