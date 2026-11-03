import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { ApplicationStatus } from './enums/application-status.enum';
import { FundingType } from './enums/funding-type.enum';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly loanRepo: Repository<LoanApplication>,
  ) {}

  async create(studentId: string, dto: CreateLoanApplicationDto) {
    const UPKEEP_AMOUNT = 560000;
    
    const tuitionAmounts: Record<string, number> = {
      'UNIMA': 1300000,
      'MZUNI': 1100000,
      'MUST': 1500000,
      'DEFAULT': 1000000, 
    };

    const fixedTuition = tuitionAmounts[dto.university?.toUpperCase() || ''] || tuitionAmounts['DEFAULT'];
    
    let finalAmount = 0;

    if (dto.fundingType === FundingType.TUITION) {
      finalAmount = fixedTuition;
    } else if (dto.fundingType === FundingType.UPKEEP) {
      finalAmount = UPKEEP_AMOUNT;
    } else if (dto.fundingType === FundingType.BOTH) {
      finalAmount = fixedTuition + UPKEEP_AMOUNT;
    }

    const loan = this.loanRepo.create({
      ...dto,
      studentId,
      amountRequested: finalAmount, 
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

  
  async updateApplication(id: string, studentId: string, dto: Partial<CreateLoanApplicationDto>) {
    const loan = await this.findOne(id, studentId);

    // Block updates if the loan is already being processed
    if (
      loan.status === ApplicationStatus.UNDER_REVIEW || 
      loan.status === ApplicationStatus.APPROVED || 
      loan.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Cannot update an application that is already under review or finalized.');
    }

    // Merge the incoming DTO into the loan object first
    Object.assign(loan, dto);

    // If they update university or fundingType, recalculate the amount
    if (dto.university || dto.fundingType) {
      const UPKEEP_AMOUNT = 560000;
      const tuitionAmounts: Record<string, number> = {
        'UNIMA': 1300000, 'MZUNI': 1100000, 'MUST': 1500000, 'DEFAULT': 1000000, 
      };
      
      const fixedTuition = tuitionAmounts[loan.university?.toUpperCase() || ''] || tuitionAmounts['DEFAULT'];

      if (loan.fundingType === FundingType.TUITION) {
        loan.amountRequested = fixedTuition;
      } else if (loan.fundingType === FundingType.UPKEEP) {
        loan.amountRequested = UPKEEP_AMOUNT;
      } else if (loan.fundingType === FundingType.BOTH) {
        loan.amountRequested = fixedTuition + UPKEEP_AMOUNT;
      }
    }

    return this.loanRepo.save(loan);
  }
}