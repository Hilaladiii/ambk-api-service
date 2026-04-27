import { Module } from '@nestjs/common';
import { MonitoringGateway } from './monitoring.gateway';
import { MonitoringService } from './monitoring.service';

@Module({
  providers: [MonitoringGateway, MonitoringService],
})
export class MonitoringModule {}
