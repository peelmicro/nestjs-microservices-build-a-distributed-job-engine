import { Producer } from 'pulsar-client';
import { PulsarClient, serialize } from '@jobber/pulsar';

export abstract class AbstractJob<T> {
  private producer: Producer;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async execute(data: T, name: string) {
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(name);
    }
    await this.producer.send({ data: serialize(data) });
  }
}
