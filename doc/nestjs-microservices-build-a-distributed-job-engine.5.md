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
