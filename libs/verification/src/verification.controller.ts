import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResendEmailDto } from './dto/resend-email.dto';

@ApiTags('Verification')
@Controller('verification/email')
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Body() dto: ConfirmEmailDto) {
    return this.verification.confirm(dto.email, dto.code);
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  resend(@Body() dto: ResendEmailDto) {
    return this.verification.resend(dto.email);
  }
}