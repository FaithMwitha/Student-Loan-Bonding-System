import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dns from 'dns';
import { ApiModule } from './api.module';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Student Loan Application System')
      .setDescription(
        'Official API documentation for the Student Loan Application and Bonding System. This API handles student registration, loan applications, dynamic university fee calculations, payments, and loans officer reviews.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        tagsSorter: (a: string, b: string) => {
          if (a === b) return 0;
          return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
        },
        operationsSorter: 'alpha',
        persistAuthorization: true,
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();