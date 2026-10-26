
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiResponse,ApiOperation,ApiBearerAuth,ApiBody} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@app/users';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt/jwtauthguard';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorators';
import { Role } from '@app/common';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*@Post('register')
  @ApiOperation({ 
    summary: 'Register a new Student' ,
    description: 'Create a new student account using their name, email, and password. The password must be at least 8 characters long.'
  })
  @ApiResponse({
    status: 201,
    description: 'Student account created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 409,
    description: 'Account with this email already exists.',
  })
  register(@Body() body: CreateUserDto) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
    );
  }*/


   @Post('login')
  @ApiOperation({
     summary: 'Login to the system',
     description: 'Authenticates a registered student using their email and password. Returns a JWT token upon successful authentication.'
    })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns a JWT token.',
  })  
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })   
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }


@ApiBearerAuth()
@ApiOperation({
  summary: 'Test administrator access',
  description:
    'Checks whether the authenticated user has the ADMIN role.',
})
@ApiResponse({
  status: 200,
  description: 'Access granted to an administrator.',
})
@ApiResponse({
  status: 401,
  description: 'Missing or invalid access token.',
})
@ApiResponse({
  status: 403,
  description: 'The user does not have administrator permissions.',
})


  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminTest() {
    return {
      message: 'Access granted to an administrator-only endpoint',
    };
  }
}
