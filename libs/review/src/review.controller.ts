import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';
import { Role } from '@app/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';

@ApiTags('Review')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LOANS_OFFICER)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Patch(':loanId')
  @ApiOperation({ summary: 'Approve or reject a loan application' })
  reviewLoan(@Param('loanId') loanId: string, @Body() dto: ReviewDecisionDto) {
    return this.reviewService.processReview(loanId, dto.status, dto.rejectionReason);
  }
}