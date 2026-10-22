import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AccountStatus } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@app/users';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.usersService.createStudent({
      name,
      email,
      password,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.primaryRole,
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Account is suspended');
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

  private toPublicUser(user: {
    id: string;
    name: string;
    email: string;
    primaryRole: unknown;
    status: unknown;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      primaryRole: user.primaryRole,
      status: user.status,
    };
  }
}
