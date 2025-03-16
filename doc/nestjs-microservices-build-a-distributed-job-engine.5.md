# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 5)

## 9. Solution Dockerization

- In this section we are going to dockerize the solution.

### 9.1. Refactoring the microservices and libraries

- Currently we have a single `package.json` file in the root of the project, where we have the dependencies for all the microservices and libraries.
- We are going to create a `package.json` file in the `apps` and `libs` folders to manage the dependencies of each microservice and library.
- We are going to use `workspaces` to manage the dependencies between the microservices and libraries.

#### 9.1.1. Removing the `e2e` tests projects from the `apps` and `libs` folders

- We are going to remove the `e2e` tests projects from the `apps` and `libs` folders.
- We are going to use the `Remove Nx project` option from the `Visual Studio Code` context menu to remove the `e2e` tests projects from the `apps` and `libs` folders.

![Remove e2e tests](image010.png)

![Remove e2e tests command](image011.png)

```bash
 *  Executing task: npx nx generate @nx/workspace:remove --projectName=auth-e2e --no-interactive

 NX  Generating @nx/workspace:remove

DELETE apps/auth-e2e/eslint.config.mjs
DELETE apps/auth-e2e/jest.config.ts
DELETE apps/auth-e2e/project.json
DELETE apps/auth-e2e/src/auth/auth.spec.ts
DELETE apps/auth-e2e/src/auth
DELETE apps/auth-e2e/src/support/global-setup.ts
DELETE apps/auth-e2e/src/support/global-teardown.ts
DELETE apps/auth-e2e/src/support/test-setup.ts
DELETE apps/auth-e2e/src/support
DELETE apps/auth-e2e/src
DELETE apps/auth-e2e/tsconfig.json
DELETE apps/auth-e2e/tsconfig.spec.json
DELETE apps/auth-e2e
 *  Terminal will be reused by tasks, press any key to close it.
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps$ rm -rf auth/e2e executor/e2e
```

- These are the services that we have after removing the `e2e` tests projects:

> nx.json

```diff
.
-"exclude": [
-  "apps/auth-e2e/**/*",
-  "apps/jobs-e2e/**/*",
-  "apps/executor-e2e/**/*"
-]
.
```

- We need to ensure those projects are removed from the `nx.json` file.

#### 9.1.2. Adding `workspaces` to the root `package.json` file

- We are going to add the `workspaces` property to the root `package.json` file.

```json
.
"workspaces": [
  "apps/*",
  "libs/*"
]
.
```

#### 9.1.3. Adding `package.json` files to the `apps` and `libs` folders

- We are going to add `package.json` files to the `apps` and `libs` folders.

##### 9.1.3.1. Adding `package.json` files to the `apps/auth` folder

- We are going to add a `package.json` file to the `apps/auth` folder.

> apps/auth/package.json

```json
{
  "name": "@jobber/auth",
  "version": "0.0.0",
  "dependencies": {
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "bcryptjs": "^3.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/passport-jwt": "^4.0.1"
  }
}
```

- We are going to update the `project.json` file to remove the `generate-ts-proto` target.

> apps/auth/project.json

```json
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
      "dependsOn": ["generate-prisma", "^build"]
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
    }
  }
}
```

##### 9.1.3.2. Adding `package.json` files to the `apps/executor` folder

- We are going to add a `package.json` file to the `apps/executor` folder.

> apps/executor/package.json

```json
{
  "name": "@jobber/executor",
  "version": "0.0.0",
  "dependencies": {
    "fibonacci": "^1.6.11"
  },
  "devDependencies": {}
}
```

##### 9.1.3.3. Adding `package.json` files to the `apps/jobs` folder

- We are going to add a `package.json` file to the `apps/jobs` folder.

> apps/jobs/package.json

```json
{
  "name": "@jobber/jobs",
  "version": "0.0.0",
  "dependencies": {
    "graphql-type-json": "^0.3.2"
  },
  "devDependencies": {}
}
```

##### 9.1.3.4. Adding `package.json` files to the `libs/pulsar` folder

- We are going to add a `package.json` file to the `libs/pulsar` folder.

> libs/pulsar/package.json

```json
{
  "name": "@jobber/pulsar",
  "version": "0.0.0",
  "dependencies": {
    "pulsar-client": "^1.13.0"
  },
  "devDependencies": {}
}
```

> Note: We are not going to add a `package.json` file to the `libs/nestjs` folder because doesn't have any dependencies.

#### 9.1.3.5. Removing the not global dependencies from the root `package.json` file

- We are going to remove the not global dependencies from the root `package.json` file.

