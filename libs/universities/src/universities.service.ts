import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { University } from './entities/university.entity';
import { CreateUniversityDto } from './dto/create-university.dto';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University)
    private readonly uniRepo: Repository<University>,
  ) {}

  async create(dto: CreateUniversityDto) {
    const uni = this.uniRepo.create(dto);
    return this.uniRepo.save(uni);
  }

  async findAll() {
    return this.uniRepo.find();
  }

  async findOneByName(name: string) {
    const uni = await this.uniRepo.findOne({ where: { name } });
    if (!uni) throw new NotFoundException('University not found');
    return uni;
  }
}