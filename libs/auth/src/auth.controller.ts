import { Controller, Post, Body, HttpCode, HttpStatus,Get,UseGuards,Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { IsEmail, IsString, Length } from 'class-validator';
import { JwtAuthGuard } from './jwt/jwtauthguard';
import { Request } from 'express';
import{ApiBearerAuth} from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
   @Post('forgot-password')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Request a password reset' })
forgotPassword(@Body() dto: ForgotPasswordDto) {
  return this.authService.forgotPassword(dto.email);
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
resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(
    dto.email,
    dto.code,
    dto.newPassword,
  );
}

    @Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Get current authenticated user' })
getMe(@Req() req: Request & { user: { sub: string } }) {
  return this.authService.getMe(req.user.sub);
}


}