```json
{
  "name": "@jobber/source",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "prepare": "husky",
    "generate-ts-proto": "npx protoc --plugin=./node_modules/.bin/ptoroc-gen_ts_proto --ts_proto_out=./types ./proto/*.proto --ts_proto_opt=nestJs=true",
    "serve:all": "nx run-many -t serve -p auth jobs executor",
    "build:all": "nx run-many -t build -p auth jobs executor"
  },
  "workspaces": ["apps/*", "libs/*"],
  "nx": {
    "targets": {
      "generate-ts-proto": {
        "inputs": ["{workspaceRoot}/proto/*.proto"],
        "cacheable": true
      }
    }
  },
  "private": true,
  "dependencies": {
    "@apollo/server": "^4.11.3",
    "@golevelup/nestjs-discovery": "^4.0.3",
    "@grpc/grpc-js": "^1.12.6",
    "@grpc/proto-loader": "^0.7.13",
    "@nestjs/apollo": "^13.0.3",
    "@nestjs/common": "^11.0.11",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.11",
    "@nestjs/graphql": "^13.0.3",
    "@nestjs/microservices": "^11.0.11",
    "@nestjs/platform-express": "^11.0.11",
    "@prisma/client": "^6.4.1",
    "axios": "^1.8.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.7",
    "graphql": "^16.10.0",
    "msgpackr": "^1.11.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "ts-proto": "^2.6.1"
  },
  "devDependencies": {
    "@angular-devkit/core": "^19.2.0",
    "@eslint/js": "^9.21.0",
    "@nestjs/schematics": "^11.0.1",
    "@nestjs/testing": "^11.0.11",
    "@nx/eslint": "20.4.6",
    "@nx/eslint-plugin": "20.4.6",
    "@nx/jest": "20.4.6",
    "@nx/js": "20.4.6",
    "@nx/nest": "20.4.6",
    "@nx/node": "20.4.6",
    "@nx/web": "20.4.6",
    "@nx/webpack": "20.4.6",
    "@nx/workspace": "20.4.6",
    "@swc-node/register": "~1.10.9",
    "@swc/core": "~1.11.5",
    "@swc/helpers": "~0.5.15",
    "@types/cookie-parser": "^1.4.8",
    "@types/jest": "^29.5.14",
    "@types/node": "~22.13.8",
    "eslint": "^9.21.0",
    "eslint-config-prettier": "^10.0.2",
    "husky": "^9.1.7",
    "jest": "^29.7.0",
    "jest-environment-node": "^29.7.0",
    "lint-staged": "^15.4.3",
    "nx": "20.4.6",
    "prettier": "^3.5.3",
    "prisma": "^6.4.1",
    "ts-jest": "^29.2.6",
    "ts-node": "10.9.2",
    "tslib": "^2.8.1",
    "typescript": "~5.8.2",
    "typescript-eslint": "^8.25.0",
    "webpack-cli": "^6.0.1"
  }
}
```

#### 9.2 Adding new libraries to the project

- We are going to add new libraries to the project.

##### 9.2.1. Adding the `libs/graphql` library

- We are going to rename the `libs/nestjs` library to `libs/graphql` and add the `package.json` file to the project.

> libs/graphql/package.json

```json
{
  "name": "@jobber/graphql",
  "version": "0.0.0",
  "dependencies": {
    "@apollo/server": "^4.11.3",
    "@nestjs/apollo": "^13.0.3",
    "@nestjs/graphql": "^13.0.3",
    "graphql": "^16.10.0"
  },
  "devDependencies": {}
}
```

- We are going to create the `webpack.config.js` file for the `libs/graphql` library.

> libs/graphql/webpack.config.js

```js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/graphql'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

##### 9.2.2. Adding the `libs/nestjs` library

- We are going to create a new library called `libs/nestjs` using the `nx cli` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/libs$ nx generate lib nestjs
✔ Which generator would you like to use? · @nx/nest:library

 NX  Generating @nx/nest:library

✔ Which linter would you like to use? · eslint
✔ Which unit test runner would you like to use? · none
CREATE libs/nestjs/tsconfig.lib.json
CREATE libs/nestjs/tsconfig.json
CREATE libs/nestjs/src/index.ts
CREATE libs/nestjs/README.md
CREATE libs/nestjs/project.json
CREATE eslint.base.config.mjs
UPDATE apps/auth/eslint.config.mjs
UPDATE apps/executor/eslint.config.mjs
UPDATE apps/jobs/eslint.config.mjs
UPDATE libs/graphql/eslint.config.mjs
UPDATE eslint.config.mjs
CREATE libs/nestjs/eslint.config.mjs
UPDATE tsconfig.base.json
CREATE libs/nestjs/src/lib/nestjs.module.ts

 NX   👀 View Details of nestjs

Run "nx show project nestjs" to view details about this project.
```

- We are going to move the `init.ts` file to the `libs/nestjs` library.

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

- We are going to create the `webpack.config.js` file for the `libs/nestjs` library.

> libs/nestjs/webpack.config.js

```js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/nestjs'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

##### 9.2.3. Adding the `libs/grpc` library

- We are going to create a new library called `libs/grpc` using the `nx cli` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/libs$ nx generate lib grpc
✔ Which generator would you like to use? · @nx/nest:library

 NX  Generating @nx/nest:library

✔ Which linter would you like to use? · none
✔ Which unit test runner would you like to use? · none
CREATE libs/grpc/tsconfig.lib.json
CREATE libs/grpc/tsconfig.json
CREATE libs/grpc/src/index.ts
CREATE libs/grpc/README.md
CREATE libs/grpc/project.json
UPDATE tsconfig.base.json
CREATE libs/grpc/src/lib/grpc.module.ts

 NX   👀 View Details of grpc

Run "nx show project grpc" to view details about this project.


 NX   👀 View Details of grpc

Run "nx show project grpc" to view details about this project.
```

- We are going to create the `package.json` file for the `libs/grpc` library.

> libs/grpc/package.json

```json
{
  "name": "@jobber/grpc",
  "version": "0.0.0",
  "dependencies": {
    "ts-proto": "^2.6.1",
    "@grpc/grpc-js": "^1.12.6",
    "@grpc/proto-loader": "^0.7.13"
  },
  "devDependencies": {}
}
```

- We are going to modify the `project.json` file to add the `generate-ts-proto` target.

> libs/grpc/project.json

```json
{
  "name": "grpc",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/grpc/src",
  "projectType": "library",
  "tags": [],
  "targets": {
    "build": {
      "dependsOn": ["generate-ts-proto"],
      "options": {
        "assets": [
          {
            "glob": "*.proto",
            "input": "{projectRoot}/src/lib/proto",
            "output": "./proto"
          }
        ]
      }
    },
    "generate-ts-proto": {
      "command": "npx protoc --plugin=protoc-gen-ts_proto=../../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/lib/types/proto ./src/lib/proto/*.proto --ts_proto_opt=nestJs=true --ts_proto_opt=exportCommonSymbols=false",
      "options": {
        "cwd": "{projectRoot}"
      },
      "inputs": ["{projectRoot}/src/lib/proto/*.proto"],
      "cache": true
    }
  }
}
```

- We are going to create the `webpack.config.js` file for the `libs/grpc` library.

> libs/grpc/webpack.config.js

