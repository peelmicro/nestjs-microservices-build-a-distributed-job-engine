# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 6)

## 10. Implementing Logging

### 10.1 Ading Pino Logging

#### 10.1.1. Adding Pino npm packages to the Project

- We will use Pino to log messages in the project.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i nestjs-pino pino-http --legacy-peer-deps

added 15 packages, removed 1 package, and audited 1381 packages in 8s

227 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

- Also, we will add the `pino-pretty` npm package to the project.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save-dev pino-pretty --legacy-peer-dep
s

added 7 packages, and audited 1388 packages in 2s

227 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

#### 10.1.2. Configuring Pino

- We will configure Pino to log messages in the `nestJS libs` project.

> libs/nestjs/src/lib/logger.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class LoggerModule {}
```

#### 10.1.3. Adding the Logger Module to `init.ts`

- We will add the Logger Module to the `init.ts` file.

> libs/nestjs/src/lib/init.ts

```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

export async function init(app: INestApplication, globalPrefix = 'api') {
  app.use(express.json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix(globalPrefix);
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  app.get(Logger).log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
```

#### 10.1.4. Adding the Logger Module to the Apps

- We will add the Logger Module to the `apps` projects.

##### 10.1.4.1. Adding the Logger Module to the Jobs App

> apps/jobs/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
+import { LoggerModule } from '@jobber/nestjs';

@Module({
  imports: [
+   LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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

##### 10.1.4.2. Adding the Logger Module to the Auth App

> apps/auth/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
+import { LoggerModule } from '@jobber/nestjs';

@Module({
  imports: [
+   LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: true,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

##### 10.1.4.3. Adding the Logger Module to the Executor App

> apps/executor/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';
+import { LoggerModule } from '@jobber/nestjs';

@Module({
  imports: [
+   LoggerModule,
    JobsModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
})
export class AppModule {}
```

#### 10.1.5. Adding the `{ bufferLogs: true }` option to the `main.ts` files

##### 10.1.5.1. Adding the `{ bufferLogs: true }` option to the `main.ts` file of the Auth App

> apps/auth/src/main.ts

```ts
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'path';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app);
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
```

##### 10.1.5.2. Adding the `{ bufferLogs: true }` option to the `main.ts` file of the Executor App

> apps/executor/src/main.ts

```ts
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app);
}

bootstrap();
```

##### 10.1.5.3. Adding the `{ bufferLogs: true }` option to the `main.ts` file of the Jobs App

> apps/jobs/src/main.ts

```ts
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app);
}

bootstrap();
```

#### 10.1.6. Ensuring the Pino Logger Module is used in the Apps

- We will ensure that the Pino Logger Module is used in the Apps.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm run serve:all

> @jobber/source@0.0.0 serve:all
> nx run-many -t serve -p auth jobs executor


 NX   Running target serve for 3 projects and 9 tasks they depend on:

- auth
- jobs
- executor

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto  [existing outputs match the cache, left as is]

> npx protoc --plugin=protoc-gen-ts_proto=../../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/lib/types/proto ./src/lib/proto/*.proto --ts_proto_opt=nestJs=true --ts_proto_opt=exportCommonSymbols=false


> nx run pulsar:build  [local cache]

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 5.63 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 5.63 KiB [entry] [rendered]
webpack compiled successfully (c7530fb194af6872)

> nx run grpc:build  [local cache]

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 1.54 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 1.54 KiB [entry] [rendered]
webpack compiled successfully (bb7a74b1a2cd451c)

> nx run graphql:build  [local cache]

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 3.29 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 3.29 KiB [entry] [rendered]
webpack compiled successfully (bd7006f1656ebe9c)

> nx run auth:generate-prisma

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 48ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22


> nx run nestjs:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 2.58 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 2.58 KiB [entry] [rendered]
webpack compiled successfully (09c76bbd450379d5)

> nx run executor:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 5.31 KiB [entry] [rendered]
webpack compiled successfully (6dddd980e9ed20ba)

> nx run executor:serve:development


 NX   Running target build for project executor and 2 tasks it depends on:

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run nestjs:build  [existing outputs match the cache, left as is]


> nx run pulsar:build  [existing outputs match the cache, left as is]


> nx run executor:build:development

> webpack-cli build node-env=development


> nx run jobs:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 14.7 KiB [entry] [rendered]
webpack compiled successfully (41153bc19641dfb9)

> nx run jobs:serve:development


> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 25.8 KiB [entry] [rendered]
webpack compiled successfully (45ff086e7bdb6d76)

> nx run auth:serve:development


 NX   Running target build for project jobs and 5 tasks it depends on:

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto  [existing outputs match the cache, left as is]


> nx run nestjs:build  [existing outputs match the cache, left as is]


> nx run pulsar:build  [existing outputs match the cache, left as is]


> nx run grpc:build  [existing outputs match the cache, left as is]


> nx run graphql:build  [existing outputs match the cache, left as is]


> nx run jobs:build:development

> webpack-cli build node-env=development


 NX   Running target build for project auth and 5 tasks it depends on:

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto  [existing outputs match the cache, left as is]


> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 48ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22


> nx run nestjs:build  [existing outputs match the cache, left as is]


> nx run grpc:build  [existing outputs match the cache, left as is]


> nx run graphql:build  [existing outputs match the cache, left as is]


> nx run auth:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 5.31 KiB [entry] [rendered]
webpack compiled successfully (6dddd980e9ed20ba)

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project executor and 2 tasks it depends on

Nx read the output from the cache instead of running the command for 2 out of 3 tasks.

Debugger listening on ws://localhost:9229/f7a421c4-4ffc-469c-8429-61af5eefd17a
For help, see: https://nodejs.org/en/docs/inspector

[15:34:17.134] INFO (412087): Starting Nest application... {"context":"NestFactory"}
[15:34:17.134] INFO (412087): AppModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.134] INFO (412087): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.134] INFO (412087): ConfigHostModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.134] INFO (412087): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.134] INFO (412087): PulsarModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.135] INFO (412087): JobsModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.135] INFO (412087): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:34:17.135] WARN (412087): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:34:17.135] WARN (412087): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:34:17.135] INFO (412087): Nest application successfully started {"context":"NestApplication"}
[15:34:17.135] INFO (412087): 🚀 Application is running on: http://localhost:3002/api
chunk (runtime: main) main.js (main) 25.8 KiB [entry] [rendered]
webpack compiled successfully (45ff086e7bdb6d76)

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 5 tasks it depends on

Nx read the output from the cache instead of running the command for 5 out of 6 tasks.

Starting inspector on localhost:9229 failed: address already in use

chunk (runtime: main) main.js (main) 14.7 KiB [entry] [rendered]
webpack compiled successfully (41153bc19641dfb9)

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project jobs and 5 tasks it depends on

Nx read the output from the cache instead of running the command for 5 out of 6 tasks.

Starting inspector on localhost:9229 failed: address already in use

[15:34:19.001] INFO (412157): Starting Nest application... {"context":"NestFactory"}
[15:34:19.001] INFO (412157): AppModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.001] INFO (412157): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.001] INFO (412157): PrismaModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.001] INFO (412157): ConfigHostModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.001] INFO (412157): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.001] INFO (412157): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.001] INFO (412157): JwtModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.002] INFO (412157): UsersModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.002] INFO (412157): GraphQLSchemaBuilderModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.002] INFO (412157): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.002] INFO (412157): GraphQLModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.002] INFO (412157): AuthModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.002] WARN (412157): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:34:19.002] WARN (412157): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:34:19.002] INFO (412157): AuthController {/api}: {"context":"RoutesResolver"}
[15:34:19.002] INFO (412157): Mapped {/graphql, POST} route {"context":"GraphQLModule"}
[15:34:19.002] INFO (412157): Nest application successfully started {"context":"NestApplication"}
[15:34:19.002] INFO (412157): 🚀 Application is running on: http://localhost:3000/api
[15:34:19.062] INFO (412157): Nest microservice successfully started {"context":"NestMicroservice"}
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
[15:34:19.189] INFO (412196): Starting Nest application... {"context":"NestFactory"}
[15:34:19.189] INFO (412196): AppModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): ClientsModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): ConfigHostModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): DiscoveryModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): PulsarModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): GraphQLSchemaBuilderModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): JobsModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] INFO (412196): GraphQLModule dependencies initialized {"context":"InstanceLoader"}
[15:34:19.189] WARN (412196): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:34:19.189] WARN (412196): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:34:19.189] INFO (412196): Mapped {/graphql, POST} route {"context":"GraphQLModule"}
[15:34:19.189] INFO (412196): Nest application successfully started {"context":"NestApplication"}
[15:34:19.190] INFO (412196): 🚀 Application is running on: http://localhost:3001/api
```

### 10.2. Adding a GraphQL Logger

- We are going to implement a custom GraphQL logger that will log the queries and mutations in the console.

#### 10.2.1. Installing the `uuid` npm package

- We are going to install the `uuid` npm package to generate unique identifiers for the logs.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i uuid --legacy-peer-deps

added 1 package, removed 1 package, changed 1 package, and audited 1389 packages in 2s

228 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

#### 10.2.2. Implementing the GraphQL Logger

- We are going to implement a plugin for the GraphQL Logger.

> libs/graphql/src/lib/plugins/gql-logger.plugin.ts

```typescript
import { ApolloServerPlugin, BaseContext, GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

export class GqlLoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(GqlLoggingPlugin.name);

  async requestDidStart(requestContext: GraphQLRequestContext<BaseContext>): Promise<void | GraphQLRequestListener<BaseContext>> {
    const { request } = requestContext;
    const start = Date.now();
    const requestId = uuidv4();

    this.logger.log({
      requestId,
      headers: request.http?.headers,
      query: request.query,
      variables: request.variables,
    });

    return {
      willSendResponse: async (responseContext) => {
        const duration = Date.now() - start;

        this.logger.log({
          requestId,
          query: request.query,
          statusCode: responseContext.response?.http?.status || 200,
          duration: `${duration}ms`,
        });
      },
    };
  }
}
```

#### 10.2.3. Adding the GraphQL Logger to the Apollo Server

##### 10.2.3.1. Adding the GraphQL Logger to the Jobs App

- We are going to add the GraphQL Logger to the Apollo Server in the `apps/jobs/src/app/app.module.ts` file.

> apps/jobs/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { LoggerModule } from '@jobber/nestjs';
+import { GqlLoggingPlugin } from '@jobber/graphql';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JobsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
+     plugins: [new GqlLoggingPlugin()],
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

##### 10.2.3.2. Adding the GraphQL Logger to the Auth App

- We are going to add the GraphQL Logger to the Apollo Server in the `apps/auth/src/app/app.module.ts` file.

> apps/auth/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from '@jobber/nestjs';
+import { GqlLoggingPlugin } from '@jobber/graphql';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: true,
+     plugins: [new GqlLoggingPlugin()],
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

#### 10.2.4. Ensuring the GraphQL Logger is used in the Jobs App

- We are going to ensure that the GraphQL Logger is used in the Jobs App when we execute a GraphQL request.
- When we execute this reaquest:

```http
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
```

- We receive the following response:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 119
ETag: W/"77-lnBxBNGpB4iJ5p8G93o6t7dfS14"
Date: Sun, 16 Mar 2025 16:01:04 GMT
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

- We can see the logs in the console of the Jobs App.

```bash
[15:59:06.479] INFO (442294): Nest microservice successfully started {"context":"NestMicroservice"}
[16:01:04.471] INFO (442254): {"context":"GqlLoggingPlugin","requestId":"59ec7c1d-7147-468c-96f8-8a7c491b466c","headers":{},"query":"query {\n  jobsMetadata {\n    name\n    description\n  }\n}","variables":{}}
[16:01:04.521] INFO (442254): {"context":"GqlLoggingPlugin","requestId":"59ec7c1d-7147-468c-96f8-8a7c491b466c","query":"query {\n  jobsMetadata {\n    name\n    description\n  }\n}","statusCode":200,"duration":"50ms"}
```

### 10.3. Adding a gRPC Logger

- We are going to add a gRPC Logger to the project.

#### 10.3.1. Creating an interceptor for the gRPC Logger

- We are going to create an interceptor for the gRPC Logger.

> libs/grpc/src/lib/interceptors/grpc-logging.interceptor.ts

```typescript
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Observable, tap } from 'rxjs';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const handler = context.getHandler().name;
    const args = context.getArgs()[0];
    const startTime = Date.now();
    const requestId = uuidv4();

    this.logger.log({
      requestId,
      handler,
      args,
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          requestId,
          handler,
          duration: Date.now() - startTime,
        });
      }),
    );
  }
}
```

#### 10.3.2. Adding the gRPC Logger to the Auth App

- We are going to add the gRPC Logger to `auth.controller.ts` from the Auth App.

> apps/auth/src/auth.controller.ts

```diff
-import { Controller, UseGuards } from '@nestjs/common';
+import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { Observable } from 'rxjs';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './token-payload.interface';
import {
  AuthServiceControllerMethods,
  AuthenticateRequest,
  AuthServiceController,
  User,
} from '@jobber/grpc';
+import { GrpcLoggingInterceptor } from '@jobber/grpc';

@Controller()
@AuthServiceControllerMethods()
+@UseInterceptors(GrpcLoggingInterceptor)
export class AuthController implements AuthServiceController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  authenticate(
    request: AuthenticateRequest & { user: TokenPayload },
  ): Promise<User> | Observable<User> | User {
    return this.usersService.getUser({ id: request.user.userId });
  }
}
```

#### 10.3.3. Checking the gRPC Logger

- We are going to check the gRPC Logger by executing a request to the Auth App.

```bash
[16:26:13.624] INFO (475546): Nest microservice successfully started {"context":"NestMicroservice"}
[16:26:53.324] INFO (475546): {"context":"GqlLoggingPlugin","requestId":"800e49be-97da-43b7-9932-9c2bee962bdf","headers":{},"query":"mutation {\n  login(loginInput: { email: \"my-email2@msn.com\", password: \"MyPassword2!\" }) {\n    id\n  }\n}","variables":{}}
[16:26:53.425] INFO (475546): {"context":"GqlLoggingPlugin","requestId":"800e49be-97da-43b7-9932-9c2bee962bdf","query":"mutation {\n  login(loginInput: { email: \"my-email2@msn.com\", password: \"MyPassword2!\" }) {\n    id\n  }\n}","statusCode":200,"duration":"101ms"}
[16:27:03.939] INFO (475540): {"context":"GqlLoggingPlugin","requestId":"e389a251-073d-4174-bb38-1b47b71dce2c","headers":{},"query":"query {\n  jobsMetadata {\n    name\n    description\n  }\n}","variables":{}}
[16:27:03.985] INFO (475540): {"context":"GqlLoggingPlugin","requestId":"e389a251-073d-4174-bb38-1b47b71dce2c","query":"query {\n  jobsMetadata {\n    name\n    description\n  }\n}","statusCode":200,"duration":"47ms"}
```

- We can see the logs in the console of the Auth App.

```bash







```
