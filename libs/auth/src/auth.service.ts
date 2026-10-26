import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/src/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in.');
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