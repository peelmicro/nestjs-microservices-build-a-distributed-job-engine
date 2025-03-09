# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 2)

## 3. Improving the microservices solution

### 3.1. Adding `husky` to the solution

- We are going to add [husky](https://typicode.github.io/husky/) to the solution to run the `lint` and `format` commands when we commit the code.

- We are going to use the following commands:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save-dev husky lint-staged --force
npm WARN using --force Recommended protections disabled.
npm WARN ERESOLVE overriding peer dependency
.
added 51 packages, removed 1 package, and audited 1255 packages in 7s

219 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

- we need to execute `husky` using `npx husky init` to initialize the husky configuration.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npx husky init
```

It will create a `.husky` folder with the following file:

> .husky/pre-commit

```text
npm test
```

- We are going to change the `pre-commit` file to run the `lint-staged` command.

> .husky/pre-commit

```text
npx lint-staged --relative
```

- We need to create the `.lintstagedrc` file to configure the `lint-staged` configuration.

> .lintstagedrc

```json
{
  "*.ts": ["nx affected:lint --fix --files"],
  "*": ["nx format:write --files"]
}
```

- We can test if it works by creating a new commit and see if the `lint-staged` command is executed.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git add .
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git commit -m "Husky has been setup"
✔ Backed up original state in git stash (cac7f2c)
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[main 2072271] Husky has been setup
 6 files changed, 758 insertions(+), 3 deletions(-)
 create mode 100644 .husky/pre-commit
 create mode 100644 .lintstagedrc
 create mode 100644 doc/nestjs-microservices-build-a-distributed-job-engine.2.md
```

### 3.2. Fixing the `unit tests`

- If we run the `unit tests` now, we will see the following error:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx test nestjs

> nx run nestjs:test

> jest

No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/libs/nestjs
  5 files checked.
  testMatch: **/?(*.)+(spec|test).[jt]s?(x) - 0 matches
  testPathIgnorePatterns: /node_modules/ - 5 matches
  testRegex:  - 0 matches
Pattern:  - 0 matches
Warning: command "jest" exited with non-zero status code
———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Ran target test for project nestjs (2s)

   ✖  1/1 failed
   ✔  0/1 succeeded [0 read from cache]

View structured, searchable error logs at https://nx.app/runs/0vrcX6fnYS
```

- We need to update the `jest.preset.js` file to pass with no tests.

> jest.preset.js

```javascript
module.exports = { ...nxPreset, passWithNoTests: true };
```

- If we run the `unit tests` now, we will see no errors.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx test nestjs

> nx run nestjs:test

> jest

No tests found, exiting with code 0

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for project nestjs (2s)

View logs and investigate cache misses at https://nx.app/runs/QweQgvXSKd
```

- We can see there are errors when running the `nx test auth` command.

> nx.json

```json
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx test auth

> nx run auth:test

> jest --passWithNoTests=true

 PASS   auth  src/app/prisma/prisma.service.spec.ts
 FAIL   auth  src/app/users/users.service.spec.ts
  ● UsersService › should be defined

    Nest can't resolve dependencies of the UsersService (?). Please make sure that the argument PrismaService at index [0] is available in the RootTestModule context.

    Potential solutions:
    - Is RootTestModule a valid NestJS module?
    - If PrismaService is a provider, is it part of the current RootTestModule?
    - If PrismaService is exported from a separate @Module, is that module imported within RootTestModule?
      @Module({
        imports: [ /* the Module containing PrismaService */ ]
      })

      at TestingInjector.lookupComponentInParentModules (../../node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 0)
      at TestingInjector.resolveConstructorParams (../../node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadProvider (../../node_modules/@nestjs/core/injector/injector.js:98:9)
      at ../../node_modules/@nestjs/core/injector/instance-loader.js:56:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstancesOfProviders (../../node_modules/@nestjs/core/injector/instance-loader.js:55:9)
      at ../../node_modules/@nestjs/core/injector/instance-loader.js:40:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstances (../../node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/@nestjs/testing/testing-module.builder.js:74:9)

 FAIL   auth  src/app/users/users.resolver.spec.ts
  ● UsersResolver › should be defined

    Nest can't resolve dependencies of the UsersResolver (?). Please make sure that the argument UsersService at index [0] is available in the RootTestModule context.

    Potential solutions:
    - Is RootTestModule a valid NestJS module?
    - If UsersService is a provider, is it part of the current RootTestModule?
    - If UsersService is exported from a separate @Module, is that module imported within RootTestModule?
      @Module({
        imports: [ /* the Module containing UsersService */ ]
      })

      at TestingInjector.lookupComponentInParentModules (../../node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../../node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../../node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 0)
      at TestingInjector.resolveConstructorParams (../../node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../../node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadProvider (../../node_modules/@nestjs/core/injector/injector.js:98:9)
      at ../../node_modules/@nestjs/core/injector/instance-loader.js:56:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstancesOfProviders (../../node_modules/@nestjs/core/injector/instance-loader.js:55:9)
      at ../../node_modules/@nestjs/core/injector/instance-loader.js:40:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstances (../../node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../../node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../../node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../../node_modules/@nestjs/testing/testing-module.builder.js:74:9)

Test Suites: 2 failed, 1 passed, 3 total
Tests:       2 failed, 1 passed, 3 total
Snapshots:   0 total
Time:        3.958 s
Ran all test suites.
Warning: command "jest --passWithNoTests=true" exited with non-zero status code
———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Ran target test for project auth (6s)

   ✖  1/1 failed
   ✔  0/1 succeeded [0 read from cache]

View structured, searchable error logs at https://nx.app/runs/GGvdTVOaOu
```

- We need to update the `project.json` file to add the `test` target to the `auth` project.

> apps/auth/project.json

```diff
"test": {
+ "dependsOn": ["generate-types"],
  "options": {
    "passWithNoTests": true
  }
}
```

- We also need to update the `*.spec.ts` files in `users.service.spec.ts` and `users.resolver.spec.ts` to use the `RootTestModule` to be able to use the `PrismaService` and `UsersService`.

> apps/auth/src/app/users/users.service.spec.ts

```diff
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
+        {
+         provide: PrismaService,
+         useValue: {
+           user: { findUnique: jest.fn() },
+         },
+       },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

> apps/auth/src/app/users/users.resolver.spec.ts

```diff
import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
+       {
+         provide: UsersService,
+         useValue: {},
+       },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
```

- If we run the `unit tests` now, we will see no errors:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx test auth

> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 58ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want to react to database changes in your app as they happen? Discover how with Pulse: https://pris.ly/tip-1-pulse


> nx run auth:test

> jest --passWithNoTests=true

 PASS   auth  src/app/prisma/prisma.service.spec.ts
 PASS   auth  src/app/users/users.service.spec.ts
 PASS   auth  src/app/users/users.resolver.spec.ts

Test Suites: 3 passed, 3 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        4.231 s
Ran all test suites.

—————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for project auth and 1 task it depends on (8s)
```

- We need to ensure no errors are happing now in `GitHub Actions` when committing the code.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git add .
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git commit -m "Fixing the unit tests"
```

![GitHub Actions](image009.png)

### 3.3. Reading `environment variables` in the `auth` service

- We are going to read the `environment variables` in the `NestJs` services.
- We need to install the `@nestjs-config` package to be able to read the `environment variables`.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save @nestjs/config --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 2 packages, removed 1 package, and audited 1257 packages in 4s

220 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

- We need to create a new file called `auth.env` in the `apps/auth` folder.

> apps/auth/.env

- We need to update the `auth.module.ts` file to be able to read the `environment variables`.

> apps/auth/src/app/auth.module.ts

```diff
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
+import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
+   ConfigModule,
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- If we run the `auth` service now, we will see the `ConfigModule` is initialized.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve auth

 NX   Running target serve for project auth and 2 tasks it depends on:

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 63ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize


> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 13 KiB [entry] [rendered]
webpack compiled successfully (5c67880ee7b9c110)

> nx run auth:serve:development


> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 64ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want real-time updates to your database without manual polling? Discover how with Pulse: https://pris.ly/tip-0-pulse


> nx run auth:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 13 KiB [entry] [rendered]
webpack compiled successfully (5c67880ee7b9c110)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 1 task it depends on (6s)

Debugger listening on ws://localhost:9229/219234f7-f40f-4f8b-a108-043abd19003f
For help, see: https://nodejs.org/en/docs/inspector

[Nest] 711717  - 17/02/2025, 17:09:52     LOG [NestFactory] Starting Nest application...
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] AppModule dependencies initialized +23ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] UsersModule dependencies initialized +0ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +0ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [GraphQLModule] Mapped {/graphql, POST} route +130ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 711717  - 17/02/2025, 17:09:52     LOG 🚀 Application is running on: http://localhost:3000/api
```

- We need to update the `.env` file to add the `AUTH_PORT` environment variable.

> .env

```text
.
AUTH_PORT=3000
```

- We need to update the `main.ts` file to be able to read the `environment variables`.

> apps/auth/src/main.ts

```diff
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as express from 'express';
+import { ConfigService } from '@nestjs/config';

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
- const port = process.env.PORT || 3000;
+ const port = app.get(ConfigService).getOrThrow('AUTH_PORT');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
```

- If we run the `auth` service now, we will see the `environment variables` are read.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve auth
.
[Nest] 718078  - 17/02/2025, 17:15:01     LOG [NestApplication] Nest application successfully started +3ms
[Nest] 718078  - 17/02/2025, 17:15:01     LOG 🚀 Application is running on: http://localhost:3000/api
```

