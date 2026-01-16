import { Controller, Get } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';

@Controller('admin-stats')
export class AdminStatsController {
  constructor(private readonly service: AdminStatsService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }
}
