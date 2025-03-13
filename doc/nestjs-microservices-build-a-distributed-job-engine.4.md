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
