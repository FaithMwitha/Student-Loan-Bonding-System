import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import {CommonModule} from '@app/common'
import { PaymentModule } from './payment/payment.module';
import { PaymentsController } from './payments/payments.controller';

@Module({
  imports: [CommonModule, PaymentModule],
  controllers: [ApiController, PaymentsController],
  providers: [ApiService],
})
export class ApiModule {}
