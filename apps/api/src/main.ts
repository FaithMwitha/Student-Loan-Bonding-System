import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
<<<<<<< HEAD
  app.setGlobalPrefix('api');
  
=======

>>>>>>> origin/main
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

<<<<<<< HEAD
  const config = new DocumentBuilder()
    .setTitle('Loan System')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
=======
  // API docs are for development only. Never expose them in production.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Student Loan Bonding System API')
      .setDescription('Registration, login, loan applications and more')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }
>>>>>>> origin/main

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();