import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerificationEntity } from './entities/verification.entity';
import { VerificationStatus } from './enums/verification-status.enum';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectRepository(VerificationEntity)
    private readonly verificationRepository: Repository<VerificationEntity>,
  ) {}

  // Automatically register an accepted loan application for verification
  async createFromAcceptedApplication(
    loanApplicationId: string,
    studentId: string,
  ): Promise<VerificationEntity> {
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
      status: VerificationStatus.PENDING,
    });

    return this.verificationRepository.save(verification);
  }

  // Get all students registered for verification
  async findAll(): Promise<VerificationEntity[]> {
    return this.verificationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Get students whose verification has not started
  async findPending(): Promise<VerificationEntity[]> {
    return this.verificationRepository.find({
      where: { status: VerificationStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  // Get one verification record
  async findOne(id: string): Promise<VerificationEntity> {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    return verification;
  }
}