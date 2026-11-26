import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { ProfileModule } from '@app/profile';
import { UsersModule } from '@app/users';
import { NotificationsModule } from '../../notifications/src/notifications.module';
import { AccountManagementController } from './account-management.controller';
import { AccountManagementService } from './account-management.service';

@Module({
  imports: [
    UsersModule,
    ProfileModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AccountManagementController],
  providers: [AccountManagementService],
})
export class AccountManagementModule {}