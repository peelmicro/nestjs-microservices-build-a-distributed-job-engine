# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 4)

## 7. Creating the Pulsar Job Executor

### 7.1 Modifying the docker-compose.yml file to add the pulsar job executor

- We need to add the pulsar job executor to the docker-compose.yml file.
- We are including the command that will override the default command of the pulsar image.
- We are using the `standalone` mode, which is the simplest mode of Pulsar and it's better for local development.

> docker-compose.yaml

```diff
services:
  postgres:
    image: postgres
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: example
      POSTGRES_MULTIPLE_DATABASES: auth
    volumes:
      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
      - postgres_data:/var/lib/postgresql/data

+ pulsar:
+   image: apachepulsar/pulsar
+   command: >
+     /pulsar/bin/pulsar standalone
+   ports:
+     - 6650:6650
+   restart: always

volumes:
  postgres_data:
```

- We can now start the services with the following command to ensure that the pulsar job executor is running:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker-compose up
Creating network "nestjs-microservices-build-a-distributed-job-engine_default" with the default driver
Pulling pulsar (apachepulsar/pulsar:)...
latest: Pulling from apachepulsar/pulsar
f18232174bc9: Pull complete
3a0e79a38cc5: Pull complete
0268f0e59106: Pull complete
359b7d0d80c2: Pull complete
197b88b6d531: Pull complete
8a4ffbb26a2a: Pull complete
20352fa7fe37: Pull complete
f5eecdf262ea: Pull complete
3d1755bf9c39: Pull complete
4f4fb700ef54: Pull complete
17b0ffd44ad9: Pull complete
Digest: sha256:50af6732578c03d96eb73e5579b020955d21cb54be94b697913fdd4fe4c07f62
Status: Downloaded newer image for apachepulsar/pulsar:latest
Creating nestjs-microservices-build-a-distributed-job-engine_postgres_1 ... done
Creating nestjs-microservices-build-a-distributed-job-engine_pulsar_1   ... done
Attaching to nestjs-microservices-build-a-distributed-job-engine_pulsar_1, nestjs-microservices-build-a-distributed-job-engine_postgres_1
postgres_1  |
postgres_1  | PostgreSQL Database directory appears to contain a database; Skipping initialization
postgres_1  |
postgres_1  | 2025-03-12 04:25:32.134 UTC [1] LOG:  starting PostgreSQL 17.3 (Debian 17.3-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
postgres_1  | 2025-03-12 04:25:32.135 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgres_1  | 2025-03-12 04:25:32.135 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgres_1  | 2025-03-12 04:25:32.136 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres_1  | 2025-03-12 04:25:32.140 UTC [29] LOG:  database system was shut down at 2025-03-11 07:23:38 UTC
postgres_1  | 2025-03-12 04:25:32.150 UTC [1] LOG:  database system is ready to accept connections
pulsar_1    | 2025-03-12T04:25:34,215+0000 [main] INFO  org.apache.pulsar.PulsarStandalone - Starting BK with RocksDb metadata store
pulsar_1    | 2025-03-12T04:25:34,470+0000 [main] INFO  org.apache.pulsar.metadata.impl.RocksdbMetadataStore - new RocksdbMetadataStore,url=MetadataStoreConfig(sessionTimeoutMillis=30000, allowReadOnlyOperations=false, configFilePath=null, batchingEnabled=true, batchingMaxDelayMillis=5, batchingMaxOperations=1000, batchingMaxSizeKb=128, metadataStoreName=metadata-store, fsyncEnable=true, synchronizer=null, openTelemetry=DefaultOpenTelemetry{propagators=DefaultContextPropagators{textMapPropagator=NoopTextMapPropagator}}),instanceId=1
.
pulsar_1    | 2025-03-12T04:25:41,501+0000 [pulsar-web-49-16] INFO  org.eclipse.jetty.server.RequestLog - 127.0.0.1 - - [12/Mar/2025:04:25:41 +0000] "GET /admin/v2/persistent/public/functions/coordinate/stats?getPreciseBacklog=false&subscriptionBacklogSize=false&getEarliestTimeInBacklog=false&excludePublishers=false&excludeConsumers=false HTTP/1.1" 200 987 "-" "Pulsar-Java-v4.0.3" 28
pulsar_1    | 2025-03-12T04:25:41,541+0000 [worker-scheduler-0] INFO  org.apache.pulsar.functions.worker.SchedulerManager - Schedule summary - execution time: 0.071779879 sec | total unassigned: 0 | stats: {"Added": 0, "Updated": 0, "removed": 0}
pulsar_1    | {
pulsar_1    |   "c-standalone-fw-localhost-8080" : {
pulsar_1    |     "originalNumAssignments" : 0,
pulsar_1    |     "finalNumAssignments" : 0,
pulsar_1    |     "instancesAdded" : 0,
pulsar_1    |     "instancesRemoved" : 0,
pulsar_1    |     "instancesUpdated" : 0,
pulsar_1    |     "alive" : true
pulsar_1    |   }
pulsar_1    | }
.
```

### 7.2 Adding a new library to the project to manage Pulsar

#### 7.2.1 Adding the library to the project

- We are going to use `nx` CLI to create a new library to manage Pulsar.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ cd libs
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/libs$ nx g library pulsar
✔ Which generator would you like to use? · @nx/nest:library

 NX  Generating @nx/nest:library

✔ Which linter would you like to use? · none
✔ Which unit test runner would you like to use? · none
CREATE libs/pulsar/tsconfig.lib.json
CREATE libs/pulsar/tsconfig.json
CREATE libs/pulsar/src/index.ts
CREATE libs/pulsar/README.md
CREATE libs/pulsar/project.json
UPDATE tsconfig.base.json
CREATE libs/pulsar/src/lib/pulsar.module.ts

 NX   👀 View Details of pulsar

Run "nx show project pulsar" to view details about this project.


 NX   👀 View Details of pulsar

Run "nx show project pulsar" to view details about this project.
```

#### 7.2.2 Adding the Pulsar client package to the library

- We are going to add the `pulsar-client` package to the library.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i pulsar-client --legacy-peer-deps
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.
npm warn deprecated npmlog@5.0.1: This package is no longer supported.
npm warn deprecated gauge@3.0.2: This package is no longer supported.

added 41 packages, removed 1 package, and audited 1343 packages in 5s

226 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 7.2.3 Adding the `PULSAR_SERVICE_URL` environment variable to the jobs project

- We are going to add the `PULSAR_SERVICE_URL` environment variable to the jobs project.

> apps/jobs/.env

```diff
PORT=3001
+PULSAR_SERVICE_URL=pulsar://localhost:6650
```

#### 7.2.4 Adding the Pulsar client to the library

- We are going to create the `pulsar.client.ts` file to create the Pulsar client.

> libs/pulsar/src/lib/pulsar.client.ts

```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Consumer, Message, Producer } from 'pulsar-client';

@Injectable()
export class PulsarClient implements OnModuleDestroy {
  private readonly client = new Client({
    serviceUrl: this.configService.getOrThrow<string>('PULSAR_SERVICE_URL'),
  });
  private readonly producers: Producer[] = [];
  private readonly consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  async createProducer(topic: string) {
    const producer = await this.client.createProducer({
      blockIfQueueFull: true,
      topic,
    });
    this.producers.push(producer);
    return producer;
  }

  async createConsumer(topic: string, listener: (message: Message) => void) {
    const consumer = await this.client.subscribe({
      subscriptionType: 'Shared',
      topic,
      subscription: 'jobber',
      listener,
    });
    this.consumers.push(consumer);
    return consumer;
  }

  async onModuleDestroy() {
    for (const producer of this.producers) {
      await producer.close();
    }
    await this.client.close();
  }
}
```

#### 7.2.5 Modifying the `pulsar.module.ts` file to include the Pulsar client

- We are going to modify the `pulsar.module.ts` file to include the Pulsar client.

> libs/pulsar/src/lib/pulsar.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PulsarClient } from './pulsar.client';
@Module({
  controllers: [],
  providers: [PulsarClient],
  exports: [PulsarClient],
})
export class PulsarModule {}
```

#### 7.2.6 Adding the Pulsar Client to the `index.ts` file

- We are going to add the Pulsar client to the `index.ts` file.

> libs/pulsar/src/index.ts

```typescript
export * from './lib/pulsar.module';
export * from './lib/pulsar.client';
```

#### 7.2.7 Modifying the `AbstractJob` class to use the Pulsar client

##### 7.2.7.1 Modifying the `AbstractJob` class to use the Pulsar client

- We are going to modify the `AbstractJob` class to use the Pulsar client.

> apps/jobs/src/jobs/abstract.job.ts

```typescript
import { Producer } from 'pulsar-client';
import { PulsarClient } from '@jobber/pulsar';
import { OnModuleDestroy } from '@nestjs/common';

