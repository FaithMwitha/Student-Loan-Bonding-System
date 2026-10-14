import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';

@ApiTags('Loans')
@ApiBearerAuth()
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // TODO: replace with real studentId from JWT (auth module)
  private readonly TEMP_STUDENT_ID = 'temp-student-id';

  @Post()
  @ApiOperation({ summary: 'Submit a new loan application' })
  create(@Body() dto: CreateLoanApplicationDto) {
    return this.loansService.create(this.TEMP_STUDENT_ID, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my loan applications' })
  findMy() {
    return this.loansService.findMyApplications(this.TEMP_STUDENT_ID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one loan application by id' })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id, this.TEMP_STUDENT_ID);
  }
}