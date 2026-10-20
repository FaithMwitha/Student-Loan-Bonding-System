import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '../../common/src/enums/role.enum';
import { JwtAuthGuard } from '../../auth/jwt/jwtauthguard';
import { RolesGuard } from '../../auth/roles/roles.guard';
import { Roles } from '../../auth/roles/roles.decorators';
import { LoansService } from './loans.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';

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
  @ApiOperation({ summary: 'Submit a new loan application' })
  create(@Req() req: AuthRequest, @Body() dto: CreateLoanApplicationDto) {
    return this.loansService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my loan applications' })
  findMy(@Req() req: AuthRequest) {
    return this.loansService.findMyApplications(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one loan application by id' })
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.loansService.findOne(id, req.user.sub);
  }
}