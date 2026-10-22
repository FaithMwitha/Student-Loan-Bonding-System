import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ApiModule } from './api.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config=new DocumentBuilder()
  .setTitle('Student Loan Bonding System API')
  .setDescription('API documentation for the payment and bonding modules')
  .setVersion('1.0')
  .addTag('payments')
  .build()

  const document=SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app,document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
