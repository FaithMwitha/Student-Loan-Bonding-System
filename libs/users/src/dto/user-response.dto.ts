import { Role, AccountStatus } from '@app/common';
import { UserEntity } from '../entities/users.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  primaryRole: Role;
  status: AccountStatus;

  static from(user: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.primaryRole = user.primaryRole;
    dto.status = user.status;
    return dto;
  }
}
