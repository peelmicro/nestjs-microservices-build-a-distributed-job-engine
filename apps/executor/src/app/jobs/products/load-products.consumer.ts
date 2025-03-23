import {
  Packages,
  PRODUCTS_SERVICE_NAME,
  ProductsServiceClient,
} from '@jobber/grpc';
import { Jobs } from '@jobber/nestjs';
import {
  LoadProductsMessage,
  PulsarClient,
  PulsarConsumer,
} from '@jobber/pulsar';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LoadProductsConsumer
  extends PulsarConsumer<LoadProductsMessage>
  implements OnModuleInit
{
  private productsService: ProductsServiceClient;

  constructor(
    pulsarClient: PulsarClient,
    // @Inject(Packages.JOBS) clientJobs: ClientGrpc,
    // @Inject(Packages.PRODUCTS) private clientProducts: ClientGrpc
  ) {
    super(pulsarClient, Jobs.LOAD_PRODUCTS);
  }

  protected async onMessage(data: LoadProductsMessage): Promise<void> {
    this.logger.log(`LoadProductsConsumer: ${JSON.stringify(data, null, 2)}`);
  }
}
