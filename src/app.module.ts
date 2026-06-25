import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './configs/env-validation.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
      validationSchema: envValidationSchema,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig
    }),
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