```js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/grpc'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

- We are going to execute the `nx build grpc` command to build the `libs/grpc` library.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx build grpc

> nx run grpc:generate-ts-proto

> npx protoc --plugin=protoc-gen-ts_proto=../../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/lib/types/proto ./src/lib/proto/*.proto --ts_proto_opt=nestJs=true --ts_proto_opt=exportCommonSymbols=false


> nx run grpc:build

> webpack-cli build --node-env=production

chunk (runtime: main) main.js (main) 1.54 KiB [entry] [rendered]
webpack compiled successfully (ee28650bc97d5659)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project grpc and 1 task it depends on (5s)
```

##### 9.2.4. Adding the `libs/prisma` library

- We are going to create a new library called `libs/prisma` using the `nx cli` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/libs$ nx generate lib prisma
✔ Which generator would you like to use? · @nx/nest:library

 NX  Generating @nx/nest:library

✔ Which linter would you like to use? · none
✔ Which unit test runner would you like to use? · none
CREATE libs/prisma/tsconfig.lib.json
CREATE libs/prisma/tsconfig.json
CREATE libs/prisma/src/index.ts
CREATE libs/prisma/README.md
CREATE libs/prisma/project.json
UPDATE tsconfig.base.json
CREATE libs/prisma/src/lib/prisma.module.ts

 NX   👀 View Details of prisma

Run "nx show project prisma" to view details about this project.


 NX   👀 View Details of prisma

Run "nx show project prisma" to view details about this project.
```

- We are going to create the `package.json` file for the `libs/prisma` library.

> libs/prisma/package.json

```json
{
  "name": "@jobber/prisma",
  "version": "0.0.0",
  "dependencies": {
    "@prisma/client": "^6.4.1"
  },
  "devDependencies": {
    "prisma": "^6.4.1"
  }
}
```

- We are going to create the `webpack.config.js` file for the `libs/prisma` library.

> libs/prisma/webpack.config.js

```js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/prisma'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

##### 9.2.5. Adding the `webpack.config.js` file for the `libs/pulsar` library

- We are going to create the `webpack.config.js` file for the `libs/pulsar` library.

> libs/pulsar/webpack.config.js

```js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/pulsar'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

#### 9.3 Fixing issues when compiling the `libs`

##### 9.3.1. Explaining the issue

- When we try to execute one of the main `apps` from the `dist` folder, we get the following error:

- We are going to fix the issues when compiling the `libs` when we run the `nx build` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ node ./dist/apps/auth/main
node:internal/modules/cjs/loader:1247
  throw err;
  ^

Error: Cannot find module '@jobber/graphql'
Require stack:
- /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/main.js
    at Function._resolveFilename (node:internal/modules/cjs/loader:1244:15)
    at Function._load (node:internal/modules/cjs/loader:1070:27)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:217:24)
    at Module.require (node:internal/modules/cjs/loader:1335:12)
    at require (node:internal/modules/helpers:136:16)
    at Object.defineProperty.value (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/main.js:260:18)
    at __webpack_require__ (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/main.js:818:41)
    at Array.<anonymous> (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/main.js:234:19)
    at __webpack_require__ (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/main.js:818:41) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/main.js'
  ]
}
```

- When are compiling locally, the manage of the libs dependencies is made by the use of the `paths` property of the `tsconfig.base.json` file.

> tsconfig.base.json

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@jobber/graphql": ["libs/graphql/src/index.ts"],
      "@jobber/grpc": ["libs/grpc/src/index.ts"],
      "@jobber/nestjs": ["libs/nestjs/src/index.ts"],
      "@jobber/prisma": ["libs/prisma/src/index.ts"],
      "@jobber/pulsar": ["libs/pulsar/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

- But those aliases are not available to the node executable when we are running it using the `node ./dist/apps/auth/main` command.
- We need a way to tell the node executable to use the aliases defined in the `tsconfig.base.json` file.
- We are going to use a npm package called `module-alias` to solve this issue.

##### 9.3.2. Adding the `module-alias` npm package

- We are going to add the `module-alias` npm package.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i module-alias --legacy-peer-deps

added 1 package, removed 1 package, and audited 1366 packages in 3s

226 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

##### 9.3.3. Adding the `module-alias` configuration

- We are going to add the `module-alias` configuration to the main `package.json` file.

> package.json

```json
.
  "_moduleAliases": {
    "@jobber/grpc": "dist/libs/grpc/main",
    "@jobber/graphql": "dist/libs/graphql/main",
    "@jobber/pulsar": "dist/libs/pulsar/main",
    "@jobber/nestjs": "dist/libs/nestjs/main",
    "@jobber/prisma": "dist/libs/prisma/main"
  },
.
```

##### 9.3.4. Adding the `module-alias` configuration to the `main.ts` files of the `apps` projects

- We are going to add the `module-alias` configuration to the `main.ts` files of the `apps` projects.
- We are also going to set the proper configuration for the `proto` files.

> apps/auth/src/main.ts

```diff
+import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'path';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
-     protoPath: join(__dirname, 'proto', 'auth.proto'),
+     protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
```

> apps/executor/src/main.ts

```diff
+import 'module-alias/register';
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

```diff
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { init } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);
}

bootstrap();
```

- In this case, we need to update the `protoPath` property in the `jobs.module.ts` file.

> apps/jobs/src/jobs.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'path';
import { PulsarModule } from '@jobber/pulsar';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    PulsarModule,
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
-         protoPath: join(__dirname, 'proto', 'auth.proto'),
+         protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver],
})
export class JobsModule {}
```

##### 9.3.5. Adding the `commonjs2` configuration to the `webpack.config.js` files of the `libs` projects

- We are going to add the `commonjs2` configuration to the `webpack.config.js` files of the `libs` projects.
- The `libraryTarget: 'commonjs2'` line specifies how your bundled code will be exported when it's built by webpack.
- In this case, it's telling webpack to output your library in the CommonJS2 module format, which is the standard format used by Node.js. This means:
  - Your bundled code will use `module.exports = ...` to export its functionality
