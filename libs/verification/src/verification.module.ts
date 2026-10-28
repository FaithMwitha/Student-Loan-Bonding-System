import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@app/users';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { EmailVerification } from './entities/email-verification.entity';
import { DevEmailSender, EmailSender } from './email-sender';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification]), UsersModule],
  controllers: [VerificationController],
  providers: [VerificationService, { provide: EmailSender, useClass: DevEmailSender }],
  exports: [VerificationService],
})
export class VerificationModule {}