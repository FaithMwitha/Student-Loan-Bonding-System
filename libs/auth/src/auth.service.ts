import { Injectable, UnauthorizedException, BadRequestException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/src/users.service';
import { UserEntity } from '../../users/src/entities/users.entity';
import { VerificationEntity } from './entities/verification.entity';
import { Verification } from './enums/verification.enums';
import { randomInt } from 'crypto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    
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

  // Check that the user exists and the password is correct
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // Prevent inactive accounts from logging in
  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedException('Your account is not active');
  }

  const accessToken = await this.jwtService.signAsync({
    sub: user.id,
    role: user.primaryRole,
  });

  return {
    user: this.toPublicUser(user),
    accessToken,
  };
}

private async generateOtp(
  userId: string,
  purpose: Verification,
) {
  // Generate a six-digit OTP
  const otpCode = randomInt(100000, 1000000).toString();

  // Hash the OTP
  const otpCodeHash = await bcrypt.hash(otpCode, 10);

  // Set expiry time to 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Save verification record
  const verification = this.verificationRepository.create({
    userId,
    otpCodeHash,
    purpose,
    expiresAt,
    isUsed: false,
  });
  await this.verificationRepository.update(
  {
    userId,
    purpose,
    isUsed: false,
  },
  {
    isUsed: true,
  },
);
  await this.verificationRepository.save(verification);

  // Return OTP temporarily for integration/testing
  return otpCode;
  
}
async requestOtp(email: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  if (user.emailVerified) {
    throw new BadRequestException('Email is already verified');
  }

  const otp = await this.generateOtp(
    user.id,
    Verification.EMAIL_VERIFICATION,
  );

  return {
    message: 'Verification OTP generated successfully',
    otp,
  };
}
async verifyEmail(email: string, code: string) {
  // 1. Find the user
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // 2. Check whether email is already verified
  if (user.emailVerified) {
    throw new BadRequestException('Email is already verified');
  }

  // 3. Find the latest unused email verification record
  const verification = await this.verificationRepository.findOne({
    where: {
      userId: user.id,
      purpose: Verification.EMAIL_VERIFICATION,
      isUsed: false,
    },
    order: {
      createdAt: 'DESC',
    },
  });

  if (!verification) {
    throw new BadRequestException('No verification OTP found');
  }

  // 4. Check OTP expiry
  if (verification.expiresAt.getTime() < Date.now()) {
    throw new BadRequestException('Verification OTP has expired');
  }

  // 5. Compare submitted OTP with stored hash
  const isValid = await bcrypt.compare(
    code,
    verification.otpCodeHash,
  );

  if (!isValid) {
    throw new BadRequestException('Invalid verification code');
  }

  // 6. Update user and mark OTP as used
  await this.userRepository.update(user.id, {
    emailVerified: true,
  });

  await this.verificationRepository.update(
    verification.id,
    { isUsed: true },
  );

  return {
    message: 'Email successfully verified',
  };
}
async verifyOtp(email: string, otp: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  const verification = await this.verificationRepository.findOne({
    where: {
      userId: user.id,
      purpose: Verification.PASSWORD_RESET,
      isUsed: false,
    },
    order: {
      createdAt: 'DESC',
    },
  });

  if (
    !verification ||
    verification.expiresAt.getTime() < Date.now()
  ) {
    return false;
  }

  return bcrypt.compare(otp, verification.otpCodeHash);
}
async resetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  // 1. Find the user
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  // 2. Find the latest unused password-reset verification
  const verification = await this.verificationRepository.findOne({
    where: {
      userId: user.id,
      purpose: Verification.PASSWORD_RESET,
      isUsed: false,
    },
    order: {
      createdAt: 'DESC',
    },
  });

  // 3. Check whether OTP exists and has expired
  if (
    !verification ||
    verification.expiresAt.getTime() < Date.now()
  ) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  // 4. Compare submitted OTP with stored hash
  const isValid = await bcrypt.compare(
    otp,
    verification.otpCodeHash,
  );

  if (!isValid) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  // 5. Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // 6. Update user's password
  await this.userRepository.update(user.id, {
    passwordHash,
  });

  // 7. Mark OTP as used
  await this.verificationRepository.update(
    verification.id,
    {
      isUsed: true,
    },
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