import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsModule } from '@app/admissions';
import { AuthModule } from '@app/auth';
import { UsersModule } from '@app/users';
import { StaffProfile } from './entities/staff-profile.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { StaffProfileService } from './staff-profile.service';
import { StudentProfileService } from './student-profile.service';
import { StudentRegistrationService } from './student-registration.service';
import { StudentsController } from './students.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentProfile, StaffProfile]),
    UsersModule,
    AuthModule,
    AdmissionsModule,
  ],
  controllers: [StudentsController],
  providers: [StudentRegistrationService, StudentProfileService, StaffProfileService],
  exports: [StaffProfileService, StudentProfileService],
})
export class ProfileModule {}