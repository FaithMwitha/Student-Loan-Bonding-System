import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@app/users';
import { NotificationsModule } from '@app/notifications';
import { NotificationsService } from '@app/notifications';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { EmailVerification } from './entities/email-verification.entity';
import { EmailSender } from './email-sender';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerification]), 
    UsersModule,
    NotificationsModule
  ],
  controllers: [VerificationController],
  providers: [
    VerificationService, 
    { provide: EmailSender, useClass: NotificationsService }
  ],
  exports: [VerificationService],
})
export class VerificationModule {}