### 3.4. Changing some `Nx Options`

- We are going to change some `Nx Options` to improve the development experience by adding the `NX_NATIVE_COMMAND_RUNNER` environment variable, so we avoid having any NX native issues.

> .env

```text
.
NX_NATIVE_COMMAND_RUNNER=false
```

- We need to update the `project.json` file to change the `runBuildTargetDependencies` to `true`. This is because we are using `GraphQL` auto-schema generation, and we want it to occur automatically when we run the `serve` target.

> apps/auth/project.json

```diff
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "auth:build",
-       "runBuildTargetDependencies": false,
+       "runBuildTargetDependencies": true
      },


```

## 4. Authentication

### 4.1. Setting up the `JWT Module`

#### 4.1.1. Installing the `JWT` dependencies

- We are going to use the `JWT Module` to authenticate the requests to the `auth` service.
- We need to install the `@nestjs/jwt` package.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save @nestjs/jwt --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 14 packages, removed 1 package, and audited 1271 packages in 4s

220 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

#### 4.1.2. Creating the `JWT Module` in the `auth` service

- We need to create a new module called `auth` in the `apps/auth` folder.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ cd apps/auth/src/app/
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app$ nx generate module auth

 NX   Its time to update Nx 🎉

Your repository uses a higher version of Nx (20.4.4) than your global CLI version (18.3.3)
For more information, see https://nx.dev/more-concepts/global-nx

