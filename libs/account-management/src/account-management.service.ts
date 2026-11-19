import {
  BadRequestException,
  ConflictException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountStatus } from '@app/common';
import { UserResponseDto, UsersService } from '@app/users';
import { StaffProfileService } from '@app/profile';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { Role } from '@app/common';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class AccountManagementService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly users: UsersService,
    private readonly staff: StaffProfileService,
  ) {}

  async createOfficer(dto: CreateOfficerDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const user = await this.users.createOfficer(
          { name: dto.name, email: dto.email, password: dto.password },
          manager,
        );
        const profile = await this.staff.create(user.id, dto, manager);
        return {
          user: UserResponseDto.from(user),
          staff: {
            staffNumber: profile.staffNumber,
            department: profile.department,
            phone: profile.phone,
          },
        };
      });
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException(
          'An officer with that staff number already exists',
        );
      }
      throw err;
    }
  }

  async getUser(id: string) {
    return UserResponseDto.from(await this.users.findById(id));
  }
  async list(filter: UserFilterDto) {
    return this.users.search(filter);
  }
  
  async stats() {
    return this.users.stats();
  }
  async setStatus(actorId: string, targetId: string, status: AccountStatus) {
    const actor = await this.users.findById(actorId);
    if (
      actor.primaryRole !== Role.ADMIN ||
      actor.status !== AccountStatus.ACTIVE
    ) {
      throw new ForbiddenException('Your account cannot perform this action');
    }
    if (actorId === targetId) {
      throw new BadRequestException(
        'You cannot change your own account status',
      );
    }
    return UserResponseDto.from(await this.users.setStatus(targetId, status));
  }
}
