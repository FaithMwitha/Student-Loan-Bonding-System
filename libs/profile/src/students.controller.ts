
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { RegisterStudentDto } from './dto/register-student.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentRegistrationService } from './student-registration.service';
import { StudentProfileService } from './student-profile.service';
import { StudentFilterDto } from './dto/student-filter.dto';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly registration: StudentRegistrationService,
    private readonly profiles: StudentProfileService,
  ) {}

  // Register a new student
  @ApiOperation({
    summary: 'Register a new student',
    description:
      'Creates a student user account and student profile. A MANEB ID or registration number must be provided.',
  })
  @ApiBody({
    type: RegisterStudentDto,
    description: 'Student registration information',
  })
  @ApiResponse({
    status: 201,
    description: 'Student successfully registered',
    schema: {
      example: {
        manebId: 'M20230013/0220',
        registrationNumber: 'UNIMA-2026-001',
        university: 'UNIMA',
        programme: 'Computer Science',
        yearOfStudy: 2,
        phone: '0991234567',
        bankName: null,
        bankAccount: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Neither MANEB ID nor registration number was provided, or registration data failed validation.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict. Email, MANEB ID or registration number is already registered.',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Post('register')
  register(@Body() dto: RegisterStudentDto) {
    return this.registration.register(dto);
  }

  // Get current authenticated student profile
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated student profile',
    description:
      'Returns the profile belonging to the currently authenticated student.',
  })
  @ApiResponse({
    status: 200,
    description: 'Student profile successfully retrieved',
    schema: {
      example: {
        manebId: 'M20230013/0220',
        registrationNumber: 'UNIMA-2026-001',
        university: 'UNIMA',
        programme: 'Computer Science',
        yearOfStudy: 2,
        phone: '0991234567',
        bankName: 'National Bank',
        bankAccount: '****1234',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only students can access this endpoint.',
  })
  @ApiResponse({
    status: 404,
    description: 'Student profile not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.profiles.getMine(req.user.sub);
  }

  // List student profiles with filters
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List student profiles',
    description:
      'Allows administrators and loans officers to search, filter and paginate student profiles.',
  })
  @ApiQuery({
    name: 'university',
    required: false,
    type: String,
    description: 'Filter by university. Value is converted to uppercase.',
    example: 'UNIMA',
  })
  @ApiQuery({
    name: 'programme',
    required: false,
    type: String,
    description: 'Filter by programme name using partial matching.',
    example: 'Computer Science',
  })
  @ApiQuery({
    name: 'yearOfStudy',
    required: false,
    type: Number,
    description: 'Filter by year of study (1–8).',
    example: 2,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search using part of a MANEB ID or registration number.',
    example: 'M2023',
  })
  @ApiQuery({
    name: 'missingRegistrationNumber',
    required: false,
    type: Boolean,
    description: 'Return only students without a registration number.',
    example: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number. Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page. Defaults to 20, maximum 100.',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Student profiles successfully retrieved',
    schema: {
      example: {
        data: [
          {
            userId: 'user-123',
            manebId: 'M20230013/0220',
            registrationNumber: 'UNIMA-2026-001',
            university: 'UNIMA',
            programme: 'Computer Science',
            yearOfStudy: 2,
          },
        ],
        total: 25,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid filter or pagination parameters.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Only administrators and loans officers can access this endpoint.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LOANS_OFFICER)
  @Get()
  list(@Query() filter: StudentFilterDto) {
    return this.profiles.search(filter);
  }

  // Update current authenticated student profile
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current authenticated student profile',
    description:
      'Updates the authenticated student profile. Currently, phone, bank name and bank account number are persisted by the service.',
  })
  @ApiBody({
    type: UpdateStudentProfileDto,
    description: 'Student profile update information',
  })
  @ApiResponse({
    status: 200,
    description: 'Student profile successfully updated',
    schema: {
      example: {
        manebId: 'M20230013/0220',
        registrationNumber: 'UNIMA-2026-001',
        university: 'UNIMA',
        programme: 'Computer Science',
        yearOfStudy: 2,
        phone: '0991234567',
        bankName: 'National Bank',
        bankAccount: '****1234',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile information or validation failure.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Authentication token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only students can access this endpoint.',
  })
  @ApiResponse({
    status: 404,
    description: 'Student profile not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateStudentProfileDto) {
    return this.profiles.updateMine(req.user.sub, dto);
  }
}
