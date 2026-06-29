import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleTokenService } from './google-token.service';

@Module({
  imports: [JwtModule.register({}), RepositoriesModule],
  providers: [AuthService, GoogleTokenService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
