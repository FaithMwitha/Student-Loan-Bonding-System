import { Module } from '@nestjs/common';
import { StaffProfile } from './entities/staff-profile.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentRegistrationService } from './student-registration.service';
import { StudentsController } from './students.controller';
import { AuthModule } from '@app/auth';
import { UsersModule } from '@app/users';
import { StaffProfileService } from './staff-profile.service';
import { StudentProfileService } from './student-profile.service';
@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile, StaffProfile]), UsersModule, AuthModule],
  controllers: [StudentsController],
  providers: [StudentRegistrationService, StudentProfileService, StaffProfileService],
  exports: [StaffProfileService],
})
export class ProfileModule {}