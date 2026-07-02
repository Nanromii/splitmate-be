import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import authConfig from './configs/auth.config';
import { databaseConfig } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './configs/env-validation.config';
import { ConfigModule } from '@nestjs/config';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
      load: [authConfig],
      validationSchema: envValidationSchema,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),

    RepositoriesModule,
    AuthModule,
    GroupsModule,
    UsersModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
