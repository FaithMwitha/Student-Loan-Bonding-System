import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Req, 
  UseGuards,
  Query
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiQuery, 
  ApiResponse 
} from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import { LoansService } from './loans.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { ApplicationStatus } from './enums/application-status.enum';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Submit a new loan application',
    description: 'Allows a logged-in student to apply for a loan. The application status will default to PENDING_PAYMENT.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Success! The loan application was created.',
    schema: {
      example: {
        id: "a2fce3b4-9e0b-4743-8d7e-14e10398268a",
        studentId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
        fundingType: "TUITION",
        status: "PENDING_PAYMENT",
        amountRequested: 500000,
        rejectionReason: null,
        createdAt: "2026-10-21T07:28:10.871Z",
        updatedAt: "2026-10-21T07:28:10.871Z"
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Make sure fundingType is TUITION, UPKEEP, or BOTH.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. You must be logged in as a Student.' })
  create(@Req() req: AuthRequest, @Body() dto: CreateLoanApplicationDto) {
    return this.loansService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'View my loan applications',
    description: 'Retrieves a list of all loans applied for by the logged-in student. You can optionally filter the list by status.'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ApplicationStatus, 
    description: 'Filter applications by their current status (e.g., PENDING_PAYMENT, APPROVED)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success! Returns an array of loan applications.',
    schema: {
      example: [
        {
          id: "a2fce3b4-9e0b-4743-8d7e-14e10398268a",
          studentId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
          fundingType: "BOTH",
          status: "PENDING_PAYMENT",
          amountRequested: 1200000,
          rejectionReason: null,
          createdAt: "2026-10-21T04:08:23.392Z",
          updatedAt: "2026-10-21T04:08:23.392Z"
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. You must be logged in.' })
  findMy(
    @Req() req: AuthRequest,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.loansService.findMyApplications(req.user.sub, status);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'View a specific loan application',
    description: 'Retrieves the details of a single loan application by its ID. Students can only view their own applications.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success! Returns the loan application.',
    schema: {
      example: {
        id: "a2fce3b4-9e0b-4743-8d7e-14e10398268a",
        studentId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
        fundingType: "UPKEEP",
        status: "PENDING_PAYMENT",
        amountRequested: 300000,
        rejectionReason: null,
        createdAt: "2026-10-21T04:08:23.392Z",
        updatedAt: "2026-10-21T04:08:23.392Z"
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Not Found. The application does not exist or belongs to another student.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. You must be logged in.' })
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.loansService.findOne(id, req.user.sub);
  }
}