import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VerificationEntity } from './entities/verification.entity';
import { VerificationsController } from './verification.controller';
import { VerificationsService } from './verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationEntity])],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}