- It's optimized for consumption by Node.js applications or other CommonJS environments
- Other modules will be able to require/import your library using require('your-library')
- `CommonJS2` is essentiall`the same as`CommonJS` but specifically refers to the Node.js implementation that uses module.exports instead of just exports.
- This setting is appropriate for a `GraphQL` library that will be used in a `Node.js` environment, as it ensures compatibility with the `Node.js` module system.

> libs/graphql/webpack.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/graphql'),
+   libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

> libs/grpc/webpack.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/grpc'),
+   libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

> libs/nestjs/webpack.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/nestjs'),
+   libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

> libs/prisma/webpack.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/prisma'),
+   libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

> libs/pulsar/webpack.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/pulsar'),
+   libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

##### 9.3.6. Ensuring that everything is working

- We are going to ensure that everything is working by running the `node ./dist/apps/auth/main` command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ node ./dist/apps/auth/main
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [NestFactory] Starting Nest application...
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] UsersModule dependencies initialized +2ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] JwtModule dependencies initialized +0ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +0ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [InstanceLoader] AuthModule dependencies initialized +0ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [RoutesResolver] AuthController {/api}: +11ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [GraphQLModule] Mapped {/graphql, POST} route +97ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 72078  - 16/03/2025, 05:14:45     LOG 🚀 Application is running on: http://localhost:3000/api
[Nest] 72078  - 16/03/2025, 05:14:45     LOG [NestMicroservice] Nest microservice successfully started
```

