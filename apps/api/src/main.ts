import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ApiModule } from './api.module';

async function bootstrap() {
  // Changed to NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve the uploaded documents
  app.useStaticAssets(join(__dirname, '..', '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Student Loan Bonding System')
      .setDescription(
        'API documentation for the payment and bonding modules',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();