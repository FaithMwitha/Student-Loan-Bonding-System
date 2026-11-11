import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Req, 
  UseGuards,
  Query,
  Patch,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiResponse,
  ApiBody,
  ApiConsumes
} from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { Audit, AuditAction, AuditEntity } from '@app/audit';
import { JwtAuthGuard } from '../../auth/src/jwt/jwtauthguard';
import { RolesGuard } from '../../auth/src/roles/roles.guard';
import { Roles } from '../../auth/src/roles/roles.decorators';
import { LoansService } from './loans.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { UpdateLoanApplicationDto } from './dto/update-loan-application.dto';
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
    description: 'Allows a logged-in student to apply for a loan. Can reuse old documents or upload new ones.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ 
    description: 'Loan application data',
    type: CreateLoanApplicationDto 
  })
  @ApiResponse({ status: 201, description: 'Success! The loan application was created.' })
  @Audit({
    action: AuditAction.LOAN_APPLICATION_CREATED,
    entity: AuditEntity.LoanApplication,
    entityIdFrom: 'response.id',
  })
  @UseInterceptors(FilesInterceptor('documents', 6, {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  create(
    @Req() req: AuthRequest, 
    @Body() dto: CreateLoanApplicationDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.originalname);
      const uniqueFileNames = new Set(fileNames);
      if (fileNames.length !== uniqueFileNames.size) {
        throw new BadRequestException('You have uploaded the same document multiple times.');
      }
    }

    const documentPaths = files ? files.map((file) => file.path) : [];
    return this.loansService.create(req.user.sub, dto, documentPaths);
  }

  @Get('previous-details')
  @ApiOperation({ 
    summary: 'Get details from previous loan',
    description: 'Fetches the details from the most recent loan application to auto-fill the new application form.'
  })
  getPreviousDetails(@Req() req: AuthRequest) {
    return this.loansService.getPreviousDetails(req.user.sub);
  }

  @Get()
  @ApiOperation({ 
    summary: 'View my loan applications',
    description: 'Retrieves a list of all loans applied for by the logged-in student.'
  })
  @ApiResponse({ status: 200, description: 'Success! Returns an array of loan applications.' })
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
  @ApiBody({ type: UpdateLoanApplicationDto, required: false })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update an application that is already under review or finalized' })
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateLoanApplicationDto, 
    @Req() req: AuthRequest
  ) {
    return this.loansService.updateApplication(id, req.user.sub, dto);
  }
}