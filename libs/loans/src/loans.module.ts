import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { UsersModule } from '../../users/src/users.module';
import { UniversitiesModule } from '../../universities/src/universities.module'; // <-- ADD
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanApplication } from './entities/loan-application.entity';
import { StudentProfile } from '../../profile/src/entities/student-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanApplication, StudentProfile]),
    AuthModule,
    UsersModule,
    UniversitiesModule,
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}