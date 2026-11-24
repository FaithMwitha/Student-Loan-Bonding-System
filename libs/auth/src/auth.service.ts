import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/src/users.service';
import { UserEntity } from '../../users/src/entities/users.entity';
import { VerificationEntity } from './entities/verification.entity';
import { Verification } from './enums/verification.enums';
import { randomInt } from 'crypto';

import { NotificationsService } from '../../notifications/src/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(VerificationEntity)
    private readonly verificationRepository: Repository<VerificationEntity>,
  ) {}

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.toPublicUser(user);
  }

  async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 1. Check if the account is currently locked
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const remainingMs = user.lockedUntil.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    throw new UnauthorizedException(
      `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
    );
  }

  // 2. If the lock has expired, reset the lock and attempts
  if (user.lockedUntil && user.lockedUntil.getTime() <= Date.now()) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);
  }

  // 3. Check the password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // 4. Lock the account after 4 failed attempts
    if (user.failedLoginAttempts >= 4) {
      user.lockedUntil = new Date(Date.now() + 5 * 60 * 1000);

      await this.userRepository.save(user);

      throw new UnauthorizedException(
        'Too many failed login attempts. Your account is locked for 5 minutes.',
      );
    }

    await this.userRepository.save(user);

    const attemptsRemaining = 4 - user.failedLoginAttempts;

    throw new UnauthorizedException(
      `Invalid email or password. ${attemptsRemaining} attempt(s) remaining before temporary lockout.`,
    );
  }

  // 5. Check account status
  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedException('Your account is not active');
  }

  // 6. Successful login: reset security counters
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await this.userRepository.save(user);

  // 7. Generate JWT
  const accessToken = await this.jwtService.signAsync({
    sub: user.id,
    role: user.primaryRole,
  });

  return {
    user: this.toPublicUser(user),
    accessToken,
  };
}

  private async generateOtp(userId: string, purpose: Verification) {
    const otpCode = randomInt(100000, 1000000).toString();
    const otpCodeHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const verification = this.verificationRepository.create({
      userId,
      otpCodeHash,
      purpose,
      expiresAt,
      isUsed: false,
    });
    
    await this.verificationRepository.update(
      { userId, purpose, isUsed: false },
      { isUsed: true },
    );
    
    await this.verificationRepository.save(verification);

    return otpCode;
  }

  async requestPasswordResetOtp(email: string) {
  const user = await this.usersService.findByEmail(email);

  // Return a generic response to avoid revealing registered emails
  if (!user) {
    return {
      message: 'If an account exists with this email, a password reset OTP will be sent.',
    };
  }

  const otp = await this.generateOtp(
    user.id,
    Verification.PASSWORD_RESET,
  );

  await this.notificationsService.sendOtpEmail(email, otp);

  return {
    message: 'If an account exists with this email, a password reset OTP will be sent.',
  };
}

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) throw new BadRequestException('Email is already verified');

    const verification = await this.verificationRepository.findOne({
      where: { userId: user.id, purpose: Verification.EMAIL_VERIFICATION, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification) throw new BadRequestException('No verification OTP found');
    if (verification.expiresAt.getTime() < Date.now()) throw new BadRequestException('Verification OTP has expired');

    const isValid = await bcrypt.compare(code, verification.otpCodeHash);
    if (!isValid) throw new BadRequestException('Invalid verification code');

    await this.userRepository.update(user.id, { emailVerified: true });
    await this.verificationRepository.update(verification.id, { isUsed: true });

    return { message: 'Email successfully verified' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid or expired OTP');

    const verification = await this.verificationRepository.findOne({
      where: { userId: user.id, purpose: Verification.PASSWORD_RESET, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification || verification.expiresAt.getTime() < Date.now()) {
      return false;
    }

    return bcrypt.compare(otp, verification.otpCodeHash);
  }

  async resetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  const verification = await this.verificationRepository.findOne({
    where: {
      userId: user.id,
      purpose: Verification.PASSWORD_RESET,
      isUsed: false,
    },
    order: { createdAt: 'DESC' },
  });

  if (!verification || verification.expiresAt.getTime() < Date.now()) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  const isValid = await bcrypt.compare(
    otp,
    verification.otpCodeHash,
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await this.userRepository.update(user.id, { passwordHash });

  await this.verificationRepository.update(
    verification.id,
    { isUsed: true },
  );

  return {
    message: 'Password reset successfully',
  };
}
  private toPublicUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      primaryRole: user.primaryRole,
      status: user.status,
    };
  }
}