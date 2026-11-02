import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { toStudentProfileResponse } from './student-profile.mapper';
import { StudentFilterDto } from './dto/student-filter.dto';
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
  async search(f: StudentFilterDto) {
    const qb = this.repo.createQueryBuilder('p');
    if (f.university) qb.andWhere('p.university = :uni', { uni: f.university });
    if (f.programme)
      qb.andWhere('p.programme ILIKE :prog', { prog: `%${f.programme}%` });
    if (f.yearOfStudy)
      qb.andWhere('p.yearOfStudy = :year', { year: f.yearOfStudy });
    if (f.search) {
      qb.andWhere('(p.manebId ILIKE :s OR p.registrationNumber ILIKE :s)', {
        s: `%${f.search}%`,
      });
    }
    if (f.missingRegistrationNumber)
      qb.andWhere('p.registrationNumber IS NULL');

    const [rows, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .skip((f.page - 1) * f.limit)
      .take(f.limit)
      .getManyAndCount();

    return {
      data: rows.map((p) => ({
        userId: p.userId,
        manebId: p.manebId,
        registrationNumber: p.registrationNumber,
        university: p.university,
        programme: p.programme,
        yearOfStudy: p.yearOfStudy,
      })),
      total,
      page: f.page,
      limit: f.limit,
    };
  }

  async updateMine(userId: string, dto: UpdateStudentProfileDto) {
    const profile = await this.find(userId);
    // pick fields one by one: no Object.assign of a request body onto an entity
    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.bankName !== undefined) profile.bankName = dto.bankName;
    if (dto.bankAccountNumber !== undefined)
      profile.bankAccountNumber = dto.bankAccountNumber;
    if (dto.programme !== undefined) profile.programme = dto.programme;
    if (dto.yearOfStudy !== undefined) profile.yearOfStudy = dto.yearOfStudy;
    return toStudentProfileResponse(await this.repo.save(profile));
  }
}
