import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { NotificationsModule } from '@app/notifications';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanApplication]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}