export abstract class AbstractJob implements OnModuleDestroy {
  private producer: Producer;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async execute(data: object, name: string) {
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(name);
    }
    await this.producer.send({ data: Buffer.from(JSON.stringify(data)) });
  }

  async onModuleDestroy() {
    await this.producer.close();
  }
}
```

##### 7.2.7.2 Modifying the `jobs.module.ts` file to use the Pulsar client

- We are going to modify the `jobs.module.ts` file to use the Pulsar client.

> apps/jobs/src/app/jobs/jobs.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FibonacciJob } from './fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from 'types/proto/auth';
import { join } from 'path';
+import { PulsarModule } from '@jobber/pulsar';
@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
+   PulsarModule,
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
```

##### 7.2.7.3 Modifying the `jobs.service.ts` file to use the Pulsar client

- We are going to modify the `jobs.service.ts` file to use the Pulsar client.

> apps/jobs/src/app/jobs/jobs.service.ts

```ts
import { DiscoveredClassWithMeta, DiscoveryService } from '@golevelup/nestjs-discovery';
import { BadRequestException, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { JOB_METADATA_KEY } from '../decorators/job.decorator';
import { JobMetadata } from '../interfaces/job-metadata.interface';
import { AbstractJob } from './abstract.job';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobMetadata>[] = [];

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.jobs = await this.discoveryService.providersWithMetaAtKey<JobMetadata>(JOB_METADATA_KEY);
    console.log(this.jobs);
  }

  getJobsMetadata() {
    return this.jobs.map((job) => job.meta);
  }

  async executeJob(name: string, data?: any) {
    const job = this.jobs.find((job) => job.meta.name === name);
    if (!job) {
      throw new BadRequestException(`Job with name ${name} not found`);
    }
    if (!(job.discoveredClass.instance instanceof AbstractJob)) {
      throw new InternalServerErrorException('Job is not an instance of AbstractJob.');
    }
    return job.discoveredClass.instance.execute(data || {}, job.meta.name);
  }

  getJobByName(name: string) {
    const job = this.jobs.find((job) => job.meta.name === name);
    if (!job) {
      throw new BadRequestException(`Job with name ${name} not found`);
    }

    // Return a Job object with the metadata
    return {
      name: job.meta.name,
      description: job.meta.description,
    };
  }
}
```

