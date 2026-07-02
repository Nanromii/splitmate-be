import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RepositoriesModule } from '../repositories/repositories.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [GroupsController],
  providers: [GroupsService, JwtAuthGuard],
})
export class GroupsModule {}
