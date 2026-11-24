import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { SelectedStudent } from './entities/selected-student.entity';
import { RosterEntry } from './interfaces/roster-entity';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(SelectedStudent)
    private readonly repo: Repository<SelectedStudent>,
  ) {}

  /** The unclaimed roster entry for this MANEB ID and date of birth, or null. */
  async findClaimable(manebId: string, dateOfBirth: string, manager?: EntityManager): Promise<RosterEntry | null> {
    const repo = manager ? manager.getRepository(SelectedStudent) : this.repo;
    const row = await repo.findOne({
      where: { manebId, dateOfBirth, claimedByUserId: IsNull() },
      order: { intakeYear: 'DESC' },
    });
    if (!row) return null;
    const { claimedByUserId, importBatch, createdAt, ...entry } = row;
    return entry as RosterEntry;
  }

  /** Marks the entry as claimed. Returns false if someone else claimed it first. */
  async claim(id: string, userId: string, manager?: EntityManager): Promise<boolean> {
    const result = await (manager ?? this.repo.manager)
      .createQueryBuilder()
      .update(SelectedStudent)
      .set({ claimedByUserId: userId })
      .where('id = :id AND claimed_by_user_id IS NULL', { id })
      .execute();
    return (result.affected ?? 0) === 1;
  }
}