##### 7.2.7.4 Modifying the `app.module.ts` file to make ConfigModule available globally

- We are going to modify the `app.module.ts` file to make ConfigModule available globally.

> apps/jobs/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
-   ConfigModule,
+   ConfigModule.forRoot({
+     isGlobal: true,
+   }),
    JobsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

##### 7.2.7.5 Modifying the `fibonacci.job.ts` file to use the Pulsar client

- We are going to modify the `fibonacci.job.ts` file to use the Pulsar client.

> apps/jobs/src/app/jobs/fibonacci/fibonacci.job.ts

```diff
import { PulsarClient } from '@jobber/pulsar';
import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract.job';

@Job({
  name: 'Fibonacci',
  description: 'Generate a Fibonacci sequence and store it in the DB.',
})
export class FibonacciJob extends AbstractJob {
+ constructor(pulsarClient: PulsarClient) {
+   super(pulsarClient);
+ }
}
```

##### 7.2.7.6 Modifying the `jobs.resolver.ts` file to use the Pulsar client

- We are going to modify the `jobs.resolver.ts` file to use the Pulsar client.

> apps/jobs/src/app/jobs/jobs.resolver.ts

```diff
import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { Job } from './models/job.model';
import { ExecuteJobInput } from './dto/execute-job.input';
import { GqlAuthGuard } from '@jobber/nestjs';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [Job], { name: 'jobsMetadata' })
  @UseGuards(GqlAuthGuard)
  async getJobsMetadata() {
    return this.jobsService.getJobsMetadata();
  }

  @Mutation(() => Job)
  @UseGuards(GqlAuthGuard)
  async executeJob(@Args('executeJobInput') executeJobInput: ExecuteJobInput) {
-   return this.jobsService.executeJob(executeJobInput.name);
+   await this.jobsService.executeJob(executeJobInput.name, executeJobInput?.data);

+   // Return a Job object to satisfy the GraphQL schema
+   const job = this.jobsService.getJobByName(executeJobInput.name);
+   return job;
  }
}
```

##### 7.2.7.7 Modifying the `execute-job.input.ts` file to use the `data` field

- We need to install the `graphql-type-json` package to use the `data` field.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i graphql-type-json --legacy-peer-deps

