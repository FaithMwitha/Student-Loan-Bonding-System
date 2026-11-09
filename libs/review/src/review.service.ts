
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';
import { NotificationsService } from '@app/notifications';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly loanRepo: Repository<LoanApplication>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async processReview(
    loanId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) {
    const loan = await this.loanRepo.findOne({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    loan.status = status as any;

    if (status === 'REJECTED') {
      loan.rejectionReason = rejectionReason;
    }

    await this.loanRepo.save(loan);

    await this.notificationsService.sendLoanStatusAlert(
      loan.studentId,
      status,
      rejectionReason,
    );

    return { message: `Loan successfully ${status}` };
  }

  async getAllLoans() {
    return this.loanRepo.find();
  }

  async getLoansByStatus(status: string) {
    return this.loanRepo.find({
      where: { status } as any,
    });
  }

  async getPendingLoans() {
    return this.getLoansByStatus('PENDING');
  }

  async getLoansUnderReview() {
    return this.getLoansByStatus('UNDER_REVIEW');
  }

  async getRejectedLoans() {
    return this.getLoansByStatus('REJECTED');
  }

  async getAcceptedLoans() {
    return this.getLoansByStatus('APPROVED');
  }
}
