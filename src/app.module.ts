import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './configs/env-validation.config';
import { ConfigModule } from '@nestjs/config';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';

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

    RepositoriesModule,
    UsersModule,
    SessionsModule,
    SessionsModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