✔ Which generator would you like to use? · @nx/nest:module

 NX  Generating @nx/nest:module

CREATE apps/auth/src/app/auth.module.ts
UPDATE apps/auth/src/app/app.module.ts
```

- We are going to create the `auth` resolver.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app$ nx generate resolver auth

 NX   Its time to update Nx 🎉

Your repository uses a higher version of Nx (20.4.4) than your global CLI version (18.3.3)
For more information, see https://nx.dev/more-concepts/global-nx

✔ Which generator would you like to use? · @nx/nest:resolver

 NX  Generating @nx/nest:resolver

CREATE apps/auth/src/app/auth.resolver.spec.ts
CREATE apps/auth/src/app/auth.resolver.ts
UPDATE apps/auth/src/app/app.module.ts
```

- We are going to create the `auth` service.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app$ nx generate service auth

 NX   Its time to update Nx 🎉

Your repository uses a higher version of Nx (20.4.4) than your global CLI version (18.3.3)
For more information, see https://nx.dev/more-concepts/global-nx

✔ Which generator would you like to use? · @nx/nest:service

 NX  Generating @nx/nest:service

CREATE apps/auth/src/app/auth.service.spec.ts
CREATE apps/auth/src/app/auth.service.ts
UPDATE apps/auth/src/app/app.module.ts
```

- We need to update the `auth.module.ts` file to import the `JWT Module`.

> apps/auth/src/app/auth.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('JWT_EXPIRATION_MS'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
```

#### 4.2. Modifying the `users` service to search by email

- We need to modify the `users` service to search by email.

> apps/auth/src/app/users/users.service.ts

```ts
.
  async getUser(args: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.findUniqueOrThrow({
      where: args,
    });
  }

  async getUserById(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }
```

> apps/auth/src/app/users/users.resolver.ts