added 1 package, removed 1 package, and audited 1344 packages in 2s

226 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

- We are going to modify the `execute-job.input.ts` file to use the `data` field.

> apps/jobs/src/app/jobs/dto/execute-job.input.ts

```diff
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
+ import GraphQLJSON from 'graphql-type-json';

@InputType()
export class ExecuteJobInput {
  @Field()
  @IsNotEmpty()
  name: string;

+ @Field(() => GraphQLJSON, { nullable: true })
+ @IsOptional()
+ data?: Record<string, any>;
}
```

##### 7.2.7.8 Testing the Pulsar job executor

- We are going to test the Pulsar job executor by executing the `Fibonacci` job using the `job.http` file .

> apps/jobs/job.http

```http
### Execute job with valid name
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci"}) {
    name
  }
}
```

- We can see this reponse:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-wQABZaZuEWdkap9GXaLdYq62qH4"
Date: Wed, 12 Mar 2025 17:53:29 GMT
Connection: close

{
  "data": {
    "executeJob": {
      "name": "Fibonacci"
    }
  }
}
```

##### 7.2.7.9 Getting the information about the job inside the Docker container

- Then we can get the information about the job inside the Docker container using the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker ps
CONTAINER ID   IMAGE                 COMMAND                  CREATED       STATUS       PORTS                                       NAMES
12c69c8ec0b7   postgres              "docker-entrypoint.s…"   3 hours ago   Up 3 hours   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   nestjs-microservices-build-a-distributed-job-engine_postgres_1
83a812889ec5   apachepulsar/pulsar   "/pulsar/bin/pulsar …"   3 hours ago   Up 3 hours   0.0.0.0:6650->6650/tcp, :::6650->6650/tcp   nestjs-microservices-build-a-distributed-job-engine_pulsar_1
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker exec -it 83a812889ec5 /bin/bash
83a812889ec5:/pulsar$ bin/pulsar-admin topics list public/default
persistent://public/default/Fibonacci
83a812889ec5:/pulsar$ bin/pulsar-admin topics stats persistent://public/default/Fibonacci
{
  "msgRateIn" : 0.13807601637585476,
  "msgThroughputIn" : 6.627648786041028,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "bytesInCounter" : 48,
  "msgInCounter" : 1,
  "systemTopicBytesInCounter" : 0,
  "bytesOutCounter" : 0,
  "msgOutCounter" : 0,
  "bytesOutInternalCounter" : 0,
  "averageMsgSize" : 47.99999999999999,
  "msgChunkPublished" : false,
  "storageSize" : 48,
  "backlogSize" : 0,
  "backlogQuotaLimitSize" : 10737418240,
  "backlogQuotaLimitTime" : -1,
  "oldestBacklogMessageAgeSeconds" : -1,
  "publishRateLimitedTimes" : 0,
  "earliestMsgPublishTimeInBacklogs" : 0,
  "offloadedStorageSize" : 0,
  "lastOffloadLedgerId" : 0,
  "lastOffloadSuccessTimeStamp" : 0,
  "lastOffloadFailureTimeStamp" : 0,
  "ongoingTxnCount" : 0,
  "abortedTxnCount" : 0,
  "committedTxnCount" : 0,
  "publishers" : [ {
    "accessMode" : "Shared",
    "msgRateIn" : 0.13807601637585476,
    "msgThroughputIn" : 6.627648786041028,
    "averageMsgSize" : 48.0,
    "chunkedMessageRate" : 0.0,
    "producerId" : 0,
    "supportsPartialProducer" : false,
    "producerName" : "standalone-19-0",
    "address" : "/172.18.0.1:58912",
    "connectedSince" : "2025-03-13T05:19:16.073608322Z",
    "clientVersion" : "Pulsar-CPP-v3.7.0",
    "metadata" : { }
  } ],
  "waitingPublishers" : 0,
  "subscriptions" : { },
  "replication" : { },
  "deduplicationStatus" : "Disabled",
  "nonContiguousDeletedMessagesRanges" : 0,
  "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
  "delayedMessageIndexSizeInBytes" : 0,
  "compaction" : {
    "lastCompactionRemovedEventCount" : 0,
    "lastCompactionSucceedTimestamp" : 0,
    "lastCompactionFailedTimestamp" : 0,
    "lastCompactionDurationTimeInMills" : 0
  },
  "ownerBroker" : "localhost:8080"
}
```

### 7.3 Implementing the `Abstract Consumer`

