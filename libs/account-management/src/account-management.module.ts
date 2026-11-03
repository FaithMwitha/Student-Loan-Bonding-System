import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { ProfileModule } from '@app/profile';
import { UsersModule } from '@app/users';
import { AccountManagementController } from './account-management.controller';
import { AccountManagementService } from './account-management.service';

@Module({
  imports: [UsersModule, ProfileModule, AuthModule],
  controllers: [AccountManagementController],
  providers: [AccountManagementService],
})
export class AccountManagementModule {}