```ts
.
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id', { type: () => Number }) id: number) {
    return this.usersService.getUserById(id);
  }
.
```

> apps/auth/src/app/users/users.module.ts

```ts
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 4.4 Create a generic `GqlContext` interface

- We need to create a generic `GqlContext` interface to be used in the `auth` service.

> libs/nestjs/src/lib/graphql/gql-context.interface.ts

```ts
import { Request, Response } from 'express';

export interface GqlContext {
  req: Request;
  res: Response;
}
```

### 4.5. Modifying the `auth` service to manage the login process

- We need to create a `Token Payload` interface to be used in the `auth` service.

> apps/auth/src/app/auth/token-payload.interface.ts

```ts
export interface TokenPayload {
  userId: number;
}
```

- We need to create a `Login Input` type to be used in the `auth` service.

> apps/auth/src/app/auth/dto/login.input.ts

```ts
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;
}
```

- We need to modify the `auth` service to manage the login process.

> apps/auth/src/app/auth/auth.service.ts

```ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async login({ email, password }: LoginInput, response: Response) {
    const user = await this.verifyUser(email, password);
    const expires = new Date();
    expires.setMilliseconds(expires.getTime() + parseInt(this.configService.getOrThrow('JWT_EXPIRATION_MS')));
    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: !!this.configService.get('SECURE_COOKIE'),
      expires,
    });
    return user;
  }

  private async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
```

- We need to modify the `auth` resolver to use the `auth` service.

> apps/auth/src/app/auth/auth.resolver.ts

```tsimport { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../users/models/user.model';
import { LoginInput } from './dto/login.input';
import { GqlContext } from '@jobber/nestjs';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: GqlContext
  ) {
    return this.authService.login(loginInput, context.res);
  }
}
```

- We need to ensure the solution is working by running the `nx serve auth` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve auth

 NX   Its time to update Nx 🎉

Your repository uses a higher version of Nx (20.4.4) than your global CLI version (18.3.3)
For more information, see https://nx.dev/more-concepts/global-nx


 NX   Running target serve for project auth and 2 tasks it depends on:
 .
 [Nest] 84328  - 18/02/2025, 05:45:07     LOG [GraphQLModule] Mapped {/graphql, POST} route +195ms
[Nest] 84328  - 18/02/2025, 05:45:07     LOG [NestApplication] Nest application successfully started +3ms
[Nest] 84328  - 18/02/2025, 05:45:07     LOG 🚀 Application is running on: http://localhost:3000/api
```

### Adding the `auth.http` document to ensure the login process is working

> apps/auth/src/app/auth/auth.http

```http
POST http://localhost:3000/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword2!" }) {
    id
  }
}
```

- If we run the `auth.http` document, we will see the following response:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
Set-Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTczOTg1Nzg2NCwiZXhwIjoxNzM5ODg2NjY0fQ.mC14ceW2lTkay0CHF6g0Cl0XvYaQtK3AT5IFvHPnvSo; Path=/; Expires=Sun, 07 Apr 2080 18:42:08 GMT; HttpOnly; Secure
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 30
ETag: W/"1e-EgvIyI72IVyUMhTGUlqB8zBQF6I"
Date: Tue, 18 Feb 2025 05:51:04 GMT
Connection: close

{
  "data": {
    "login": {
      "id": "3"
    }
  }
}
```

- We can see the user id is `3`.
- We can see the `Authentication` cookie is set:

```text
Set-Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTczOTg1Nzg2NCwiZXhwIjoxNzM5ODg2NjY0fQ.mC14ceW2lTkay0CHF6g0Cl0XvYaQtK3AT5IFvHPnvSo; Path=/; Expires=Sun, 07 Apr 2080 18:42:08 GMT; HttpOnly; Secure
```

### 4.6 Modify the `auth` test documents

- We need to modify the `auth.service.spec.ts` files to inject the `JwtService` and the `ConfigService` in the `AuthService`.

> apps/auth/src/app/auth/auth.service.spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

- We need to modify the `auth.resolver.spec.ts` file to inject the `AuthService` in the `AuthResolver`.

> apps/auth/src/app/auth/auth.resolver.spec.ts

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
```

- We need to ensure the tests are working by running the `nx test auth` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx test auth

> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 66ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize


> nx run auth:test

