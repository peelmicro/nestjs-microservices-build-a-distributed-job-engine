import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Jobs } from '@jobber/nestjs';
import { FibonacciMessage, PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { iterate } from 'fibonacci';
import { Packages } from '@jobber/grpc';
import { ClientGrpc } from '@nestjs/microservices';
import { JobConsumer } from '../job.consumer';
@Injectable()
export class FibonacciConsumer
  extends JobConsumer<FibonacciMessage>
  implements OnModuleInit
{
  constructor(
    @Inject(Packages.JOBS) clientJobs: ClientGrpc,
    pulsarClient: PulsarClient,
  ) {
    super(Jobs.FIBONACCI, pulsarClient, clientJobs);
  }

  protected async execute(data: FibonacciMessage): Promise<void> {
    const result = iterate(data.iterations);
    this.logger.log(result);
  }
}
