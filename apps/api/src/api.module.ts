
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';

import { CommonModule } from '@app/common';
import { AuthModule } from '@app/auth';
import { ProfileModule } from '@app/profile';
import { LoansModule } from '@app/loans';
import { ReviewModule } from '@app/review';
import { NotificationsModule } from '@app/notifications';
import { PaymentsModule } from '@app/payments';
import { VerificationModule } from '@app/verification';
import { AccountManagementModule } from '@app/account-management';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),

    CommonModule,
    AuthModule,
    ProfileModule,
    LoansModule,
    ReviewModule,
    NotificationsModule,
    PaymentsModule,
    VerificationModule,
    AccountManagementModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
