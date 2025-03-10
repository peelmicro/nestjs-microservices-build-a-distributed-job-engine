# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 3)

## 5. Jobs Service

### 5.1. Creating the Jobs Service

- We are going to use the `Nx` CLI to create the Jobs Service.

> Note: We need to execute the command from the apps folder of the project. It should work from the root folder, but we need to make sure we are in the right directory.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps$ nx g application jobs
✔ Which generator would you like to use? · @nx/nest:application

 NX  Generating @nx/nest:application

✔ Which linter would you like to use? · eslint
✔ Which unit test runner would you like to use? · jest
CREATE apps/jobs/src/assets/.gitkeep
CREATE apps/jobs/src/main.ts
CREATE apps/jobs/tsconfig.app.json
CREATE apps/jobs/tsconfig.json
CREATE apps/jobs/webpack.config.js
CREATE apps/jobs/project.json
CREATE apps/jobs/eslint.config.mjs
CREATE apps/jobs/tsconfig.spec.json
CREATE apps/jobs/jest.config.ts
CREATE apps/jobs-e2e/project.json
UPDATE nx.json
CREATE apps/jobs-e2e/jest.config.ts
CREATE apps/jobs-e2e/src/jobs/jobs.spec.ts
CREATE apps/jobs-e2e/src/support/global-setup.ts
CREATE apps/jobs-e2e/src/support/global-teardown.ts
CREATE apps/jobs-e2e/src/support/test-setup.ts
CREATE apps/jobs-e2e/tsconfig.json
CREATE apps/jobs-e2e/tsconfig.spec.json
CREATE apps/jobs-e2e/eslint.config.mjs
CREATE apps/jobs/src/app/app.controller.spec.ts
CREATE apps/jobs/src/app/app.controller.ts
CREATE apps/jobs/src/app/app.module.ts
CREATE apps/jobs/src/app/app.service.spec.ts
CREATE apps/jobs/src/app/app.service.ts

 NX   👀 View Details of jobs-e2e

Run "nx show project jobs-e2e" to view details about this project.


 NX   👀 View Details of jobs

Run "nx show project jobs" to view details about this project.
```

### 5.2. Updating the NestJS main documents

- We need to update the NestJS main documents based on what we have implemented for the `auth` service.
- We just need to copy the `main.ts` file

> apps/jobs/src/main.ts

```ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());
  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
```

- We need to update the tsconfig.json file to remove the `compilerOptions` section.

```diff
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
- "compilerOptions": {
-   "esModuleInterop": true
- }
}
```

- We need to create the `.env` file in the `jobs` directory, by copying the same `.env` file from the `auth` service.

> apps/jobs/.env

```env
DATABASE_URL=postgresql://postgres:example@localhost:5432/auth?schema=public
PORT=3001
JWT_SECRET=CBmzzzzzzzzzzzzzzAJl
JWT_EXPIRATION_MS=28800000
SECURE_COOKIE=false
```

- We need to remove the `app.controller.ts`, `app.service`, `app.controller.spec.ts` and `app.service.spec.ts` files, because we are not going to use them.
- We need to update the `app.module.ts` file to remove the `AppController` and `AppService` imports and providers, and also to set up the `ConfigModule`.

> apps/jobs/src/app/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- We can test that the application is working by running the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve jobs

 NX   Running target serve for project jobs and 1 task it depends on:

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run jobs:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 2.17 KiB [entry] [rendered]
webpack compiled successfully (f6b62e8805717825)

> nx run jobs:serve:development


> nx run jobs:build:development  [local cache]

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 2.17 KiB [entry] [rendered]
webpack compiled successfully (f6b62e8805717825)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project jobs

Nx read the output from the cache instead of running the command for 1 out of 1 tasks.

Debugger listening on ws://localhost:9229/d97e1b25-9e0d-4058-96c2-dab02a29b7ac
For help, see: https://nodejs.org/en/docs/inspector

[Nest] 167081  - 08/03/2025, 12:56:39     LOG [NestFactory] Starting Nest application...
[Nest] 167081  - 08/03/2025, 12:56:39     LOG [InstanceLoader] AppModule dependencies initialized +8ms
[Nest] 167081  - 08/03/2025, 12:56:39     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 167081  - 08/03/2025, 12:56:39     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 167081  - 08/03/2025, 12:56:39     LOG [NestApplication] Nest application successfully started +98ms
[Nest] 167081  - 08/03/2025, 12:56:39     LOG 🚀 Application is running on: http://localhost:3001/api
```

