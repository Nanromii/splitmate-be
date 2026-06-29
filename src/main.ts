import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('SplitMate API')
    .setDescription('SplitMate Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT || 3000);

  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT}`,
  );

  console.log(
    `📚 Swagger is running on: http://localhost:${process.env.PORT}/api/docs`,
  );
}

void bootstrap();
