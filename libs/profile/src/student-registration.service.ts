import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersService, UserResponseDto } from '@app/users';
import { RegisterStudentDto } from './dto/register-student.dto';
import { StudentProfile } from './entities/student-profile.entity';
import { toStudentProfileResponse } from './student-profile.mapper';

@Injectable()
export class StudentRegistrationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterStudentDto) {
    if (!dto.manebId && !dto.registrationNumber) {
      throw new BadRequestException('Provide a MANEB ID or a registration number');
    }
    try {
      return await this.dataSource.transaction(async (manager) => {
        const user = await this.usersService.createStudent(
          { name: dto.name, email: dto.email, password: dto.password },
          manager,
        );
        const repo = manager.getRepository(StudentProfile);
        const profile = await repo.save(
          repo.create({
            userId: user.id,
            manebId: dto.manebId ?? null,
            registrationNumber: dto.registrationNumber ?? null,
            university: dto.university,
            programme: dto.programme ?? null,
            yearOfStudy: dto.yearOfStudy ?? null,
          }),
        );
        return toStudentProfileResponse(profile);
      });
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('That MANEB ID or registration number is already registered');
      }
      throw err;
    }
  }
}