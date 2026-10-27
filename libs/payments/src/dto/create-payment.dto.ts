import {IsNotEmpty, IsNumber, IsString, IsUUID, Min} from 'class-validator'
export class CreatePaymentDto{
    @IsUUID()
    @IsNotEmpty()
    applicationId: string;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    paymentMethod:string;

    @IsString()
    @IsNotEmpty()
    transactionReference: string;

}