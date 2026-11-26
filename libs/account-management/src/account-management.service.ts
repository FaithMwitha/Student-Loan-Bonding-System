import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountStatus, Role } from '@app/common';
import { UserResponseDto, UsersService } from '@app/users';
import { StaffProfileService } from '@app/profile';
import { NotificationsService } from '../../notifications/src/notifications.service';
import { CreateOfficerDto } from './dto/create-officer.dto';

@Injectable()
export class AccountManagementService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly users: UsersService,
    private readonly staff: StaffProfileService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllOfficers() {
    const officers = await this.users.findUsersByRole(Role.LOANS_OFFICER);
    return officers.map((officer) => UserResponseDto.from(officer));
  }

  async createOfficer(dto: CreateOfficerDto) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
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

      const emailMessage = `Hello ${dto.name}, you have been appointed as a Loans Officer. Your login email is ${dto.email} and your temporary password is ${dto.password}. Please log in and change your password immediately.`;
      
      await this.notificationsService.send(
        dto.email,
        'Welcome to the Loan Board - Your Account is Ready',
        emailMessage,
      );

      return result;
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('An officer with that staff number already exists');
      }
      throw err;
    }
  }

  async getUser(id: string) {
    return UserResponseDto.from(await this.users.findById(id));
  }

  async setStatus(actorId: string, targetId: string, status: AccountStatus) {
    if (actorId === targetId) {
      throw new BadRequestException('You cannot change your own account status');
    }
    return UserResponseDto.from(await this.users.setStatus(targetId, status));
  }
}