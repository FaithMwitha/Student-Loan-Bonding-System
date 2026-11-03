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
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'register a new student' })
  @Post('register')
  register(@Body() dto: RegisterStudentDto) {
    return this.registration.register(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated student profile' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.profiles.getMine(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List student profiles' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LOANS_OFFICER)
  @Get()
  list(@Query() filter: StudentFilterDto) {
    return this.profiles.search(filter);
  }
  @
  ApiBearerAuth()
  @ApiOperation({ summary: 'Update current authenticated student profile' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateStudentProfileDto) {
    return this.profiles.updateMine(req.user.sub, dto);
  }
}
