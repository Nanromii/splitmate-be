import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RepositoriesModule } from '../repositories/repositories.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, JwtAuthGuard],
})
export class ExpensesModule {}
