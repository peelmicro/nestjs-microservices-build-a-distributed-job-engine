import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ClientsModule.registerAsync([
      {
        name: AUTH_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver],
})
export class JobsModule {}
