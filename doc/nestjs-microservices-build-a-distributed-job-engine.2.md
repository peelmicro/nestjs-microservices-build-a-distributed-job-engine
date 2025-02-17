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
