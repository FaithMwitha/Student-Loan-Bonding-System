import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../auth/src/auth.module';
import { VerificationsEntity } from './entities/verification.entity';
import { VerificationsController } from './verification.controller';
import { VerificationsService } from './verification.service';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';
import { StudentProfile } from '../../profile/src/entities/student-profile.entity';
import { UserEntity } from '../../users/src/entities/users.entity';
import { University } from '../../universities/src/entities/university.entity';


@Module({
  imports: [AuthModule,TypeOrmModule.forFeature([VerificationsEntity, LoanApplication, StudentProfile, UserEntity, University])],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}