- We can do the same for the `executor` app.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ node ./dist/apps/executor/main
[Nest] 74019  - 16/03/2025, 05:16:20     LOG [NestFactory] Starting Nest application...
[Nest] 74019  - 16/03/2025, 05:16:20     LOG [InstanceLoader] AppModule dependencies initialized +7ms
[Nest] 74019  - 16/03/2025, 05:16:20     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 74019  - 16/03/2025, 05:16:20     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 74019  - 16/03/2025, 05:16:20   ERROR [ExceptionHandler] TypeError: Configuration key "PULSAR_SERVICE_URL" does not exist
    at ConfigService.getOrThrow (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at new PulsarClient (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/libs/pulsar/main.js:67:44)
    at Injector.instantiateClass (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:373:19)
    at callback (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async Injector.lookupComponentInImports (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:297:17)
    at async Injector.lookupComponentInParentModules (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:260:33)
    at async Injector.resolveComponentInstance (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:215:33)
```

- The problem is that the `PULSAR_SERVICE_URL` environment variable is not set.
- We'll set these environment variables in the Docker Compose file.

- We can do the same for the `jobs` app.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ node ./dist/apps/jobs/main
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [NestFactory] Starting Nest application...
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [InstanceLoader] AppModule dependencies initialized +13ms
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 75578  - 16/03/2025, 05:17:36     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 75578  - 16/03/2025, 05:17:36   ERROR [ExceptionHandler] TypeError: Configuration key "PULSAR_SERVICE_URL" does not exist
    at ConfigService.getOrThrow (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at new PulsarClient (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/libs/pulsar/main.js:67:44)
    at Injector.instantiateClass (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:373:19)
    at callback (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/instance-loader.js:56:13
    at async Promise.all (index 3)
    at async InstanceLoader.createInstancesOfProviders (/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/node_modules/@nestjs/core/injector/instance-loader.js:55:9)
```

- We can see we have the same problem as before.

#### 9.4. Adding the Dockerfile documents

- We are going to add the `Dockerfile` documents to the `apps` projects.

##### 9.4.1. Removing `husky` from the main `package.json`

- We are going to remove `husky` from the main `package.json` file, so that it is not executed in the Docker build process.

> package.json

```diff
{
  "name": "@jobber/source",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
-   "prepare": "husky",
    "serve:all": "nx run-many -t serve -p auth jobs executor",
    "build:all": "nx run-many -t build -p auth jobs executor"
  },
.
```

##### 9.4.2. Adding the `Dockerfile` document to the `auth` app

> apps/auth/Dockerfile

```dockerfile
# Builder Stage
FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

# Copy necessary files for building the app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/auth ./apps/auth
COPY libs/graphql ./libs/graphql
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/prisma ./libs/prisma

# Install dependencies
RUN npm install --legacy-peer-deps

RUN apt-get update && apt-get install -y protobuf-compiler

# Build the app
RUN npx nx build auth

# Runner Stage
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy necessary files
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/package-lock.json ./
COPY --from=builder /workspace/apps/auth/package.json ./apps/auth/package.json
COPY --from=builder /workspace/apps/auth/prisma ./apps/auth/prisma
COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json

# Set production environment
ENV NODE_ENV=production

# Install production dependencies
RUN npm ci --legacy-peer-deps

# Copy build output and other files
COPY --from=builder /workspace/node_modules/@prisma-clients/auth/ ./node_modules/@prisma-clients/auth/
COPY --from=builder /workspace/dist ./dist

# Generate Prisma client in the runner stage
RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma  # Add this line

# Run the application
CMD ["node", "dist/apps/auth/main"]
```

- We need to ensure that the Docker build process is working.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker build -t auth -f apps/auth/Dockerfile .
[+] Building 60.9s (36/36) FINISHED                                                                                                                       docker:default
 => [internal] load build definition from Dockerfile                                                                                                                0.0s
 => => transferring dockerfile: 1.78kB                                                                                                                              0.0s
 => [internal] load metadata for docker.io/library/node:22-slim                                                                                                     0.5s
 => [internal] load .dockerignore                                                                                                                                   0.0s
 => => transferring context: 2B                                                                                                                                     0.0s
 => [internal] load build context                                                                                                                                   0.6s
 => => transferring context: 7.59kB                                                                                                                                 0.6s
 => [builder  1/18] FROM docker.io/library/node:22-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4                                     0.0s
 => CACHED [builder  2/18] WORKDIR /workspace                                                                                                                       0.0s
 => CACHED [builder  3/18] RUN apt-get update && apt-get install -y openssl                                                                                         0.0s
 => CACHED [builder  4/18] COPY package*.json ./                                                                                                                    0.0s
 => CACHED [builder  5/18] COPY nx.json ./                                                                                                                          0.0s
 => CACHED [builder  6/18] COPY tsconfig*.json ./                                                                                                                   0.0s
 => CACHED [builder  7/18] COPY jest.config.ts ./                                                                                                                   0.0s
 => CACHED [builder  8/18] COPY jest.preset.js ./                                                                                                                   0.0s
 => CACHED [builder  9/18] COPY eslint.config.mjs ./                                                                                                                0.0s
 => CACHED [builder 10/18] COPY webpack.*.config.js ./                                                                                                              0.0s
 => [builder 11/18] COPY apps/auth ./apps/auth                                                                                                                      0.0s
 => [builder 12/18] COPY libs/graphql ./libs/graphql                                                                                                                0.0s
 => [builder 13/18] COPY libs/grpc ./libs/grpc                                                                                                                      0.0s
 => [builder 14/18] COPY libs/nestjs ./libs/nestjs                                                                                                                  0.0s
 => [builder 15/18] COPY libs/prisma ./libs/prisma                                                                                                                  0.0s
 => [builder 16/18] RUN npm install --legacy-peer-deps                                                                                                             14.4s
 => [builder 17/18] RUN apt-get update && apt-get install -y protobuf-compiler                                                                                      9.9s
 => [builder 18/18] RUN npx nx build auth                                                                                                                          17.5s
 => CACHED [runner  2/14] RUN apt-get update && apt-get install -y openssl                                                                                          0.0s
 => CACHED [runner  3/14] WORKDIR /app                                                                                                                              0.0s
 => CACHED [runner  4/14] COPY --from=builder /workspace/package.json ./                                                                                            0.0s
 => CACHED [runner  5/14] COPY --from=builder /workspace/package-lock.json ./                                                                                       0.0s
 => CACHED [runner  6/14] COPY --from=builder /workspace/apps/auth/package.json ./apps/auth/package.json                                                            0.0s
 => [runner  7/14] COPY --from=builder /workspace/apps/auth/prisma ./apps/auth/prisma                                                                               0.0s
 => [runner  8/14] COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json                                                             0.0s
 => [runner  9/14] COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json                                                                   0.1s
 => [runner 10/14] COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json                                                               0.0s
 => [runner 11/14] RUN npm ci --legacy-peer-deps                                                                                                                    5.6s
 => [runner 12/14] COPY --from=builder /workspace/node_modules/@prisma-clients/auth/ ./node_modules/@prisma-clients/auth/                                           0.1s
 => [runner 13/14] COPY --from=builder /workspace/dist ./dist                                                                                                       0.0s
 => [runner 14/14] RUN npx prisma generate --schema=./apps/auth/prisma/schema.prisma  # Add this line                                                               9.3s
 => exporting to image                                                                                                                                              1.8s
 => => exporting layers                                                                                                                                             1.8s
 => => writing image sha256:288ffb5c66f07a606706e4bb588d09d4cd15867b1e1bff4ce8a80d8e4c6b34d7                                                                        0.0s
 => => naming to docker.io/library/auth
```

- When we execute the `docker run` command, we need to ensure that the `auth` service is started.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker run auth
[Nest] 1  - 03/16/2025, 11:48:41 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/16/2025, 11:48:41 AM     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 1  - 03/16/2025, 11:48:41 AM     LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 1  - 03/16/2025, 11:48:41 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 1  - 03/16/2025, 11:48:41 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 1  - 03/16/2025, 11:48:41 AM   ERROR [ExceptionHandler] TypeError: Configuration key "JWT_SECRET" does not exist
    at ConfigService.getOrThrow (/app/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at InstanceWrapper.useFactory [as metatype] (/app/dist/apps/auth/main.js:503:43)
    at Injector.instantiateClass (/app/node_modules/@nestjs/core/injector/injector.js:376:55)
    at callback (/app/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/app/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/app/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/app/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async /app/node_modules/@nestjs/core/injector/instance-loader.js:56:13
    at async Promise.all (index 4)
    at async InstanceLoader.createInstancesOfProviders (/app/node_modules/@nestjs/core/injector/instance-loader.js:55:9)
```

##### 9.4.3. Adding the `Dockerfile` document to the `executor` app

> apps/executor/Dockerfile

```dockerfile
FROM node:22-slim AS builder

WORKDIR /workspace

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/executor ./apps/executor
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar

RUN npm install --legacy-peer-deps

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build executor

FROM node:22-slim AS runner

WORKDIR /app

COPY --from=builder /workspace/package*.json ./

COPY --from=builder /workspace/apps/executor/package.json ./apps/executor/
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/

COPY --from=builder /workspace/node_modules ./node_modules

COPY --from=builder /workspace/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/apps/executor/main"]
```

- We need to ensure that the Docker build process is working.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker build -t executor -f apps/executor/Dockerfile .
[+] Building 51.2s (28/28) FINISHED                                                                                                                       docker:default
 => [internal] load build definition from Dockerfile                                                                                                                0.0s
 => => transferring dockerfile: 974B                                                                                                                                0.0s
 => [internal] load metadata for docker.io/library/node:22-slim                                                                                                     0.5s
 => [internal] load .dockerignore                                                                                                                                   0.0s
 => => transferring context: 2B                                                                                                                                     0.0s
 => [internal] load build context                                                                                                                                   0.6s
 => => transferring context: 4.44kB                                                                                                                                 0.6s
 => [builder  1/16] FROM docker.io/library/node:22-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4                                     0.0s
 => CACHED [builder  2/16] WORKDIR /workspace                                                                                                                       0.0s
 => CACHED [builder  3/16] COPY package*.json ./                                                                                                                    0.0s
 => CACHED [builder  4/16] COPY nx.json ./                                                                                                                          0.0s
 => CACHED [builder  5/16] COPY tsconfig*.json ./                                                                                                                   0.0s
 => CACHED [builder  6/16] COPY jest.config.ts ./                                                                                                                   0.0s
 => CACHED [builder  7/16] COPY jest.preset.js ./                                                                                                                   0.0s
 => CACHED [builder  8/16] COPY eslint.config.mjs ./                                                                                                                0.0s
 => CACHED [builder  9/16] COPY webpack.*.config.js ./                                                                                                              0.0s
 => [builder 10/16] COPY apps/executor ./apps/executor                                                                                                              0.0s
 => [builder 11/16] COPY libs/grpc ./libs/grpc                                                                                                                      0.0s
 => [builder 12/16] COPY libs/nestjs ./libs/nestjs                                                                                                                  0.0s
 => [builder 13/16] COPY libs/pulsar ./libs/pulsar                                                                                                                  0.0s
 => [builder 14/16] RUN npm install --legacy-peer-deps                                                                                                             15.8s
 => [builder 15/16] RUN apt-get update && apt-get install -y protobuf-compiler                                                                                     11.1s
 => [builder 16/16] RUN npx nx build executor                                                                                                                       8.3s
 => CACHED [runner 2/8] WORKDIR /app                                                                                                                                0.0s
 => CACHED [runner 3/8] COPY --from=builder /workspace/package*.json ./                                                                                             0.0s
 => CACHED [runner 4/8] COPY --from=builder /workspace/apps/executor/package.json ./apps/executor/                                                                  0.0s
 => CACHED [runner 5/8] COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/                                                                          0.0s
 => [runner 6/8] COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/                                                                             0.0s
 => [runner 7/8] COPY --from=builder /workspace/node_modules ./node_modules                                                                                         5.7s
 => [runner 8/8] COPY --from=builder /workspace/dist ./dist                                                                                                         0.0s
 => exporting to image                                                                                                                                              5.3s
 => => exporting layers                                                                                                                                             5.3s
 => => writing image sha256:a1118da8554d5a9fa825ccd18b7caec2561024fd2c04ab51cba4c9a52b734459                                                                        0.0s
 => => naming to docker.io/library/executor
```

- When we execute the `docker run` command, we need to ensure that the `executor` service is started.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker run executor
[Nest] 1  - 03/16/2025, 11:42:04 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/16/2025, 11:42:04 AM     LOG [InstanceLoader] AppModule dependencies initialized +8ms
[Nest] 1  - 03/16/2025, 11:42:04 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 1  - 03/16/2025, 11:42:04 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/16/2025, 11:42:04 AM   ERROR [ExceptionHandler] TypeError: Configuration key "PULSAR_SERVICE_URL" does not exist
    at ConfigService.getOrThrow (/app/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at new PulsarClient (/app/dist/libs/pulsar/main.js:67:44)
    at Injector.instantiateClass (/app/node_modules/@nestjs/core/injector/injector.js:373:19)
    at callback (/app/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/app/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/app/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/app/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async Injector.lookupComponentInImports (/app/node_modules/@nestjs/core/injector/injector.js:297:17)
    at async Injector.lookupComponentInParentModules (/app/node_modules/@nestjs/core/injector/injector.js:260:33)
    at async Injector.resolveComponentInstance (/app/node_modules/@nestjs/core/injector/injector.js:215:33)
```

##### 9.4.4. Adding the `Dockerfile` document to the `jobs` app

> apps/jobs/Dockerfile

```dockerfile
FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/jobs ./apps/jobs
COPY libs/graphql ./libs/graphql
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar
COPY libs/prisma ./libs/prisma

RUN npm install --legacy-peer-deps

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build jobs

FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/package-lock.json ./
COPY --from=builder /workspace/apps/jobs/package.json ./apps/jobs/package.json
# COPY --from=builder /workspace/apps/jobs/prisma ./apps/jobs/prisma
COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json
COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json

ENV NODE_ENV=production

RUN npm ci --legacy-peer-deps

# COPY --from=builder /workspace/node_modules/@prisma-clients/jobs/ ./node_modules/@prisma-clients/jobs/
COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/jobs/main"]
```

- We need to ensure that the Docker build process is working.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker build -t jobs -f apps/jobs/Dockerfile .
[+] Building 76.4s (35/35) FINISHED                                                                                                                       docker:default
 => [internal] load build definition from Dockerfile                                                                                                                0.0s
 => => transferring dockerfile: 1.51kB                                                                                                                              0.0s
 => [internal] load metadata for docker.io/library/node:22-slim                                                                                                     0.5s
 => [internal] load .dockerignore                                                                                                                                   0.0s
 => => transferring context: 2B                                                                                                                                     0.0s
 => [internal] load build context                                                                                                                                   0.5s
 => => transferring context: 6.92kB                                                                                                                                 0.4s
 => CACHED [builder  1/19] FROM docker.io/library/node:22-slim@sha256:6bba748696297138f802735367bc78fea5cfe3b85019c74d2a930bc6c6b2fac4                              0.0s
 => [runner  2/12] RUN apt-get update && apt-get install -y openssl                                                                                                 4.5s
 => CACHED [builder  2/19] WORKDIR /workspace                                                                                                                       0.0s
 => CACHED [builder  3/19] RUN apt-get update && apt-get install -y openssl                                                                                         0.0s
 => CACHED [builder  4/19] COPY package*.json ./                                                                                                                    0.0s
 => CACHED [builder  5/19] COPY nx.json ./                                                                                                                          0.0s
 => CACHED [builder  6/19] COPY tsconfig*.json ./                                                                                                                   0.0s
 => CACHED [builder  7/19] COPY jest.config.ts ./                                                                                                                   0.0s
 => CACHED [builder  8/19] COPY jest.preset.js ./                                                                                                                   0.0s
 => CACHED [builder  9/19] COPY eslint.config.mjs ./                                                                                                                0.0s
 => CACHED [builder 10/19] COPY webpack.*.config.js ./                                                                                                              0.0s
 => [builder 11/19] COPY apps/jobs ./apps/jobs                                                                                                                      0.0s
 => [builder 12/19] COPY libs/graphql ./libs/graphql                                                                                                                0.0s
 => [builder 13/19] COPY libs/grpc ./libs/grpc                                                                                                                      0.0s
 => [builder 14/19] COPY libs/nestjs ./libs/nestjs                                                                                                                  0.0s
 => [builder 15/19] COPY libs/pulsar ./libs/pulsar                                                                                                                  0.0s
 => [builder 16/19] COPY libs/prisma ./libs/prisma                                                                                                                  0.0s
 => [builder 17/19] RUN npm install --legacy-peer-deps                                                                                                             38.1s
 => [runner  3/12] WORKDIR /app                                                                                                                                     0.0s
 => [builder 18/19] RUN apt-get update && apt-get install -y protobuf-compiler                                                                                      9.6s
 => [builder 19/19] RUN npx nx build jobs                                                                                                                          17.0s
 => [runner  4/12] COPY --from=builder /workspace/package.json ./                                                                                                   0.0s
 => [runner  5/12] COPY --from=builder /workspace/package-lock.json ./                                                                                              0.0s
 => [runner  6/12] COPY --from=builder /workspace/apps/jobs/package.json ./apps/jobs/package.json                                                                   0.0s
 => [runner  7/12] COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json                                                             0.0s
 => [runner  8/12] COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json                                                                   0.0s
 => [runner  9/12] COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json                                                               0.0s
 => [runner 10/12] COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json                                                               0.0s
 => [runner 11/12] RUN npm ci --legacy-peer-deps                                                                                                                    7.2s
 => [runner 12/12] COPY --from=builder /workspace/dist ./dist                                                                                                       0.0s
 => exporting to image                                                                                                                                              2.2s
 => => exporting layers                                                                                                                                             2.2s
 => => writing image sha256:217be0ceb5c6da4ff986c7a5bc26e7dc6ca23ad5eb20c0ac044cab0570c6105e                                                                        0.0s
 => => naming to docker.io/library/jobs
```

- When we execute the `docker run` command, we need to ensure that the `jobs` service is started.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker run jobs
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [InstanceLoader] AppModule dependencies initialized +15ms
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [InstanceLoader] ClientsModule dependencies initialized +1ms
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/16/2025, 11:25:02 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/16/2025, 11:25:02 AM   ERROR [ExceptionHandler] TypeError: Configuration key "PULSAR_SERVICE_URL" does not exist
    at ConfigService.getOrThrow (/app/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at new PulsarClient (/app/dist/libs/pulsar/main.js:67:44)
    at Injector.instantiateClass (/app/node_modules/@nestjs/core/injector/injector.js:373:19)
    at callback (/app/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/app/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/app/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/app/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async /app/node_modules/@nestjs/core/injector/instance-loader.js:56:13
    at async Promise.all (index 3)
    at async InstanceLoader.createInstancesOfProviders (/app/node_modules/@nestjs/core/injector/instance-loader.js:55:9)
```

#### 9.5. Installing and configuring the `webpack-merge` npm package to the main `package.json` file

- This library is used to merge the `webpack` configurations of the different microservices.

##### 9.5.1. Installing the `webpack-merge` npm package

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i webpack-merge --legacy-peer-deps

removed 1 package, and audited 1366 packages in 2s

226 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

##### 9.5.2. Adding the `webpack.lib.config.js` document to the root of the project

- We need to add the `webpack.lib.config.js` document to the root of the project.

> webpack.lib.config.js

```javascript
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  output: {
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      outputFileName: 'index.ts',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
      optimization: false,
      outputHashing: 'none',
    }),
  ],
};
```

##### 9.5.3. Adding the `webpack.app.config.js` document to the root of the project

- We need to add the `webpack.app.config.js` document to the root of the project.

> webpack.app.config.js

```javascript
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
    }),
  ],
};
```

##### 9.5.4. Updating the `webpack.config.js` document to the `apps` folders

- We need to update the `webpack.config.js` document to the `apps` folders.

##### 9.5.4.1. Updating the `webpack.config.js` document to the `apps/auth` folder

> apps/auth/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.app.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/apps/auth'),
  },
});
```

##### 9.5.4.2. Updating the `webpack.config.js` document to the `apps/executor` folder

> apps/executor/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.app.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/apps/executor'),
  },
});
```

