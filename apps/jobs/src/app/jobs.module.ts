import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'path';
import { PulsarModule } from '@jobber/pulsar';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    PulsarModule,
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, 'proto', 'auth.proto'),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver],
})
export class JobsModule {}
