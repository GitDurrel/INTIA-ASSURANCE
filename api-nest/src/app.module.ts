import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BranchesModule } from './branches/branches.module';
import { ClientsModule } from './clients/clients.module';
import { PoliciesModule } from './policies/policies.module';
import { AdminStatsModule } from './admin-stats/admin-stats.module';

@Module({
  imports: [PrismaModule, BranchesModule, ClientsModule, PoliciesModule, AdminStatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
