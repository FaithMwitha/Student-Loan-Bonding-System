
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/src/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt/jwtauthguard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorators';
import { Role } from '../common/src/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminTest() {
    return {
      message: 'Access granted to an administrator-only endpoint',
    };
  }
}
