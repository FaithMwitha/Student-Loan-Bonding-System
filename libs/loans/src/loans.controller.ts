import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Req, 
  UseGuards,
  Query,
  Patch
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiResponse 
} from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard } from '../../auth/src/jwt/jwtauthguard';
import { RolesGuard } from '../../auth/src/roles/roles.guard';
import { Roles } from '../../auth/src/roles/roles.decorators';
import { LoansService } from './loans.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { FilterLoansDto } from './dto/filter-loans.dto';

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
    description: 'Allows a logged-in student to apply for a loan.'
  })
  @ApiResponse({ status: 201, description: 'Success! The loan application was created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Req() req: AuthRequest, @Body() dto: CreateLoanApplicationDto) {
    return this.loansService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'View my loan applications',
    description: 'Retrieves a list of all loans applied for by the logged-in student. You can filter by status, funding type, university, and paginate.'
  })
  @ApiResponse({ status: 200, description: 'Success! Returns an array of loan applications.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findMy(
    @Req() req: AuthRequest,
    @Query() filterDto: FilterLoansDto,
  ) {
    return this.loansService.findMyApplications(req.user.sub, filterDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'View a specific loan application',
    description: 'Retrieves the details of a single loan application by its ID.'
  })
  @ApiResponse({ status: 200, description: 'Success! Returns the loan application.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.loansService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a pending loan application',
    description: 'Allows a student to fix typos or update details before the loan is reviewed.'
  })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update an application that is already under review or finalized' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  update(
    @Param('id') id: string, 
    @Body() dto: Partial<CreateLoanApplicationDto>, 
    @Req() req: AuthRequest
  ) {
    return this.loansService.updateApplication(id, req.user.sub, dto);
  }
}