> jest --passWithNoTests=true

 PASS   auth  src/app/prisma/prisma.service.spec.ts
 PASS   auth  src/app/users/users.service.spec.ts
 PASS   auth  src/app/auth/auth.service.spec.ts
 PASS   auth  src/app/users/users.resolver.spec.ts
 PASS   auth  src/app/auth/auth.resolver.spec.ts

Test Suites: 5 passed, 5 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        5.15 s
Ran all test suites.
```

### 4.7. Modifying the `auth` microservice to manage the incoming requests with cookies

#### 4.7.1. Installing the dependencies

- We need to install the `passport-jwt` and `@nestjs/passport` and `passport` dependencies to manage the incoming requests using `Passport`.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save passport-jwt @nestjs/passport passport --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 5 packages, removed 1 package, and audited 1276 packages in 5s

221 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

- And the types:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save-dev @types/passport-jwt --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 3 packages, and audited 1279 packages in 2s

221 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

- We also need to install `cookie-parser` to parse the cookies:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save cookie-parser --force
npm WARN using --force Recommended protections disabled.
npm WARN ERESOLVE overriding peer dependency
.
added 2 packages, removed 1 package, and audited 1281 packages in 6s

221 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

- And the types:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --save-dev @types/cookie-parser --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 1 package, and audited 1282 packages in 2s

221 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

#### 4.7.2. Creating the JWT strategy

- We need to create the JWT strategy to validate the token:

> apps/auth/src/app/auth/strategies/jwt.strategy.ts

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: any) => request.cookies?.Authentication || request.token]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: TokenPayload) {
    return payload;
  }
}
```

#### 4.7.3. Modifying the `main.ts` file to use the JWT strategy

```diff
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
+import * as cookieParser from 'cookie-parser';

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
+ app.use(cookieParser());
  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
```

> Note: We need to remove the following lines from the `tsconfig.json` file:

```diff
-"compilerOptions": {
-  "esModuleInterop": true
-}
```

#### 4.7.4. Modifying the `auth.module.ts` file to use the JWT strategy

- We need to modify the `auth.module.ts` file to use the JWT strategy:

> apps/auth/src/app/auth/auth.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
+import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('JWT_EXPIRATION_MS'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
+   JwtStrategy
  ],
})
export class AuthModule {}
```

#### 4.7.5. Creating the `Guards` to validate the token

- We need to create the `Guards` to validate the token:

> apps/auth/src/app/auth/guards/jwt-auth.guard.ts

```ts
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}
```

> apps/auth/src/app/auth/guards/gql-auth.guard.ts

```ts
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

#### 4.7.6. Modifying the `auth.resolver.ts` file to use the `Guards`

- We need to modify the `auth.resolver.ts` file to use the `Guards`:

> apps/auth/src/app/users/users.resolver.ts

```diff
import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UpsertUserInput } from './dto/upsert-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
+import { UseGuards } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async upsertUser(@Args('upsertUserInput') upsertUserInput: UpsertUserInput) {
    return this.usersService.upsertUser(upsertUserInput);
  }

+ @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.getUsers();
  }

+ @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id', { type: () => Number }) id: number) {
    return this.usersService.getUserById(id);
  }

+ @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'userByEmail' })
  async getUserByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.getUserByEmail(email);
  }
}
```

#### 4.7.7. Modifying the `users.http` file to send the token in the cookies

- If we execute the `users.http` file, we will get the following error:

> request

```
### Get all users

POST http://localhost:3000/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query {
  users
  {
    id
    email
    createdAt
    updatedAt
  }
}
```

> response

```
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 2005
ETag: W/"7d5-pIQWyfSu3yp/7VP+x8e7T2bhQvo"
Date: Thu, 20 Feb 2025 04:53:56 GMT
Connection: close

{
  "errors": [
    {
      "message": "Unauthorized",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "users"
      ],
      "extensions": {
        "code": "UNAUTHENTICATED",
        "stacktrace": [
          "UnauthorizedException: Unauthorized",
          "    at GqlAuthGuard.handleRequest (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/passport/dist/auth.guard.js:60:30)",
          "    at /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/passport/dist/auth.guard.js:44:124",
          "    at /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/passport/dist/auth.guard.js:83:24",
          "    at allFailed (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/passport/lib/middleware/authenticate.js:110:18)",
          "    at attempt (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/passport/lib/middleware/authenticate.js:183:28)",
          "    at JwtStrategy.strategy.fail (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/passport/lib/middleware/authenticate.js:314:9)",
          "    at JwtStrategy.authenticate (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/passport-jwt/lib/strategy.js:96:21)",
          "    at attempt (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/passport/lib/middleware/authenticate.js:378:16)",
          "    at authenticate (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/passport/lib/middleware/authenticate.js:379:7)",
          "    at /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/passport/dist/auth.guard.js:88:3"
        ],
        "originalError": {
          "message": "Unauthorized",
          "statusCode": 401
        }
      }
    }
  ],
  "data": null
}
```