### 5.3. Creating the Job Service, Resolver and Module

#### 5.3.1 Creating a Job Decorator

- We are going to create a [Custom Decorator](https://docs.nestjs.com/custom-decorators) that we are going to be applying to our underlying jobs.
- We are going to use the `applyDecorators` function from the `@nestjs/common` package to apply the decorator to the job.
- In NestJS, `applyDecorators` is a utility function from the `@nestjs/common` module that allows you to apply multiple decorators to a single target (such as a class, method, or property) in a single step. This is particularly useful when you want to combine the effects of multiple decorators without having to manually stack them using the `@` syntax.
- `How applyDecorators Works`
  - `applyDecorators` takes a variable number of decorator functions as arguments and returns a new decorator function. When this returned decorator is applied to a target, it applies each of the original decorators in sequence.
- `SetMetadata()` and `Injectable()` are often used together with `applyDecorators()` in NestJS applications. Here's why:

  - `Combining Decorators for Convenience`: `applyDecorators()` allows you to combine multiple decorators into one, making your code cleaner and more readable. By using it with `SetMetadata()` and `Injectable()`, you can apply both decorators to a class or method in a single step.
  - `Metadata and Dependency Injection`: `SetMetadata()` is used to attach metadata to a class or method, which can be useful for various purposes like logging, authorization, or job management (as shown in the example with the @Job decorator)1. Meanwhile, `Injectable()` is essential for making a class injectable as a dependency in NestJS, ensuring it can be managed by the framework's dependency injection system.
  - `Simplifying Class Definitions`: When you want a class to be both injectable and have specific metadata, using `applyDecorators()` with `Injectable()` and `SetMetadata()` simplifies the class definition. This approach avoids the need to manually stack multiple decorators on top of each other, improving code readability.

#### 5.3.2 Creating the Job Metadata Interface

- We first need to create an interface where we define how the data is going to be stored in the database.

> apps/jobs/src/interfaces/job-metadata.interface.ts

```ts
export interface JobMetadata {
  name: string;
  description: string;
}
```

#### 5.3.3. Creating the Job Decorator

- We need to create a decorator that will be applied to our jobs.

> apps/jobs/src/decorators/job.decorator.ts

```ts
import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { JobMetadata } from '../interfaces/job-metadata.interface';

export const JOB_METADATA_KEY = 'job_meta';

export const Job = (meta: JobMetadata) => applyDecorators(SetMetadata(JOB_METADATA_KEY, meta), Injectable());
```

#### 5.3.4. Creating the Job Abstract Class

- We need to create an `abstract` class that will be extended by our jobs.

> apps/jobs/src/app/jobs/abstract.job.ts

```ts
export abstract class AbstractJob {
  async execute() {
    console.log('Executing job');
  }
}
```

#### 5.3.5. Creating the Fibonacci Job

- We need to create the `fibonacci` job that will extend the `AbstractJob` class.

> apps/jobs/src/app/jobs/fibonacci/fibonacci.job.ts

```ts
import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract.job';

@Job({
  name: 'Fibonacci',
  description: 'Generate a Fibonacci sequence and store it in the DB.',
})
export class FibonacciJob extends AbstractJob {}
```

#### 5.3.6. Installing the Discovery Module

- We need to install the `@golevelup/nestjs-discovery` package that will be used to discover the jobs.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save @golevelup/nestjs-discovery --legacy-peer-deps

added 5 packages, and audited 1288 packages in 3s

221 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 5.3.7. Creating the Jobs Service

- We are going to create the `JobsService` that will be used to register the jobs.

> apps/jobs/src/app/jobs/jobs.service.ts

```ts
import { DiscoveredClassWithMeta, DiscoveryService } from '@golevelup/nestjs-discovery';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
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

  async executeJob(name: string) {
    const job = this.jobs.find((job) => job.meta.name === name);
    if (!job) {
      throw new BadRequestException(`Job with name ${name} not found`);
    }
    await (job.discoveredClass.instance as AbstractJob).execute();
    return job.meta;
  }
}
```

#### 5.3.8. Creating the Job Model

- We are going to create a model for the jobs that will be used to get the jobs metadata.

> apps/jobs/src/app/jobs/models/job.model.ts

```ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Job {
  @Field()
  name: string;

  @Field()
  description: string;
}
```

#### 5.3.9. Creating the Job Input

- We are going to create an input for the jobs that will be used to execute the jobs.

> apps/jobs/src/app/jobs/dto/execute-job.input.ts

```ts
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
@InputType()
export class ExecuteJobInput {
  @Field()
  @IsNotEmpty()
  name: string;
}
```

#### 5.3.10. Creating the Jobs Resolver

- We are going to create a resolver for the jobs that will be used to get the jobs metadata.

> apps/jobs/src/app/jobs/jobs.resolver.ts

```ts
import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { Job } from './models/job.model';
import { ExecuteJobInput } from './dto/execute-job.input';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [Job], { name: 'jobsMetadata' })
  async getJobsMetadata() {
    return this.jobsService.getJobsMetadata();
  }

  @Mutation(() => Job)
  async executeJob(@Args('executeJobInput') executeJobInput: ExecuteJobInput) {
    return this.jobsService.executeJob(executeJobInput.name);
  }
}
```

#### 5.3.11. Creating the Jobs Module

- We need to create a module for the jobs that will include the `DiscoveryModule` from the `@golevelup/nestjs-discovery` package.

> apps/jobs/src/app/jobs/jobs.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FibonacciJob } from './fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';