#### 7.3.1 Creating the `pulsar.consumer.ts` file

##### 7.3.1.1 Creating the `serializer` file

- We are going to create the `serializer` file needed to implement the `Abstract Consumer`.

> libs/pulsar/src/lib/serializer.ts

```ts
export const serialize = <T>(data: T): Buffer => {
  return Buffer.from(JSON.stringify(data));
};

export const deserialize = <T>(data: Buffer): T => {
  return JSON.parse(data.toString());
};
```

##### 7.3.1.2 Creating the definition of used messages

- We are going to create the some message classes that will be used to communicate between the job engine and the job executor.

> libs/pulsar/src/lib/messages/job.message.ts

```ts
export class JobMessage {
  jobId: number | undefined;
}
```

> libs/pulsar/src/lib/messages/fibonacci.message.ts

```ts
import { IsNotEmpty, IsNumber } from 'class-validator';
import { JobMessage } from './job.message';

export class FibonacciMessage extends JobMessage {
  @IsNumber()
  @IsNotEmpty()
  iterations: number | undefined;
}
```

##### 7.3.1.3 Creating the `pulsar.consumer.ts` file

- We are going to create the `pulsar.consumer.ts` file to implement the `Abstract Consumer`.

> libs/pulsar/src/lib/pulsar.consumer.ts

```ts
import { Consumer, Message } from 'pulsar-client';
import { PulsarClient } from './pulsar.client';
import { deserialize } from './serializer';
import { Logger } from '@nestjs/common';

export abstract class PulsarConsumer<T> {
  private consumer!: Consumer;
  protected readonly logger = new Logger(this.topic);

  constructor(
    private readonly pulsarClient: PulsarClient,
    private readonly topic: string,
  ) {}

  async onModuleInit() {
    this.consumer = await this.pulsarClient.createConsumer(this.topic, this.listener.bind(this));
  }

  private async listener(message: Message) {
    try {
      const data = deserialize<T>(message.getData());
      this.logger.debug(`Received message: ${JSON.stringify(data)}`);
      await this.onMessage(data);
    } catch (err) {
      this.logger.error(err);
    } finally {
      await this.consumer.acknowledge(message);
    }
  }

  protected abstract onMessage(data: T): Promise<void>;
}
```

### 8 Creating the `Job Executor`

#### 8.1 Creating the `Job Executor` microservice

- We are going to create the `Job Executor` microservice to implement the `Abstract Consumer`.
- We are going to use `Nx` to create the `Job Executor` microservice.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps$ nx g app executor
✔ Which generator would you like to use? · @nx/nest:application

 NX  Generating @nx/nest:application

✔ Which linter would you like to use? · none
✔ Which unit test runner would you like to use? · none
CREATE apps/executor/src/assets/.gitkeep
CREATE apps/executor/src/main.ts
CREATE apps/executor/tsconfig.app.json
CREATE apps/executor/tsconfig.json
CREATE apps/executor/webpack.config.js
CREATE apps/executor/project.json
CREATE apps/executor-e2e/project.json
UPDATE nx.json
CREATE apps/executor-e2e/jest.config.ts
CREATE apps/executor-e2e/src/executor/executor.spec.ts
CREATE apps/executor-e2e/src/support/global-setup.ts
CREATE apps/executor-e2e/src/support/global-teardown.ts
CREATE apps/executor-e2e/src/support/test-setup.ts
CREATE apps/executor-e2e/tsconfig.json
CREATE apps/executor-e2e/tsconfig.spec.json
CREATE apps/executor/src/app/app.controller.spec.ts
CREATE apps/executor/src/app/app.controller.ts
CREATE apps/executor/src/app/app.module.ts
CREATE apps/executor/src/app/app.service.spec.ts
CREATE apps/executor/src/app/app.service.ts

 NX   👀 View Details of executor-e2e

Run "nx show project executor-e2e" to view details about this project.


 NX   👀 View Details of executor

Run "nx show project executor" to view details about this project.
```

#### 8.2 Creating an `init` file for all the microservices to be used in the `main.ts` file

- We are going to create a `init` file for all the microservices.

> libs/nestjs/src/lib/init.ts

```ts
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

export async function init(app: INestApplication) {
  const globalPrefix = 'api';
  app.use(express.json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());
  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
```

- We are going to use the `init` file in the `main.ts` file of all the microservices.

> apps/executor/src/main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);
}

bootstrap();
```

> apps/jobs/src/main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);
}

