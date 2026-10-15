import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
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
}