@Module({
  imports: [ConfigModule, DiscoveryModule],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver],
})
export class JobsModule {}
```

#### 5.3.12. Updating the App Module

- We need to update the `app.module.ts` file to import the `JobsModule`.

> apps/jobs/src/app/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    ConfigModule,
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

#### 5.3.13. Create the `job.http` file to test the jobs

- We need to create a `job.http` file to test the jobs.

> apps/jobs/job.http

```http
@url = http://localhost:3001/graphql

### Get jobs metadata
POST {{url}}
Content-Type: application/json
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
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Bad"}) {
    name
  }
}

### Execute job with valid name
POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci"}) {
    name
  }
}
```

##### 5.3.13.1. Get jobs metadata

- When we execute the request:

```http
### Get jobs metadata
POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query {
  jobsMetadata {
    name
    description
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 119
ETag: W/"77-lnBxBNGpB4iJ5p8G93o6t7dfS14"
Date: Sun, 09 Mar 2025 16:08:06 GMT
Connection: close

{
  "data": {
    "jobsMetadata": [
      {
        "name": "Fibonacci",
        "description": "Generate a Fibonacci sequence and store it in the DB."
      }
    ]
  }
}
```

##### 5.3.13.2. Execute job with invalid name

- When we execute the request:

```http
### Execute job with invalid name
POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Bad"}) {
    name
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 1318
ETag: W/"526-JlMD5HQMe5cMXYQwTJci6h+kMO0"
Date: Sun, 09 Mar 2025 16:38:15 GMT
Connection: close

{
  "errors": [
    {
      "message": "Job with name Bad not found",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "executeJob"
      ],
      "extensions": {
        "code": "BAD_REQUEST",
        "stacktrace": [
          "BadRequestException: Job with name Bad not found",
          "    at JobsService.executeJob (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/jobs/webpack:/src/app/jobs/jobs.service.ts:36:13)",
          "    at JobsResolver.executeJob (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/jobs/webpack:/src/app/jobs/jobs.resolver.ts:17:29)",
          "    at /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/helpers/external-context-creator.js:67:33",
          "    at processTicksAndRejections (node:internal/process/task_queues:105:5)",
          "    at target (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/helpers/external-context-creator.js:74:28)",
          "    at Object.executeJob (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/helpers/external-proxy.js:9:24)"
        ],
        "originalError": {
          "message": "Job with name Bad not found",
          "error": "Bad Request",
          "statusCode": 400
        }
      }
    }
  ],
  "data": null
}
```

##### 5.3.13.3. Execute job with valid name

- When we execute the request:

```http
### Execute job with valid name
POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci"}) {
    name
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-wQABZaZuEWdkap9GXaLdYq62qH4"
Date: Sun, 09 Mar 2025 16:39:06 GMT
Connection: close

{
  "data": {
    "executeJob": {
      "name": "Fibonacci"
    }
  }
}
```

- We can see the console.log('Executing job') message in the terminal.

```txt
[Nest] 742863  - 09/03/2025, 16:32:52     LOG 🚀 Application is running on: http://localhost:3001/api
Executing job
```

## 6. Creating the gRPC Transport

- We need to implement this in order to actually authenticate on request that are incoming to our jobs microservice.
- We are going to authentica using the `auth` microservice and if it succeeds, then we can proceed with the request in our jobs microservice.
- Our microservices are going to use both `HTTP` and `gRPC` transports.

### 6.1. Creating the gRPC Transport

#### 6.1.1. Installing the dependencies

- We need to install `@grpc/grpc-js` and `@grpc/proto-loader` to be able to create the gRPC server and client.
- We also need to install `@nestjs/microservices` to be able to create the gRPC server and client.
- Finally, we need to install `ts-proto` to be able to generate the NestJS code for the gRPC client and server.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save @grpc/grpc-js @grpc/proto-loader @n
estjs/microservices ts-proto --legacy-peer-deps

added 14 packages, and audited 1302 packages in 4s

224 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 6.1.2. Creating the `proto` files

##### 6.1.2.1. Creating the `auth.proto` file

- We need to create the `proto` files for the gRPC server and client.
- We are going to create the `proto` files in the `proto` folder.

> proto/auth.proto

```proto
syntax = "proto3";

package auth;

service AuthService {
  rpc Authenticate(AuthenticateRequest) returns (User);
}

message AuthenticateRequest {
  string token = 1;
}

message User {
  int32 id = 1;
  string email = 2;
}
```

##### 6.1.2.2 Creating the protoc command

- We are going to create the `types` folder where we are going to generate the `proto` TypeScript types.
- We can test the command by running:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true
```

- We can see the generated files in the `types` folder.

> types/proto/auth.ts

```ts
// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v3.20.3
// source: proto/auth.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'auth';

export interface AuthenticateRequest {
  token: string;
}

export interface User {
  id: number;
  email: string;
}

export const AUTH_PACKAGE_NAME = 'auth';

export interface AuthServiceClient {
  authenticate(request: AuthenticateRequest): Observable<User>;
}

export interface AuthServiceController {
  authenticate(request: AuthenticateRequest): Promise<User> | Observable<User> | User;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['authenticate'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod('AuthService', method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod('AuthService', method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AUTH_SERVICE_NAME = 'AuthService';
```

##### 6.1.2.2. Automating the generation of the `proto` files

- We are going to create the `proto` file for the jobs microservice using the `ts-proto` CLI and based on the `auth.proto` file.
- We are going to modify the root `package.json` file to include the `ts-proto` script.

> package.json

```diff
.
  "scripts": {
    "prepare": "husky",
+    "generate-ts-proto": "npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true"
  },
+  "nx": {
+    "targets": {
+      "generate-ts-proto": {
+        "inputs": [
+          "{workspaceRoot}/proto/*.proto"
+        ],
+        "cacheable": true
+      }
+    }
+  },
```

- We also need to update the `project.json` file to include the `generate-ts-proto` target.
- There are also some changes in the `project.json` file for the `prisma` commands.

> apps/auth/project.json

```diff
{
  "name": "auth",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/auth/src",
  "projectType": "application",
  "tags": [],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "webpack-cli build",
        "args": ["node-env=production"]
      },
      "configurations": {
        "development": {
          "args": ["node-env=development"]
        }
      },
      "dependsOn": [
        "generate-prisma",
+       "generate-ts-proto"
      ]
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "auth:build",
        "runBuildTargetDependencies": true
      },
      "configurations": {
        "development": {
          "buildTarget": "auth:build:development"
        },
        "production": {
          "buildTarget": "auth:build:production"
        }
      }
    },
    "test": {
      "dependsOn": ["generate-prisma"],
      "options": {
        "passWithNoTests": true
      }
    },
    "generate-prisma": {
      "command": "prisma generate",
      "options": {
        "cwd": "{projectRoot}",
        "input": ["prisma/schema.prisma"]
      },
      "cache": true
    },
    "migrate-prisma": {
      "command": "prisma migrate dev",
      "options": {
        "cwd": "{projectRoot}"
      }
    },
+   "generate-ts-proto": {
+      "command": "nx generate-ts-proto"
+    }
  }
}
```

- We can test the command by running:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx generate-ts-proto auth

> nx run auth:generate-ts-proto

> nx generate-ts-proto


> nx run @jobber/source:generate-ts-proto

> @jobber/source@0.0.0 generate-ts-proto
> npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true



 NX   Successfully ran target generate-ts-proto for project @jobber/source



———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate-ts-proto for project auth (2s)
```

- We can check if the `generate-prisma` target is working by running:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx generate-prisma auth

> nx run auth:generate-prisma

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 66ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize


———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate-prisma for project auth (997ms)
```

- We can see that when we run the `generate-prisma` target again, it detects it has been cached and it doesn't run again.

```bash
 juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx generate-prisma auth

> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 66ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize


———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate-prisma for project auth (32ms)

Nx read the output from the cache instead of running the command for 1 out of 1 tasks.
```

- We need to ensure that `generate-prisma` and `generate-ts-proto` are executed when we execute `nx serve auth`.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve auth

 NX   Running target serve for project auth and 3 tasks it depends on:

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 66ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize


> nx run auth:generate-ts-proto

> nx generate-ts-proto


> nx run @jobber/source:generate-ts-proto

> @jobber/source@0.0.0 generate-ts-proto
> npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true



 NX   Successfully ran target generate-ts-proto for project @jobber/source



> nx run auth:build  [local cache]

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 22.7 KiB [entry] [rendered]
webpack compiled successfully (686a9d42382bfe95)

> nx run auth:serve:development


 NX   Running target build for project auth and 2 tasks it depends on:

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 66ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize


> nx run auth:generate-ts-proto

> nx generate-ts-proto


> nx run @jobber/source:generate-ts-proto

> @jobber/source@0.0.0 generate-ts-proto
> npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true



 NX   Successfully ran target generate-ts-proto for project @jobber/source



> nx run auth:build:development  [local cache]

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 22.7 KiB [entry] [rendered]
webpack compiled successfully (686a9d42382bfe95)

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 2 tasks it depends on

Nx read the output from the cache instead of running the command for 2 out of 3 tasks.

Debugger listening on ws://localhost:9229/bc94d302-bd70-4993-8388-fb38fffdf6d4
For help, see: https://nodejs.org/en/docs/inspector

[Nest] 834901  - 10/03/2025, 15:21:38     LOG [NestFactory] Starting Nest application...
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] UsersModule dependencies initialized +2ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] JwtModule dependencies initialized +0ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +0ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] AuthModule dependencies initialized +0ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [InstanceLoader] GraphQLModule dependencies initialized +0ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [GraphQLModule] Mapped {/graphql, POST} route +140ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 834901  - 10/03/2025, 15:21:38     LOG 🚀 Application is running on: http://localhost:3000/api
```

- We can see that the `generate-prisma` and `generate-ts-proto` targets are executed when we execute `nx serve auth`.
