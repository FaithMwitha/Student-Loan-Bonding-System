import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanApplication } from './entities/loan-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanApplication]),
    AuthModule,
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}