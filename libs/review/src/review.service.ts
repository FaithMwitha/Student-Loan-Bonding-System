import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';
import { NotificationsService } from '@app/notifications';
import { VerificationsService } from '../../verification/src/verification.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly loanRepo: Repository<LoanApplication>,
    private readonly notificationsService: NotificationsService,
    private readonly verificationsService: VerificationsService,
  ) {}

  async processReview(
    loanId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
    allowReapply?: boolean,
  ) {
    const loan = await this.loanRepo.findOne({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    if (loan.status !== 'UNDER_REVIEW') {
      throw new BadRequestException(
        'Only loans under review can be approved or rejected.',
      );
    }

    if (status === 'REJECTED') {
      loan.rejectionReason = rejectionReason;

      if (allowReapply) {
        loan.status = 'NEEDS_CORRECTION' as any;
      } else {
        loan.status = 'REJECTED' as any;
      }
    } else {
      loan.status = 'APPROVED' as any;
    }

    await this.loanRepo.save(loan);

    if (status === 'APPROVED') {
      await this.verificationsService.createFromAcceptedApplication(
        loan.id,
        loan.studentId,
      );
    }

    let message = `Your loan status changed to ${loan.status}.`;

    if (allowReapply && status === 'REJECTED') {
      message = `Your loan was rejected for the following reason: ${rejectionReason}. You have a chance to make changes and reapply for this year.`;
    } else if (status === 'REJECTED') {
      message = `Your loan was rejected. Reason: ${rejectionReason}`;
    }

    await this.notificationsService.sendLoanStatusAlert(
      loan.studentId,
      loan.status,
      message,
    );

    return {
      message: `Loan successfully marked as ${loan.status}`,
    };
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
    return this.loanRepo.find({
      where: {
        status: In([
          'PENDING_PAYMENT',
          'SUBMITTED',
          'UNDER_REVIEW',
        ]) as any,
      },
    });
  }

  async getLoansNeedingCorrection() {
    return this.getLoansByStatus('NEEDS_CORRECTION');
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