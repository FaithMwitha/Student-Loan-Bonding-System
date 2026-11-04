import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { FilterLoansDto } from './dto/filter-loans.dto'; 
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

  async findMyApplications(studentId: string, filterDto: FilterLoansDto) {
    const { status, fundingType, university, search, page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.loanRepo.createQueryBuilder('loan')
      .where('loan.studentId = :studentId', { studentId });

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    if (fundingType) {
      queryBuilder.andWhere('loan.fundingType = :fundingType', { fundingType });
    }

    if (university) {
      queryBuilder.andWhere('loan.university = :university', { university });
    }

    if (search) {
      queryBuilder.andWhere(
        '(CAST(loan.id AS text) ILIKE :search OR loan.nationalId ILIKE :search)', 
        { search: `%${search}%` }
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    queryBuilder.orderBy('loan.createdAt', 'DESC');

    return queryBuilder.getMany();
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

    if (
      loan.status === ApplicationStatus.UNDER_REVIEW || 
      loan.status === ApplicationStatus.APPROVED || 
      loan.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Cannot update an application that is already under review or finalized.');
    }

    Object.assign(loan, dto);

    if (dto.university || dto.fundingType) {
      const UPKEEP_AMOUNT = 560000;
      const tuitionAmounts: Record<string, number> = {
        'UNIMA': 1300000, 'MZUNI': 1100000, 'MUST': 1500000, 'DEFAULT': 1000000, 
      };
      
      const currentUniversity = dto.university || loan.university || 'DEFAULT';
      const fixedTuition = tuitionAmounts[currentUniversity.toUpperCase()] || tuitionAmounts['DEFAULT'];

      const currentFundingType = dto.fundingType || loan.fundingType;

      if (currentFundingType === FundingType.TUITION) {
        loan.amountRequested = fixedTuition;
      } else if (currentFundingType === FundingType.UPKEEP) {
        loan.amountRequested = UPKEEP_AMOUNT;
      } else if (currentFundingType === FundingType.BOTH) {
        loan.amountRequested = fixedTuition + UPKEEP_AMOUNT;
      }
    }

    return this.loanRepo.save(loan);
  }
}