bootstrap();
```

> apps/auth/src/main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from 'types/proto/auth';
import { join } from 'path';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto', 'auth.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
```

#### 8.3 Creating the `jobs` module in the `executor` microservice

##### 8.3.1 Cleaning the `executor` microservice

- We are going to remove the `app.controller.ts`, `app.service.ts`, `app.controller.spec.ts` and `app.module.ts` files.
- We are going to remove those files from the app.module.ts file.

##### 8.3.2 Creating the `FibonacciConsumer` consumer to ensure that when a message is created with the jobs topic, the consumer is notified

> apps/executor/src/app/jobs/fibonacci/fibonacci.consumer.ts

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FibonacciMessage, PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { Logger } from '@nestjs/common';

@Injectable()
export class FibonacciConsumer extends PulsarConsumer<FibonacciMessage> implements OnModuleInit {
  readonly logger = new Logger(FibonacciConsumer.name);

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, 'Fibonacci');
  }

  protected async onMessage(data: FibonacciMessage): Promise<void> {
    this.logger.log(`FibonacciConsumer: Received message: ${JSON.stringify(data)}`);
  }
}
```

##### 8.3.3 Updating the `jobs` module to have all the job consumers

- We are going to update the `jobs` module to have all the job consumers.

> apps/executor/src/app/jobs/jobs.module.ts

```ts
import { PulsarModule } from '@jobber/pulsar';
import { Module } from '@nestjs/common';
import { FibonacciConsumer } from './fibonacci/fibonacci.consumer';

@Module({
  imports: [PulsarModule],
  providers: [FibonacciConsumer],
})
export class JobsModule {}
```

##### 8.3.4 Updating the `app.module.ts` file to have the `jobs` module

- We are going to update the `app.module.ts` file to have the `jobs` module.

> apps/executor/src/app/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JobsModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
```

##### 8.3.5 Creating the `.env` file in the `executor` microservice

- We are going to create the `.env` file in the `executor` microservice.

> apps/executor/src/.env

```
PORT=3002
PULSAR_SERVICE_URL=pulsar://localhost:6650
```

##### 8.3.6 Testing the `executor` microservice

- We are going to test the `executor` microservice to ensure that when a message is created with the jobs topic, the consumer is notified.
- We need to modify the main `package.json` file to update the `serve:all` and `build:all` scripts to include the `executor` microservice.

> package.json

```diff
.
+    "serve:all": "nx run-many -t serve -p auth jobs executor",
+    "build:all": "nx run-many -t build -p auth jobs executor"
.
```

- We are going to run the `serve:all` script to start all the microservices.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps$ yarn serve:all
yarn run v1.22.22
$ nx run-many -t serve -p auth jobs executor

 NX   Running target serve for 3 projects and 5 tasks they depend on:

- auth
- jobs
- executor

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run executor:build  [local cache]

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 12.8 KiB [entry] [rendered]
webpack compiled successfully (4e8bca6a2a6302b7)

> nx run jobs:build  [local cache]

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 20.5 KiB [entry] [rendered]
webpack compiled successfully (d483bd258f019f3c)

> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 56ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22

┌─────────────────────────────────────────────────────────┐
│  Update available 6.4.1 -> 6.5.0                        │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

> nx run jobs:serve:development


> nx run executor:serve:development


> nx run jobs:build:development  [local cache]

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 20.5 KiB [entry] [rendered]
webpack compiled successfully (d483bd258f019f3c)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project jobs

Nx read the output from the cache instead of running the command for 1 out of 1 tasks.


> nx run executor:build:development  [local cache]

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 12.8 KiB [entry] [rendered]
webpack compiled successfully (4e8bca6a2a6302b7)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project executor

Nx read the output from the cache instead of running the command for 1 out of 1 tasks.

Debugger listening on ws://localhost:9229/c4f2bede-284d-49fa-b050-beee2978c04a
For help, see: https://nodejs.org/en/docs/inspector

Starting inspector on localhost:9229 failed: address already in use

