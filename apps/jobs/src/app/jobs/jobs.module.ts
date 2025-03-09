import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FibonacciJob } from './fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';

@Module({
  imports: [ConfigModule, DiscoveryModule],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver],
})
export class JobsModule {}
