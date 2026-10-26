import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { ApplicationStatus } from './enums/application-status.enum';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly loanRepo: Repository<LoanApplication>,
  ) {}

  async create(studentId: string, dto: CreateLoanApplicationDto) {
    const loan = this.loanRepo.create({
      studentId,
      fundingType: dto.fundingType,
      amountRequested: dto.amountRequested,
      status: ApplicationStatus.PENDING_PAYMENT,
    });
    return this.loanRepo.save(loan);
  }

  async findMyApplications(studentId: string, status?: ApplicationStatus) {
    const whereClause: any = { studentId };
    
    if (status) {
      whereClause.status = status;
    }

    return this.loanRepo.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, studentId: string) {
    const loan = await this.loanRepo.findOne({
      where: { id, studentId },
    });
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }
    return loan;
  }
}