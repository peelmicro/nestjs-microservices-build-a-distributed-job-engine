import { Injectable, OnModuleInit } from '@nestjs/common';
import { FibonacciMessage, PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { Logger } from '@nestjs/common';
import { Message } from 'pulsar-client';

@Injectable()
export class FibonacciConsumer
  extends PulsarConsumer<FibonacciMessage>
  implements OnModuleInit
{
  readonly logger = new Logger(FibonacciConsumer.name);

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, 'Fibonacci');
  }

  protected async onMessage(data: FibonacciMessage): Promise<void> {
    this.logger.log(
      `FibonacciConsumer: Received message: ${JSON.stringify(data)}`,
    );
  }
}
