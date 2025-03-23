import { Module } from '@nestjs/common';
import { LoadProductsConsumer } from './load-products.consumer';
import { PulsarModule } from '@jobber/pulsar';

@Module({
  imports: [PulsarModule],
  providers: [LoadProductsConsumer],
})
export class LoadProductModule {}
