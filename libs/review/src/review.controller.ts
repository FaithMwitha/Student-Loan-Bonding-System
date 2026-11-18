
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
  ApiParam,
  ApiBody,
  ApiResponse,
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
  @ApiOperation({
    summary: 'Approve or reject a loan application',
    description:
      'Allows an authorized loans officer to change a loan application status to UNDER_REVIEW, APPROVED, or REJECTED.',
  })
  @ApiParam({
    name: 'loanId',
    type: String,
    description: 'Unique ID of the loan application',
    example: 'loan-123',
  })
  @ApiBody({
    type: ReviewDecisionDto,
    description: 'Review decision details',
  })
  @ApiResponse({
    status: 200,
    description: 'Loan application status successfully updated',
    schema: {
      example: {
        message: 'Loan successfully marked as APPROVED',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid review status or request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only loans officers can review applications.',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan application not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Loan application not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
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
  @ApiOperation({
    summary: 'Get all loan applications',
    description: 'Retrieves all loan applications from the database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Loan applications successfully retrieved',
    schema: {
      example: [
        {
          id: 'loan-123',
          studentId: 'student-001',
          status: 'SUBMITTED',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only loans officers can access this endpoint.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getAllLoans() {
    return this.reviewService.getAllLoans();
  }

  // Get pending loans
  @Get('loans/pending')
  @ApiOperation({
    summary: 'Get pending loan applications',
    description:
      'Retrieves loan applications whose status is PENDING_PAYMENT or SUBMITTED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending loan applications successfully retrieved',
    schema: {
      example: [
        {
          id: 'loan-123',
          studentId: 'student-001',
          status: 'PENDING_PAYMENT',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only loans officers can access this endpoint.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getPendingLoans() {
    return this.reviewService.getPendingLoans();
  }

  // Get loans under review
  @Get('loans/under-review')
  @ApiOperation({
    summary: 'Get loans under review',
    description:
      'Retrieves all loan applications with the UNDER_REVIEW status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Loans under review successfully retrieved',
    schema: {
      example: [
        {
          id: 'loan-123',
          studentId: 'student-001',
          status: 'UNDER_REVIEW',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only loans officers can access this endpoint.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getLoansUnderReview() {
    return this.reviewService.getLoansUnderReview();
  }

  // Get rejected loans
  @Get('loans/rejected')
  @ApiOperation({
    summary: 'Get rejected loan applications',
    description: 'Retrieves all loan applications with REJECTED status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rejected loan applications successfully retrieved',
    schema: {
      example: [
        {
          id: 'loan-123',
          studentId: 'student-001',
          status: 'REJECTED',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only loans officers can access this endpoint.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getRejectedLoans() {
    return this.reviewService.getRejectedLoans();
  }

  // Get accepted loans
  @Get('loans/accepted')
  @ApiOperation({
    summary: 'Get accepted loan applications',
    description: 'Retrieves all loan applications with APPROVED status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Accepted loan applications successfully retrieved',
    schema: {
      example: [
        {
          id: 'loan-123',
          studentId: 'student-001',
          status: 'APPROVED',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only loans officers can access this endpoint.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getAcceptedLoans() {
    return this.reviewService.getAcceptedLoans();
  }
}
