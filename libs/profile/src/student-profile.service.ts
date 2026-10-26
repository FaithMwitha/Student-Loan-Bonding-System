import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { toStudentProfileResponse } from './student-profile.mapper';

@Injectable()
export class StudentProfileService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly repo: Repository<StudentProfile>,
  ) {}

  private async find(userId: string) {
    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async getMine(userId: string) {
    return toStudentProfileResponse(await this.find(userId));
  }

  async updateMine(userId: string, dto: UpdateStudentProfileDto) {
    const profile = await this.find(userId);
    // pick fields one by one: no Object.assign of a request body onto an entity
    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.bankName !== undefined) profile.bankName = dto.bankName;
    if (dto.bankAccountNumber !== undefined) profile.bankAccountNumber = dto.bankAccountNumber;
    if (dto.programme !== undefined) profile.programme = dto.programme;
    if (dto.yearOfStudy !== undefined) profile.yearOfStudy = dto.yearOfStudy;
    return toStudentProfileResponse(await this.repo.save(profile));
  }
}