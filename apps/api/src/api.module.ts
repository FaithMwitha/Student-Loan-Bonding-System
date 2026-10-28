import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { CommonModule } from '@app/common';
import { AuthModule } from '@app/auth';
import { LoansModule } from '@app/loans';
import { NotificationsModule } from '@app/notifications';
import { ProfileModule } from '@app/profile';
import { PaymentsModule } from '@app/payments';
import { ReviewModule } from '@app/review';
import { VerificationModule } from '@app/verification';

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

        // Development only: automatically creates/updates entity tables.
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),

    CommonModule,
    AuthModule,
    LoansModule,
    NotificationsModule,
    ProfileModule,
    PaymentsModule,
    ReviewModule,
    VerificationModule, 
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}