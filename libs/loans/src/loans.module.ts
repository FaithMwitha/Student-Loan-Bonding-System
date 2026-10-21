import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <-- Add this
import { AuthModule } from '../../auth/auth.module'; 
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanApplication } from './entities/loan-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanApplication]),
    AuthModule,
    JwtModule, // <-- Add this
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}