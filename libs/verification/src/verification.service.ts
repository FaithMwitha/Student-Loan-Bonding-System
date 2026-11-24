
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerificationsEntity } from './entities/verification.entity';
import { VerificationStatus } from './enums/verification-status.enum';
import { University } from '../../universities/src/entities/university.entity';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';
import { StudentProfile } from '../../profile/src/entities/student-profile.entity';
import { UserEntity } from '../../users/src/entities/users.entity';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectRepository(VerificationsEntity)
    private readonly verificationRepository: Repository<VerificationsEntity>,

    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepository: Repository<LoanApplication>,

    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
  ) {}

  // Automatically register an accepted loan application for verification
  async createFromAcceptedApplication(
    loanApplicationId: string,
    studentId: string,
  ): Promise<VerificationsEntity> {
    const existingVerification =
      await this.verificationRepository.findOne({
        where: { loanApplicationId },
      });

    // Prevent duplicate verification records
    if (existingVerification) {
      return existingVerification;
    }

    const verification = this.verificationRepository.create({
      loanApplicationId,
      studentId,
      status: VerificationStatus.APPROVED,
    });

    return this.verificationRepository.save(verification);
  }

  // Build a detailed verification response
  private async buildVerificationResponse(
    verification: VerificationsEntity,
  ): Promise<Record<string, any>> {
    const loanApplication =
      await this.loanApplicationRepository.findOne({
        where: { id: verification.loanApplicationId },
      });

    const studentId =
      loanApplication?.studentId ?? verification.studentId;

    const [studentProfile, user] = await Promise.all([
      this.studentProfileRepository.findOne({
        where: { userId: studentId },
      }),
      this.userRepository.findOne({
        where: { id: studentId },
      }),
    ]);

    return {
      id: verification.id,
      status: verification.status,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,

      loanApplication: loanApplication
        ? {
            id: loanApplication.id,
            university: loanApplication.university,
            fundingType: loanApplication.fundingType,
            amountRequested: loanApplication.amountRequested,
            status: loanApplication.status,
            programme: loanApplication.programme,
            yearOfStudy: loanApplication.yearOfStudy,
            createdAt: loanApplication.createdAt,
          }
        : null,

      student: {
        id: studentId,
        name: user?.name ?? null,
        registrationNumber:
          studentProfile?.registrationNumber ?? null,
        manebId: studentProfile?.manebId ?? null,
        
      },
    };
  }

  // Get all approved verification records with student and loan details
  async findAll(): Promise<Record<string, any>[]> {
    const verifications = await this.verificationRepository.find({
      where: { status: VerificationStatus.APPROVED },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      verifications.map((verification) =>
        this.buildVerificationResponse(verification),
      ),
    );
  }

  // Get one verification record with student and loan details
  async findOne(id: string): Promise<Record<string, any>> {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    return this.buildVerificationResponse(verification);
  }
// Get verification statistics by university
async getStatisticsByUniversity(university: string) {
  // Check whether the university exists
  const universityRecord = await this.universityRepository.findOne({
    where: { name: university },
  });

  if (!universityRecord) {
    throw new NotFoundException('University not found');
  }

  const applications = await this.loanApplicationRepository.find({
    where: { university: universityRecord.name },
    select: { id: true,},
  });

  const applicationIds = applications.map(
    (application) => application.id,
  );

  const counts = {
    PENDING: 0,
    IN_PROGRESS: 0,
    APPROVED: 0,
    REJECTED: 0,
  };

  // Only query verification records if applications exist
  if (applicationIds.length > 0) {
    const statistics = await this.verificationRepository
      .createQueryBuilder('verification')
      .select('verification.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('verification.loanApplicationId IN (:...applicationIds)', {
        applicationIds,
      })
      .groupBy('verification.status')
      .getRawMany();

    for (const item of statistics) {
      counts[item.status as keyof typeof counts] = Number(item.count);
    }
  }

  return {
    university: universityRecord.name,
    totalAccepted: counts.APPROVED,
    totalPending: counts.PENDING,
    totalInProgress: counts.IN_PROGRESS,
    totalRejected: counts.REJECTED,
    total: Object.values(counts).reduce(
      (sum, count) => sum + count,
      0,
    ),
  };
}
}
