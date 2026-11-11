import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { University } from './entities/university.entity';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([University]),
    forwardRef(() => AuthModule), 
  ],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}