- We need to fix the `users.http` file to send the token in the cookies:

> apps/auth/src/app/users/users.http

```http
@url = http://localhost:3000/graphql

### Login
# @name login
POST {{url}}
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

### Get all users
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  users
  {
    id
    email
    createdAt
    updatedAt
  }
}

### Get a user by email

POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  userByEmail(email: "my-email2@msn.com")
  {
    id
    email
    createdAt
    updatedAt
  }
}

### Get a user by id

POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  user(id: 1)
  {
    id
    email
    createdAt
    updatedAt
  }
}

### Create a user

POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  upsertUser(upsertUserInput: {
    email: "my-email2@msn.com",
    password: "MyPassword1!"
  })
  {
    id
    email
    createdAt
    updatedAt
  }
}

### Update password for a user

POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  upsertUser(upsertUserInput: {
    email: "my-email2@msn.com",
    password: "MyPassword1!",
    newPassword: "MyPassword2!"
  })
  {
    id
    email
    createdAt
    updatedAt
  }
}
```

- Now, we need to execute the `### Login` request first and then the other requests:

> request

```http
### Get all users
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  users
  {
    id
    email
    createdAt
    updatedAt
  }
}
```

> response

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 373
ETag: W/"175-AgLwgQzaJgfzHwNLABfqoch//EA"
Date: Fri, 21 Feb 2025 06:09:16 GMT
Connection: close

{
  "data": {
    "users": [
      {
        "id": "1",
        "email": "juanp_perez@msn.com",
        "createdAt": "2025-02-16T17:17:02.485Z",
        "updatedAt": "2025-02-16T17:17:02.468Z"
      },
      {
        "id": "2",
        "email": "my-email@msn.com",
        "createdAt": "2025-02-16T17:38:06.463Z",
        "updatedAt": "2025-02-16T17:38:06.459Z"
      },
      {
        "id": "3",
        "email": "my-email2@msn.com",
        "createdAt": "2025-02-16T17:42:12.746Z",
        "updatedAt": "2025-02-17T04:40:39.608Z"
      }
    ]
  }
}
```

#### 4.7.8. Adding the `User decorator`

- We need to add the `User decorator` to the `users.resolver.ts` file:

> apps/auth/src/app/auth/current-user.decorator.ts

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext().req.user);
```

- We need to add the `CurrentUser` decorator to the `users.resolver.ts` file:

> apps/auth/src/app/users/users.resolver.ts

```ts
import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UpsertUserInput } from './dto/upsert-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async upsertUser(@Args('upsertUserInput') upsertUserInput: UpsertUserInput) {
    return this.usersService.upsertUser(upsertUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.getUsers();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id', { type: () => Number }) id: number) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'userByEmail' })
  async getUserByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'getUserFromCookie' })
  async getUserFromCookie(@CurrentUser() { userId }: TokenPayload) {
    return this.usersService.getUserById(userId);
  }
}
```

- I can test it adding:

> apps/auth/src/app/users/users.http

```http
### Get a user from the cookie

POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  getUserFromCookie
  {
    id
    email
    createdAt
    updatedAt
  }
}
```

- We can see the response:

> response

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 148
ETag: W/"94-UHW8j3+XZxI+hYjcDRvVTQSO6Gc"
Date: Fri, 21 Feb 2025 06:35:42 GMT
Connection: close

{
  "data": {
    "getUserFromCookie": {
      "id": "3",
      "email": "my-email2@msn.com",
      "createdAt": "2025-02-16T17:42:12.746Z",
      "updatedAt": "2025-02-17T04:40:39.608Z"
    }
  }
}
```
