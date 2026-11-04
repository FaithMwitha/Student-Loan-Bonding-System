import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { RegisterStudentDto } from './dto/register-student.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentRegistrationService } from './student-registration.service';
import { StudentProfileService } from './student-profile.service';

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

  @Post('register')
  register(@Body() dto: RegisterStudentDto) {
    return this.registration.register(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.profiles.getMine(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateStudentProfileDto) {
    return this.profiles.updateMine(req.user.sub, dto);
  }
}