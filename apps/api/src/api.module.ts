import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import {CommonModule} from '@app/common'
import {PaymentsModule} from '../../../libs/payments/src/payments.module';


@Module({
  imports:[
    CommonModule,
    PaymentsModule,
  ], 
  controllers:[ApiController],
  providers:[ApiService]
})
export class ApiModule {}
