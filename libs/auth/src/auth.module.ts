import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../../users/src/users.module';
import { NotificationsModule } from '../../notifications/src/notifications.module'; 
import { JwtAuthGuard } from './jwt/jwtauthguard';
import { RolesGuard } from './roles/roles.guard';
import { UserEntity } from '../../users/src/entities/users.entity';
import { VerificationEntity } from './entities/verification.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    forwardRef(() => NotificationsModule), 
    TypeOrmModule.forFeature([UserEntity, VerificationEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET is not configured');
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '15m') as any;
        return { secret, signOptions: { expiresIn } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, ConfigModule],
})
export class AuthModule {}