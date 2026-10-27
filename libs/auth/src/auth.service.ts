import { Injectable, UnauthorizedException, BadRequestException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
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