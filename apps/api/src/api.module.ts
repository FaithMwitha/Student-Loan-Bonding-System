import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import {CommonModule} from '@app/common'
import {PaymentsModule} from '../../../libs/payments/src/payments.module';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports:[
    TypeOrmModule.forRoot({
      type:'postgres',
      host:'localhost',
      port:5432,
      username:'postgres',
      password:'moyo',
      database:'loans_board',
      autoLoadEntities:true,
      synchronize:true,
    }),
    CommonModule,
    PaymentsModule,
  ], 
  controllers:[ApiController],
  providers:[ApiService]
})
export class ApiModule {}
