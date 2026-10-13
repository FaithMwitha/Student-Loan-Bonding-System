import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import {CommonModule} from '@app/common'

@Module({
  imports: [CommonModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
