import { Controller, Post, Body, HttpCode, HttpStatus,Get,UseGuards,Req, Put, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty, ApiBody } from '@nestjs/swagger';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
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
 @Put('reset')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Request OTP to reset password (sent via email)' })
@ApiBody({ schema: { example: { email: 'user@example.com' } } })
async requestOtp(@Body('email') email: string) {
        return this.authService.requestOtp(email);
}

 @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email using OTP code' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

@Post('reset-password')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Reset password using a reset code' })
@ApiBody({ schema: { example: { email: 'user@example.com', otp: '123456' } } })
    async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
        const isValid = await this.authService.verifyOtp(email, otp);
        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }
        return { message: 'OTP verified successfully' };
    }

 @Put('password')
    @ApiOperation({ summary: 'Set a new password after OTP verification' })
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


    @Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Get current authenticated user' })
getMe(@Req() req: Request & { user: { sub: string } }) {
  return this.authService.getMe(req.user.sub);
}

 @Post('logout')
    @ApiOperation({ summary: 'Logout (client should discard the JWT token)' })
    async logout() {
        // JWT is stateless — client discards the token
        return { message: 'Logged out successfully' };
    }



}