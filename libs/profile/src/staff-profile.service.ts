import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StaffProfile } from './entities/staff-profile.entity';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';

@Injectable()
export class StaffProfileService {
  constructor(
    @InjectRepository(StaffProfile)
    private readonly staffRepository: Repository<StaffProfile>,
  ) {}

  create(userId: string, dto: CreateStaffProfileDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(StaffProfile) : this.staffRepository;
    return repo.save(
      repo.create({
        userId,
        staffNumber: dto.staffNumber ?? null,
        department: dto.department ?? null,
        phone: dto.phone ?? null,
      }),
    );
  }
}