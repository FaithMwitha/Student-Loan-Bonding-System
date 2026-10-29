
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
import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,ApiBody,ApiQuery} from "@nestjs/swagger";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*@Post('register')
  @ApiOperation({ summary: 'Register a a new student',
    description: 'Creates a new student to register by providing their name, email, and password. The password must be at least 8 characters long.'
   })
  @ApiResponse({ status: 201, description: 'Student accountcreated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiResponse({ status: 409, description: 'An account with that Email already exists' })
  @ApiBody({ type: CreateUserDto })
  register(@Body() body: CreateUserDto) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
    );
  }
*/
  
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Login to the system',
    description: 'Authenticates registered student by providing their email and password. Returns a JWT token upon successful authentication.'
   })
  @ApiResponse({ status: 200, description: 'Login successful' })    
  @ApiResponse({ status: 400, description: 'Invalid login data' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Administrator-only test endpoint',
    description: 'This endpoint is accessible only to users with the ADMIN role.'
   })
  @ApiResponse({ status: 200, description: 'Access granted to an administrator-only endpoint' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to access this resource.' })
  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminTest() {
    return {
      message: 'Access granted to an administrator-only endpoint',
    };
  }
}
