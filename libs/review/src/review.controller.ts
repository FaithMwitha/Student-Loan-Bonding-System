
import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ReviewService } from './review.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';
import { Role } from '@app/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import { Audit, AuditAction, AuditEntity } from '@app/audit';

@ApiTags('Review')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LOANS_OFFICER)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Approve or reject a loan application
  @Patch(':loanId')
  @ApiOperation({ summary: 'Approve or reject a loan application' })
  @Audit({
    action: AuditAction.LOAN_APPLICATION_REVIEWED,
    entity: AuditEntity.LoanApplication,
    entityIdFrom: 'params.loanId',
    reasonFrom: 'body.rejectionReason',
  })
  reviewLoan(
    @Param('loanId') loanId: string,
    @Body() dto: ReviewDecisionDto,
  ) {
    return this.reviewService.processReview(
      loanId,
      dto.status,
      dto.rejectionReason,
    );
  }

  // Get all loan applications
  @Get('loans')
  @ApiOperation({ summary: 'Get all loan applications' })
  getAllLoans() {
    return this.reviewService.getAllLoans();
  }

  // Get pending loans
  @Get('loans/pending')
  @ApiOperation({ summary: 'Get pending loan applications' })
  getPendingLoans() {
    return this.reviewService.getPendingLoans();
  }

  // Get loans under review
  @Get('loans/under-review')
  @ApiOperation({ summary: 'Get loans under review' })
  getLoansUnderReview() {
    return this.reviewService.getLoansUnderReview();
  }

  // Get rejected loans
  @Get('loans/rejected')
  @ApiOperation({ summary: 'Get rejected loan applications' })
  getRejectedLoans() {
    return this.reviewService.getRejectedLoans();
  }

  // Get accepted loans
  @Get('loans/accepted')
  @ApiOperation({ summary: 'Get accepted loan applications' })
  getAcceptedLoans() {
    return this.reviewService.getAcceptedLoans();
  }
}
