import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { NotificationsModule } from '../../notifications/src/notifications.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, LoanApplication]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}