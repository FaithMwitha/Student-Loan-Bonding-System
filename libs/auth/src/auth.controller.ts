import { Controller, Post, Body, HttpCode, HttpStatus,Get,UseGuards,Req, Put, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty, ApiBody,ApiOkResponse,ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { IsEmail, IsString, Length } from 'class-validator';
import { JwtAuthGuard } from './jwt/jwtauthguard';
import { Request } from 'express';
import{ApiBearerAuth} from '@nestjs/swagger';
import { Role } from '../../common/src';
import { Roles } from './roles/roles.decorators';
import { RolesGuard } from './roles/roles.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Audit } from '@app/audit';
import { AuditAction } from '@app/audit';
import { AuditEntity } from '@app/audit';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @ApiOperation({
  summary: 'Login user',
  description: 'Authenticates students, administrators and loans officers using their email and password.',
})
@ApiOkResponse({
  description: 'Login successful. Returns user details and JWT access token.',
  schema: {
    example: {
      user: {
        id: 'user-123',
        name: 'Jane Student',
        email: 'student@test.com',
        primaryRole: 'STUDENT',
        status: 'ACTIVE',
      },
      accessToken: 'your-jwt-access-token',
    },
  },
})
@ApiUnauthorizedResponse({
  description: 'Invalid email or password, or account is inactive.',
})
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Audit({
    action: AuditAction.LOGIN_SUCCESS,
    entity: AuditEntity.User,
    actorIdFrom: 'response.user.id',
    actorRoleFrom: 'response.user.primaryRole',
    actorEmailFrom: 'response.user.email',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiOperation({
  summary: 'Request password reset OTP',
  description: 'Requests a one-time password reset code to be sent to the registered email address.',
})
@ApiOkResponse({
  description: 'Password reset OTP request processed successfully.',
})
@ApiUnauthorizedResponse({
  description: 'The password reset request cannot be authorized.',
})
 @Put('reset')
@HttpCode(HttpStatus.OK)
@ApiBody({ schema: { example: { email: 'user@example.com' } } })
async requestOtp(@Body('email') email: string) {
        return this.authService.requestOtp(email);
}


@Post('verify-email')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Verify email address',
  description: "Verifies the user's registered email address using a six-digit OTP.",
})
@ApiOkResponse({
  description: 'Email successfully verified.',
  schema: {
    example: {
      message: 'Email successfully verified!',
    },
  },
})
@ApiUnauthorizedResponse({
  description: 'Invalid or expired verification code.',
})
verifyEmail(@Body() dto: VerifyEmailDto) {
  return this.authService.verifyEmail(dto.email, dto.code);
}

@ApiOperation({
  summary: 'Verify password reset OTP',
  description: 'Validates the OTP before allowing the user to proceed with password resetting.',
})
@ApiOkResponse({
  description: 'OTP successfully verified.',
  schema: {
    example: {
      message: 'OTP verified successfully',
    },
  },
})
@ApiUnauthorizedResponse({
  description: 'Invalid or expired OTP.',
})
@Post('reset-password')
@HttpCode(HttpStatus.OK)
@ApiBody({ schema: { example: { email: 'user@example.com', otp: '123456' } } })
    async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
        const isValid = await this.authService.verifyOtp(email, otp);
        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }
        return { message: 'OTP verified successfully' };
    }


@ApiOperation({
  summary: 'Set new password',
  description: 'Sets a new password after OTP verification and password confirmation.',
})
@ApiOkResponse({
  description: 'Password successfully updated.',
})
@ApiUnauthorizedResponse({
  description: 'Invalid or expired password reset OTP.',
})
 @Put('password')
    @ApiBody({ schema: { example: { email: 'user@example.com', otp: '123456', newPassword: 'NewPass123!', confirmPassword: 'NewPass123!' } } })
    async resetPassword(
        @Body('email') email: string,
        @Body('otp') otp: string,
        @Body('newPassword') newPassword: string,
        @Body('confirmPassword') confirmPassword: string,
    ) {
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }
        return this.authService.resetPassword(email, otp, newPassword);
    }


    @ApiOperation({
  summary: 'Get current authenticated user',
  description: 'Retrieves information about the currently logged-in user using their JWT access token.',
})
@ApiBearerAuth()
@ApiOkResponse({
  description: 'Current user details retrieved successfully.',
  schema: {
    example: {
      id: 'user-123',
      name: 'Jane Student',
      email: 'student@test.com',
      primaryRole: 'STUDENT',
      status: 'ACTIVE',
    },
  },
})
@ApiUnauthorizedResponse({
  description: 'Missing, invalid or expired JWT access token.',
})
    @Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
getMe(@Req() req: Request & { user: { sub: string } }) {
  return this.authService.getMe(req.user.sub);
}


@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Logout user',
  description: 'Logs out the user. The client must discard the stored JWT access token.',
})
@ApiOkResponse({
  description: 'Logout successful.',
  schema: {
    example: {
      message: 'Logged out successfully',
    },
  },
})
 @Post('logout')
    async logout() {
        // JWT is stateless — client discards the token
        return { message: 'Logged out successfully' };
    }
}
