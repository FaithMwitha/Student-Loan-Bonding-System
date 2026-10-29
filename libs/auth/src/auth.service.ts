import { Injectable, UnauthorizedException, BadRequestException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/src/users.service';
import { UserEntity } from '../../users/src/entities/users.entity';



@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>,
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

/*async forgotPassword(email: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const passwordResetCodeHash = await bcrypt.hash(code, 10);

  user.passwordResetCodeHash = passwordResetCodeHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await this.userRepository.save(user);

  return {
    message: 'Password reset code generated. Email delivery is not implemented yet.',
  };
}

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.otpCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      otpCode: null,
    });

    return { message: 'Email successfully verified!' };
  }

  async resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new BadRequestException('Invalid or expired reset code');
  }

  if (
    !user.passwordResetCodeHash ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt.getTime() < Date.now()
  ) {
    throw new BadRequestException('Invalid or expired reset code');
  }

  const isValidCode = await bcrypt.compare(
    code,
    user.passwordResetCodeHash,
  );

  if (!isValidCode) {
    throw new BadRequestException('Invalid or expired reset code');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  // We need a UsersService method to save this password and clear the reset code.
  // Do not change the database directly from AuthService.
  await this.usersService.resetPassword(user.id, passwordHash);

return {
  message: 'Password reset successfully.',
};
}*/
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