import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ApiModule } from './api.module';
import {SwaggerModule,DocumentBuilder} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();