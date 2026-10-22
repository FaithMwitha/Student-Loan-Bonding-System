import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { JwtModule } from '@nestjs/jwt'; // <-- Add this
import { AuthModule } from '../../auth/auth.module'; 
=======
import { AuthModule } from '@app/auth'; 
>>>>>>> origin/main
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanApplication } from './entities/loan-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanApplication]),
    AuthModule,
<<<<<<< HEAD
    JwtModule, // <-- Add this
=======
>>>>>>> origin/main
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}