##### 9.5.4.3. Updating the `webpack.config.js` document to the `apps/jobs` folder

> apps/jobs/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.app.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/apps/jobs'),
  },
});
```

##### 9.5.4.4. Updating the `webpack.config.js` document to the `libs` folders

- We need to update the `webpack.config.js` document to the `libs` folders.

##### 9.5.4.4.1. Updating the `webpack.config.js` document to the `libs/graphql` folder

> libs/graphql/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.lib.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/libs/grpc'),
  },
});
```

##### 9.5.4.4.2. Updating the `webpack.config.js` document to the `libs/grpc` folder

> libs/grpc/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.lib.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/libs/grpc'),
  },
});
```

##### 9.5.4.4.3. Updating the `webpack.config.js` document to the `libs/nestjs` folder

> libs/nestjs/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.lib.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/libs/nestjs'),
  },
});
```

##### 9.5.4.4.4. Updating the `webpack.config.js` document to the `libs/prisma` folder

> libs/prisma/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.lib.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/libs/prisma'),
  },
});
```

##### 9.5.4.4.5. Updating the `webpack.config.js` document to the `libs/pulsar` folder

> libs/pulsar/webpack.config.js

```javascript
const { join } = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('../../webpack.lib.config');

module.exports = merge(commonConfig, {
  output: {
    path: join(__dirname, '../../dist/libs/pulsar'),
  },
});
```

##### 9.5.4.5 We need to ensure that `serve:all` script is working correctly

- We need to ensure that the `serve:all` script is working correctly.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm run serve:all
```

juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm run serve:all

> @jobber/source@0.0.0 serve:all
> nx run-many -t serve -p auth jobs executor

NX Running target serve for 3 projects and 9 tasks they depend on:

- auth
- jobs
- executor

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto [existing outputs match the cache, left as is]

> npx protoc --plugin=protoc-gen-ts_proto=../../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/lib/types/proto ./src/lib/proto/\*.proto --ts_proto_opt=nestJs=true --ts_proto_opt=exportCommonSymbols=false

> nx run nestjs:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 1.06 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 1.06 KiB [entry] [rendered]
webpack compiled successfully (fb235d4b37a71175)

> nx run pulsar:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 5.63 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 5.63 KiB [entry] [rendered]
webpack compiled successfully (c7530fb194af6872)

> nx run grpc:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 1.54 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 1.54 KiB [entry] [rendered]
webpack compiled successfully (bb7a74b1a2cd451c)

> nx run auth:generate-prisma

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 55ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize

> nx run executor:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 3.66 KiB [entry] [rendered]
webpack compiled successfully (01e4a286f9b8c88a)

> nx run executor:serve:development

> nx run graphql:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 3.29 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 3.29 KiB [entry] [rendered]
webpack compiled successfully (bd7006f1656ebe9c)

NX Running target build for project executor and 2 tasks it depends on:

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run nestjs:build [existing outputs match the cache, left as is]

