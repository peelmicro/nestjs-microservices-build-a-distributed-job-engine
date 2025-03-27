import { Consumer, Message } from 'pulsar-client';
import { PulsarClient } from './pulsar.client';
import { deserialize } from './serializer';
import { Logger } from '@nestjs/common';

export abstract class PulsarConsumer<T> {
  private consumer!: Consumer;
  protected readonly logger = new Logger(this.topic);
  private processing = false;

  constructor(
    private readonly pulsarClient: PulsarClient,
    private readonly topic: string,
  ) {}

  async onModuleInit() {
    this.consumer = await this.pulsarClient.createConsumer(
      this.topic,
      this.listener.bind(this),
    );
  }

  private async listener(message: Message) {
    while (this.processing) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.processing = true;
    try {
      const data = deserialize<T>(message.getData());
      await this.onMessage(data);
      await this.consumer.acknowledge(message);
    } catch (err) {
      this.logger.error(`[${process.pid}] Error:`, err);
      await this.consumer.acknowledge(message);
    } finally {
      this.processing = false;
    }
  }

  protected abstract onMessage(data: T): Promise<void>;
}