[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [NestFactory] Starting Nest application...
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [InstanceLoader] AppModule dependencies initialized +8ms
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [InstanceLoader] PulsarModule dependencies initialized +0ms
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [InstanceLoader] JobsModule dependencies initialized +1ms
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG [NestApplication] Nest application successfully started +23ms
[Nest] 1100294  - 13/03/2025, 17:48:05     LOG 🚀 Application is running on: http://localhost:3002/api
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [NestFactory] Starting Nest application...
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] PulsarModule dependencies initialized +1ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +0ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] JobsModule dependencies initialized +1ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
[
  {
    meta: {
      name: 'Fibonacci',
      description: 'Generate a Fibonacci sequence and store it in the DB.'
    },
    discoveredClass: {
      name: 'FibonacciJob',
      instance: [FibonacciJob],
      injectType: [class FibonacciJob extends AbstractJob],
      dependencyType: [class FibonacciJob extends AbstractJob],
      parentModule: [Object]
    }
  }
]
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [GraphQLModule] Mapped {/graphql, POST} route +78ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 1100288  - 13/03/2025, 17:48:05     LOG 🚀 Application is running on: http://localhost:3001/api

> nx run auth:generate-ts-proto

> nx generate-ts-proto


> nx run @jobber/source:generate-ts-proto

> @jobber/source@0.0.0 generate-ts-proto
> npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true



 NX   Successfully ran target generate-ts-proto for project @jobber/source



> nx run auth:build  [local cache]

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 28.2 KiB [entry] [rendered]
webpack compiled successfully (26b037d45d4592ba)

> nx run auth:serve:development


 NX   Running target build for project auth and 2 tasks it depends on:

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 56ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22

┌─────────────────────────────────────────────────────────┐
│  Update available 6.4.1 -> 6.5.0                        │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

> nx run auth:generate-ts-proto

> nx generate-ts-proto


> nx run @jobber/source:generate-ts-proto

> @jobber/source@0.0.0 generate-ts-proto
> npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true



 NX   Successfully ran target generate-ts-proto for project @jobber/source



> nx run auth:build:development  [local cache]

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 28.2 KiB [entry] [rendered]
webpack compiled successfully (26b037d45d4592ba)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 2 tasks it depends on

Nx read the output from the cache instead of running the command for 2 out of 3 tasks.

Starting inspector on localhost:9229 failed: address already in use

[Nest] 1100721  - 13/03/2025, 17:48:09     LOG [NestFactory] Starting Nest application...
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] ConfigModule dependencies initialized +2ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] UsersModule dependencies initialized +1ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] JwtModule dependencies initialized +1ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +0ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [InstanceLoader] AuthModule dependencies initialized +1ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [RoutesResolver] AuthController {/api}: +11ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [GraphQLModule] Mapped {/graphql, POST} route +105ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG 🚀 Application is running on: http://localhost:3000/api
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [NestMicroservice] Nest microservice successfully started +72ms
```

- We are going to create a new job using the `job.http` file.

> apps/executor/src/job.http

```
@urlLogin = http://localhost:3000/graphql
@url = http://localhost:3001/graphql

### Login
# @name login
POST {{urlLogin}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword2!" }) {
    id
  }
}

### Execute job with valid name
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci"}) {
    name
  }
}
```

- After executing the login mutation, we are going to execute the `executeJob` mutation to execute the job.

```json
HTTP/1.1 200 OK
X-Powered-By: Express
Set-Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc0MTg4ODIyNywiZXhwIjoxNzQxOTE3MDI3fQ.8zsLvTlJIC033JdlkXacfhZ44TgVu2l62jHsCohMikI; Path=/; Expires=Fri, 24 May 2080 18:40:54 GMT; HttpOnly; Secure
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 30
ETag: W/"1e-EgvIyI72IVyUMhTGUlqB8zBQF6I"
Date: Thu, 13 Mar 2025 17:50:27 GMT
Connection: close

{
  "data": {
    "login": {
      "id": "3"
    }
  }
}
```

````json

- We are going to execute the `executeJob` mutation to execute the job.

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-wQABZaZuEWdkap9GXaLdYq62qH4"
Date: Thu, 13 Mar 2025 17:50:59 GMT
Connection: close

{
  "data": {
    "executeJob": {
      "name": "Fibonacci"
    }
  }
}
````

- We are going to check the logs of the `executor` microservice to ensure that the job was executed.

```bash
.
[Nest] 1100721  - 13/03/2025, 17:48:10     LOG [NestMicroservice] Nest microservice successfully started +72ms
[Nest] 1100294  - 13/03/2025, 17:50:59   DEBUG [FibonacciConsumer] Received message: {}
[Nest] 1100294  - 13/03/2025, 17:50:59     LOG [FibonacciConsumer] FibonacciConsumer: Received message: {}
```

#### 8.4 Managing Serialization and Error Handling

##### 8.4.1 Installing the `msgpackr` package

- We need to install the `msgpackr` package to serialize and deserialize the job data that will include all the types inside the `job.data` field.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i msgpackr --legacy-peer-deps

added 5 packages, and audited 1349 packages in 2s

226 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

##### 8.4.2 Creating the `Serializer` methods

- We are going to create the `Serializer` methods to serialize and deserialize the job data.

> libs/pulsar/src/lib/serializer.ts

```ts
import { Packr, Unpackr } from 'msgpackr';