> nx run pulsar:build [existing outputs match the cache, left as is]

> nx run executor:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 3.66 KiB [entry] [rendered]
webpack compiled successfully (01e4a286f9b8c88a)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target build for project executor and 2 tasks it depends on

Nx read the output from the cache instead of running the command for 2 out of 3 tasks.

Debugger listening on ws://localhost:9229/791d4aca-9ab1-49b6-9079-ce42a29188e2
For help, see: https://nodejs.org/en/docs/inspector

> nx run jobs:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 13.1 KiB [entry] [rendered]
webpack compiled successfully (ab0dbeeab7261f92)

> nx run jobs:serve:development

[Nest] 297293 - 16/03/2025, 12:29:58 LOG [NestFactory] Starting Nest application...
[Nest] 297293 - 16/03/2025, 12:29:58 LOG [InstanceLoader] AppModule dependencies initialized +10ms
[Nest] 297293 - 16/03/2025, 12:29:58 LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 297293 - 16/03/2025, 12:29:58 LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 297293 - 16/03/2025, 12:29:58 LOG [InstanceLoader] PulsarModule dependencies initialized +1ms
[Nest] 297293 - 16/03/2025, 12:29:58 LOG [InstanceLoader] JobsModule dependencies initialized +1ms

> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 24.1 KiB [entry] [rendered]
webpack compiled successfully (af8bc1fff83c0492)

> nx run auth:serve:development

[Nest] 297293 - 16/03/2025, 12:29:58 LOG [NestApplication] Nest application successfully started +243ms
[Nest] 297293 - 16/03/2025, 12:29:58 LOG 🚀 Application is running on: http://localhost:3002/api

NX Running target build for project jobs and 5 tasks it depends on:

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto [existing outputs match the cache, left as is]

> nx run nestjs:build [existing outputs match the cache, left as is]

> nx run pulsar:build [existing outputs match the cache, left as is]

> nx run grpc:build [existing outputs match the cache, left as is]

> nx run graphql:build [existing outputs match the cache, left as is]

> nx run jobs:build:development

> webpack-cli build node-env=development

NX Running target build for project auth and 5 tasks it depends on:

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto [existing outputs match the cache, left as is]

> nx run auth:generate-prisma [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 55ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize

> nx run nestjs:build [existing outputs match the cache, left as is]

> nx run grpc:build [existing outputs match the cache, left as is]

> nx run graphql:build [existing outputs match the cache, left as is]

> nx run auth:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 24.1 KiB [entry] [rendered]
webpack compiled successfully (af8bc1fff83c0492)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target build for project auth and 5 tasks it depends on

Nx read the output from the cache instead of running the command for 5 out of 6 tasks.

chunk (runtime: main) main.js (main) 13.1 KiB [entry] [rendered]
webpack compiled successfully (ab0dbeeab7261f92)
Starting inspector on localhost:9229 failed: address already in use

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target build for project jobs and 5 tasks it depends on

Nx read the output from the cache instead of running the command for 5 out of 6 tasks.

Starting inspector on localhost:9229 failed: address already in use

[Nest] 297916 - 16/03/2025, 12:30:04 LOG [NestFactory] Starting Nest application...
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] AppModule dependencies initialized +17ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] UsersModule dependencies initialized +3ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] JwtModule dependencies initialized +0ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +0ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [InstanceLoader] AuthModule dependencies initialized +1ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [RoutesResolver] AuthController {/api}: +13ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [NestFactory] Starting Nest application...
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [GraphQLModule] Mapped {/graphql, POST} route +114ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [NestApplication] Nest application successfully started +2ms
[Nest] 297916 - 16/03/2025, 12:30:04 LOG 🚀 Application is running on: http://localhost:3000/api
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] AppModule dependencies initialized +19ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] DiscoveryModule dependencies initialized +1ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] PulsarModule dependencies initialized +1ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] GraphQLSchemaBuilderModule dependencies initialized +1ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] JobsModule dependencies initialized +1ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [InstanceLoader] GraphQLModule dependencies initialized +1ms
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
[Nest] 297916 - 16/03/2025, 12:30:04 LOG [NestMicroservice] Nest microservice successfully started +79ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [GraphQLModule] Mapped {/graphql, POST} route +79ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG [NestApplication] Nest application successfully started +2ms
[Nest] 297965 - 16/03/2025, 12:30:04 LOG 🚀 Application is running on: http://localhost:3001/api

```

```
