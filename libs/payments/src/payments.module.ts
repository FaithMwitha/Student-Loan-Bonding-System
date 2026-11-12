import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { NotificationsModule } from '../../notifications/src/notifications.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { ReceiptService } from './receipt/receipt.service';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity'; // <-- ADD

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, LoanApplication]), // <-- ADD LoanApplication
    AuthModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ReceiptService],
  exports: [PaymentsService],
})
export class PaymentsModule {}