import { Producer } from 'pulsar-client';
import { PulsarClient, serialize } from '@jobber/pulsar';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  protected abstract messageClass: new () => T;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async execute(data: T, name: string) {
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(name);
    }
    if (Array.isArray(data)) {
      for (const message of data) {
        this.send(message);
      }
      return;
    }
    this.send(data);
  }

  private send(data: T) {
    this.validateData(data).then(() =>
      this.producer.send({ data: serialize(data) }),
    );
  }

  private async validateData(data: T) {
    const errors = await validate(plainToInstance(this.messageClass, data));
    if (errors.length) {
      throw new BadRequestException(
        `Job data is invalid: ${JSON.stringify(errors, null, 2)}`,
      );
    }
  }
}
