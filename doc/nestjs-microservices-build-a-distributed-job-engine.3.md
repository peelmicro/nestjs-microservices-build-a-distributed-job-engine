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
// import { PrismaModule } from './prisma/prisma.module';
// import { GraphQLModule } from '@nestjs/graphql';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
// import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    // PrismaModule,
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   context: ({ req, res }) => ({ req, res }),
    //   autoSchemaFile: true,
    // }),
    // UsersModule,
    // AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- At the moment, all the modules that were defined in the `auth` service have been commented out.
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

### 5.2 Creating a Job Decorator

- We are going to create a [Custom Decorator](https://docs.nestjs.com/custom-decorators) that we are going to be applying to our underlying jobs.
- We are going to use the `applyDecorators` function from the `@nestjs/common` package to apply the decorator to the job.
- In NestJS, `applyDecorators` is a utility function from the `@nestjs/common` module that allows you to apply multiple decorators to a single target (such as a class, method, or property) in a single step. This is particularly useful when you want to combine the effects of multiple decorators without having to manually stack them using the `@` syntax.
- `How applyDecorators Works`
  - `applyDecorators` takes a variable number of decorator functions as arguments and returns a new decorator function. When this returned decorator is applied to a target, it applies each of the original decorators in sequence.
- `SetMetadata()` and `Injectable()` are often used together with `applyDecorators()` in NestJS applications. Here's why:

  - `Combining Decorators for Convenience`: `applyDecorators()` allows you to combine multiple decorators into one, making your code cleaner and more readable. By using it with `SetMetadata()` and `Injectable()`, you can apply both decorators to a class or method in a single step.
  - `Metadata and Dependency Injection`: `SetMetadata()` is used to attach metadata to a class or method, which can be useful for various purposes like logging, authorization, or job management (as shown in the example with the @Job decorator)1. Meanwhile, `Injectable()` is essential for making a class injectable as a dependency in NestJS, ensuring it can be managed by the framework's dependency injection system.
  - `Simplifying Class Definitions`: When you want a class to be both injectable and have specific metadata, using `applyDecorators()` with `Injectable()` and `SetMetadata()` simplifies the class definition. This approach avoids the need to manually stack multiple decorators on top of each other, improving code readability.

- We first need to create an interface where we define how the data is going to be stored in the database.

> apps/jobs/src/interfaces/job-metadata.interface.ts

```ts
export interface JobMetadata {
  name: string;
  description: string;
}
```

- We need to create a decorator that will be applied to our jobs.

> apps/jobs/src/decorators/job.decorator.ts

```ts
import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { JobMetadata } from '../interfaces/job-metadata.interface';

export const JOB_METADATA_KEY = 'job_meta';

export const Job = (meta: JobMetadata) => applyDecorators(SetMetadata(JOB_METADATA_KEY, meta), Injectable());
```

- We are going to create the `fibonacci` job example to test the decorator.
