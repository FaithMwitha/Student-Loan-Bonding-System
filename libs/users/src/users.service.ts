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
import { PagedResult, UserSearchFilter, UserSummary } from './user-search';

@Injectable()
export class UsersService {
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

  // Added by Faith
  createAdmin(dto: CreateUserDto, manager?: EntityManager) {
    return this.createWithRole(dto, Role.ADMIN, manager);
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

  private static likePattern(value: string) {
    return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
  }

  async search(f: UserSearchFilter): Promise<PagedResult<UserSummary>> {
    const page = f.page ?? 1;
    const limit = Math.min(f.limit ?? 20, 100);
    const qb = this.userRepository.createQueryBuilder('u');

    if (f.email)
      qb.andWhere('u.email ILIKE :email', {
        email: UsersService.likePattern(f.email),
      });
    if (f.name)
      qb.andWhere('u.name ILIKE :name', {
        name: UsersService.likePattern(f.name),
      });
    if (f.role) qb.andWhere('u.primaryRole = :role', { role: f.role });
    if (f.status) qb.andWhere('u.status = :status', { status: f.status });
    if (f.emailVerified !== undefined)
      qb.andWhere('u.emailVerified = :ev', { ev: f.emailVerified });
    if (f.createdFrom)
      qb.andWhere('u.createdAt >= :from', {
        from: new Date(`${f.createdFrom}T00:00:00Z`),
      });
    if (f.createdTo) {
      const end = new Date(`${f.createdTo}T00:00:00Z`);
      end.setUTCDate(end.getUTCDate() + 1); // inclusive of the whole end day
      qb.andWhere('u.createdAt < :to', { to: end });
    }

    const sortColumns = {
      createdAt: 'u.createdAt',
      name: 'u.name',
      email: 'u.email',
    } as const;
    const [rows, total] = await qb
      .orderBy(sortColumns[f.sortBy ?? 'createdAt'], f.sortOrder ?? 'DESC')
      .addOrderBy('u.id', 'ASC') // stable paging when values tie
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        primaryRole: u.primaryRole,
        status: u.status,
        emailVerified: !!u.emailVerified,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async stats() {
    const rows = await this.userRepository
      .createQueryBuilder('u')
      .select('u.primaryRole', 'role')
      .addSelect('u.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.primaryRole')
      .addGroupBy('u.status')
      .getRawMany<{ role: string; status: string; count: string }>();

    const byRole: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      const n = Number(r.count);
      total += n;
      byRole[r.role] = (byRole[r.role] ?? 0) + n;
      byStatus[r.status] = (byStatus[r.status] ?? 0) + n;
    }
    return { total, byRole, byStatus };
  }

  async markEmailVerified(id: string) {
    const user = await this.findById(id);
    user.emailVerified = true;
    return this.userRepository.save(user);
  }

  async setPasswordResetCode(
    id: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const user = await this.findById(id);
    user.passwordResetCodeHash = codeHash;
    user.passwordResetExpiresAt = expiresAt;
    await this.userRepository.save(user);
  }

  async resetPassword(id: string, passwordHash: string): Promise<void> {
    const user = await this.findById(id);
    user.passwordHash = passwordHash;
    user.passwordResetCodeHash = null;
    user.passwordResetExpiresAt = null;
    await this.userRepository.save(user);
  }

  async updateName(id: string, name: string) {
    // self-service
    const user = await this.findById(id);
    user.name = name;
    return this.userRepository.save(user);
  }

  async setStatus(id: string, status: AccountStatus) {
    // admin-only (A9); the caller must check who is acting
    const user = await this.findById(id);
    user.status = status;
    return this.userRepository.save(user);
  }
}