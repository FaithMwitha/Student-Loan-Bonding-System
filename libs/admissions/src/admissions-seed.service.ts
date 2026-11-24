import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedStudent } from './entities/selected-student.entity';
import { SAMPLE_BATCH, SAMPLE_SELECTION } from './sample-data/sample-selection';

@Injectable()
export class AdmissionsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdmissionsSeedService.name);

  constructor(
    @InjectRepository(SelectedStudent)
    private readonly repo: Repository<SelectedStudent>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'production') return;
    if (this.config.get<string>('SEED_ADMISSIONS') !== 'true') return;

    let added = 0;
    for (const row of SAMPLE_SELECTION) {
      const exists = await this.repo.exists({
        where: { manebId: row.manebId, intakeYear: row.intakeYear },
      });
      if (exists) continue;
      await this.repo.save(
        this.repo.create({
          ...row,
          claimedByUserId: null,
          importBatch: SAMPLE_BATCH,
        }),
      );
      added++;
    }
    this.logger.log(`Simulated admissions roster ready (${added} added)`);
  }
}
