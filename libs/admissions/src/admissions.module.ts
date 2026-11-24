import { Module } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { SelectedStudent } from './entities/selected-student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsSeedService } from './admissions-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([SelectedStudent])],
  providers: [AdmissionsService, AdmissionsSeedService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}