const packr = new Packr({
  structuredClone: true, // Handle recursive/cyclical references
  useRecords: true, // For better compression of repeated object structures
  variableMapSize: true, // For optimizing small objects
});

const unpackr = new Unpackr({
  structuredClone: true,
  useRecords: true,
  variableMapSize: true,
});

export const serialize = <T>(data: T): Buffer => {
  try {
    return packr.pack(data);
  } catch (error) {
    throw new Error(`Failed to serialize data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deserialize = <T>(buffer: Buffer): T => {
  try {
    return unpackr.unpack(buffer) as T;
  } catch (error) {
    throw new Error(`Failed to deserialize data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
```

##### 8.4.3 Updating the `AbstractJob` to use the `Serializer` methods

- We are going to update the `AbstractJob` to use the `Serializer` methods to serialize and deserialize the job data.

> apps/jobs/src/app/jobs/abstract.job.ts

```ts
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
```

##### 8.4.4 Installing the `fibonacci` package

- We are going to install the `fibonacci` package to use it as part of the `fibonacci` job.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i fibonacci --legacy-peer-
deps

added 2 packages, and audited 1351 packages in 2s

226 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

##### 8.4.5 Updating the `FibonacciConsumer` to use the `fibonacci` package

- We are going to update the `FibonacciConsumer` to use the `fibonacci` package to generate the Fibonacci sequence.

> apps/executor/src/app/jobs/fibonacci/fibonacci.consumer.ts

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FibonacciMessage, PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { Logger } from '@nestjs/common';
import { iterate } from 'fibonacci';
@Injectable()
export class FibonacciConsumer extends PulsarConsumer<FibonacciMessage> implements OnModuleInit {
  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, 'Fibonacci');
  }

  protected async onMessage(data: FibonacciMessage): Promise<void> {
    const result = iterate(data.iterations);
    this.logger.log(`FibonacciConsumer: Result: ${JSON.stringify(result, null, 2)}`);
  }
}
```

##### 8.4.6 Testing the `FibonacciConsumer`

- We are going to test the `FibonacciConsumer` to ensure that the job is working as expected.

```bash
nx run executor:serve:development
```

- We are going to change the `job.http` file to execute the job with the `iterations` parameter.

```http
@urlLogin = http://localhost:3000/graphql
@url = http://localhost:3001/graphql

### Login
# @name login
POST {{urlLogin}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword2!" }) {
    id
  }
}

### Install httpbin and run using docker with "docker run -p 80:80 kennethreitz/httpbin"
GET http://0.0.0.0:80/anything
Content-Type: application/json
X-Full-Response: {{login.response.body.*}}

### Get jobs metadata
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  jobsMetadata {
    name
    description
  }
}

### Execute job with invalid name
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Bad"}) {
    name
  }
}

### Execute job with valid name
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci", data: {iterations: 40}}) {
    name
  }
}
```

- We are going to execute the `### Execute job with valid name` mutation using the `job.http` file.
- We can see the result in the logs of the `executor` microservice.

```bash
[Nest] 317995  - 14/03/2025, 07:28:04     LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
[
  {
    meta: {
      name: 'Fibonacci',
      description: 'Generate a Fibonacci sequence and store it in the DB.'
    },
    discoveredClass: {
      name: 'FibonacciJob',
      instance: [FibonacciJob],
      injectType: [class FibonacciJob extends AbstractJob],
      dependencyType: [class FibonacciJob extends AbstractJob],
      parentModule: [Object]
    }
  }
]
[Nest] 317995  - 14/03/2025, 07:28:04     LOG [GraphQLModule] Mapped {/graphql, POST} route +83ms
[Nest] 317995  - 14/03/2025, 07:28:04     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 317995  - 14/03/2025, 07:28:04     LOG 🚀 Application is running on: http://localhost:3001/api
[Nest] 317331  - 14/03/2025, 07:28:08   DEBUG [Fibonacci] Received message: {
  "iterations": 40
}
[Nest] 317331  - 14/03/2025, 07:28:08     LOG [Fibonacci] FibonacciConsumer: Result: {
  "number": "102334155",
  "length": 9,
  "iterations": "40",
  "ms": 1
}
```
