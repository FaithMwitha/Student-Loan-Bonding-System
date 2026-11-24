import { BadRequestException, ConflictException, HttpException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersService } from '@app/users';
import { AdmissionsService } from '@app/admissions';
import { RegisterStudentDto } from './dto/register-student.dto';
import { StudentProfile } from './entities/student-profile.entity';
import { parseDdMmYyyy } from './constants/dates';

@Injectable()
export class StudentRegistrationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly admissions: AdmissionsService,
  ) {}

  async register(dto: RegisterStudentDto) {
    // One message for every "no match" case, so the form can't be used to discover which IDs exist
    const noMatch = () =>
      new BadRequestException(
        'We could not match those details to a selected student. Check them or contact the loans board.',
      );

    const dob = parseDdMmYyyy(dto.dateOfBirth);
    if (!dob) throw noMatch();

    try {
      return await this.dataSource.transaction(async (manager) => {
        // 1. find the roster row
        const entry = await this.admissions.findClaimable(dto.manebId, dob, manager);
        if (!entry) throw noMatch();

        // 2. create the account
        const user = await this.usersService.createStudent(
          { name: `${entry.firstNames} ${entry.surname}`, email: dto.email, password: dto.password },
          manager,
        );

        // 3. claim the row (fails if someone claimed it a split second earlier)
        if (!(await this.admissions.claim(entry.id, user.id, manager))) throw noMatch();

        // 4. create the verified profile
        const repo = manager.getRepository(StudentProfile);
        await repo.save(
          repo.create({
            userId: user.id,
            firstNames: entry.firstNames,
            surname: entry.surname,
            manebId: entry.manebId,
            registrationNumber: entry.registrationNumber,
            university: entry.universityName,
            programme: entry.programme,
            yearOfStudy: entry.yearOfStudy,
            dateOfBirth: entry.dateOfBirth,
            gender: entry.gender,
            nationalId: entry.nationalIdNumber,
            phone: dto.phone ?? null,
            identitySource: 'ADMISSIONS',
            identityVerifiedAt: new Date(),
          }),
        );

        return { message: 'Registration successful.' };
      });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('That MANEB ID or registration number is already registered');
      }
      throw err;
    }
  }
}