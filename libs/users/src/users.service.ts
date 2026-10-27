import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserEntity } from './entities/users.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { AccountStatus, Role } from '@app/common';

@Injectable()
export class UsersService {
  update(id: string, arg1: { isEmailVerified: boolean; otpCode: null; }) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  private async createWithRole(
    dto: CreateUserDto,
    role: Role,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(UserEntity)
      : this.userRepository;
    const email = dto.email.toLowerCase();

    const existing = await repo.findOne({ where: { email } });
    if (existing)
      throw new ConflictException('User with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await repo.save(
        repo.create({
          name: dto.name,
          email,
          passwordHash,
          primaryRole: role,
          status: AccountStatus.ACTIVE,
        }),
      );
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('User with this email already exists');
      }
      throw err;
    }
  }

  createStudent(dto: CreateUserDto, manager?: EntityManager) {
    return this.createWithRole(dto, Role.STUDENT, manager);
  }

  createOfficer(dto: CreateUserDto, manager?: EntityManager) {
    // admin-only route calls this
    return this.createWithRole(dto, Role.LOANS_OFFICER, manager);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async updateName(id: string, name: string) {
    // self-service
    const user = await this.findById(id);
    user.name = name;
    return this.userRepository.save(user);
  }

  async setStatus(id: string, status: AccountStatus) {
    // admin-only (A9)
    const user = await this.findById(id);
    user.status = status;
    return this.userRepository.save(user);
  }
}
