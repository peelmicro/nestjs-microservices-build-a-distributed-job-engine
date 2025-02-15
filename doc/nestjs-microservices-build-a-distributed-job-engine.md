# NestJS Microservices: Build a Distributed Job Engine Udemy Course

- In this document we are going to explain the main concepts of the [NestJS Microservices: Build a Distributed Job Engine](https://www.udemy.com/course/nestjs-microservices-build-a-distributed-job-engine) course.

## 1. Setting up the solution

- We are going to create an [Nx](https://nx.dev) monorepo to manage the solution.

### 1.1. Create the Nx monorepo

#### 1.1.1. Ensure we have the latest LTS version of Node.js

- We need to ensure we are using the latest `lts` version of Node.js by executing `nvm use --lts`

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices$ nvm use --lts
Now using node v22.13.0 (npm v10.9.2)
```

#### 1.1.2. Create the monorepo

- We are going to use `npx create-nx-workspace` command to create the monorepo
- We are going to use the following options:
  - `--preset` with the value `nest` as it is going to be a NestJS project
  - `--name` with the value `nestjs-microservices-build-a-distributed-job-engine` as the name of the monorepo
  - `--appName` with the value `auth` as the name of the first NestJS microservice

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices$ npx create-nx-workspace@latest --preset=nest --name=nestjs-microservices-build-a-distributed-job-engine --appName=auth
Need to install the following packages:
create-nx-workspace@20.4.4
Ok to proceed? (y) y


 NX   Let's create a new workspace [https://nx.dev/getting-started/intro]

✔ Would you like to generate a Dockerfile? [https://docs.docker.com/] · Yes
✔ Which CI provider would you like to use? · github

 NX   Creating your v20.4.4 workspace.

✔ Installing dependencies with npm
⠏ Creating your workspace in nestjs-microservices-build-a-distributed-job-engine ...
```

- When the command finishes, we will have the following message:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices$ npx create-nx-workspace@latest --preset=nest --name=nestjs-microservices-build-a-distributed-job-engine --appName=auth
Need to install the following packages:
create-nx-workspace@20.4.4
Ok to proceed? (y) y


 NX   Let's create a new workspace [https://nx.dev/getting-started/intro]

✔ Would you like to generate a Dockerfile? [https://docs.docker.com/] · Yes
✔ Which CI provider would you like to use? · github

 NX   Creating your v20.4.4 workspace.

✔ Installing dependencies with npm
✔ Successfully created the workspace: nestjs-microservices-build-a-distributed-job-engine.
✔ Nx Cloud has been set up successfully
✔ CI workflow has been generated successfully

 NX   Your CI setup is almost complete.

Finish it by visiting: https://cloud.nx.app/connect/dRil3lZ5zK

 NX   Welcome to the Nx community! 👋

🌟 Star Nx on GitHub: https://github.com/nrwl/nx
📢 Stay up to date on X: https://x.com/nxdevtools
💬 Discuss Nx on Discord: https://go.nx.dev/community
```

#### 1.1.3. Install `nx` globally

- We are going to install `nx` globally by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices$ npm install -g nx

added 122 packages in 2s

27 packages are looking for funding
  run `npm fund` for details
```

- We can check the version of `nx` by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices$ nx --version
Nx Version:
- Local: Not found
- Global: v20.4.4
```

#### 1.1.4. Test if the monorepo can be built

- We are going to test if the monorepo can be built by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices$ nx build auth
NX Failed to process project graph.
An error occurred while processing files for the @nx/eslint/plugin plugin (Defined at nx.json#plugins[1])
```

- If we get an error, we need should try to fix it by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx reset

 NX   Resetting the Nx cache and stopping the daemon.



 NX   Cleaning up temporary files created by Nx Cloud.
```

- If we execute the command again, we should get the following message:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx build auth

> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 2.71 KiB [entry] [rendered]
webpack compiled successfully (efad3b78154bea4f)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth (3s)

View logs and investigate cache misses at https://nx.app/runs/j1lbmRQh7q
```

#### 1.1.5. Ensure the project can be linted

- We can do the same with `lint` target:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx lint auth

> nx run auth:lint

> eslint .


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for project auth (4s)

View logs and investigate cache misses at https://nx.app/runs/tF9h2UbtGT
```

#### 1.1.6. Ensure the project can be tested

- We can run our tests by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx test auth

> nx run auth:test

> jest --passWithNoTests=true

 PASS   auth  src/app/app.service.spec.ts
 PASS   auth  src/app/app.controller.spec.ts

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.313 s
Ran all test suites.

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for project auth (4s)

View logs and investigate cache misses at https://nx.app/runs/fOc9UwWFoN
```

- We can see that the tests are passing.

#### 1.1.7. Ensure the project can be started

- We can start the project by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve auth

 NX   Running target serve for project auth and 1 task it depends on:

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:build  [existing outputs match the cache, left as is]

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 2.71 KiB [entry] [rendered]
webpack compiled successfully (efad3b78154bea4f)

> nx run auth:serve:development


> nx run auth:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 2.71 KiB [entry] [rendered]
webpack compiled successfully (efad3b78154bea4f)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth (3s)

Debugger listening on ws://localhost:9229/e2689957-3c65-4849-b45b-40cb8f34c42f
For help, see: https://nodejs.org/en/docs/inspector

[Nest] 119106  - 15/02/2025, 10:40:24     LOG [NestFactory] Starting Nest application...
[Nest] 119106  - 15/02/2025, 10:40:24     LOG [InstanceLoader] AppModule dependencies initialized +7ms
[Nest] 119106  - 15/02/2025, 10:40:24     LOG [RoutesResolver] AppController {/api}: +5ms
[Nest] 119106  - 15/02/2025, 10:40:24     LOG [RouterExplorer] Mapped {/api, GET} route +2ms
[Nest] 119106  - 15/02/2025, 10:40:24     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 119106  - 15/02/2025, 10:40:24     LOG 🚀 Application is running on: http://localhost:3000/api
```

- We can see that the project is running on port 3000.

## 1.2 GitHub Actions

- When creating the monorepo, we selected GitHub Actions as the CI provider.
- We can see the workflow file in the `.github/workflows` folder.
- As we are mot going to use Nx Cloud, we need to ensure to comment out the Nx Cloud related commands. By default, the Nx Cloud commands are commented out.

> .github/workflows/ci.yml

```yml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  actions: read
  contents: read

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # This enables task distribution via Nx Cloud
      # Run this command as early as possible, before dependencies are installed
      # Learn more at https://nx.dev/ci/reference/nx-cloud-cli#npx-nxcloud-startcirun
      # Uncomment this line to enable task distribution
      # - run: npx nx-cloud start-ci-run --distribute-on="3 linux-medium-js" --stop-agents-after="build"

      # Cache node_modules
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci --legacy-peer-deps
      - uses: nrwl/nx-set-shas@v4

      # Prepend any command with "nx-cloud record --" to record its logs to Nx Cloud
      # - run: npx nx-cloud record -- echo Hello World
      # Nx Affected runs only tasks affected by the changes in this PR/commit. Learn more: https://nx.dev/ci/features/affected
      - run: npx nx affected -t lint test build
```

### 1.2.1. Creating the github repository

- We are going to create the github repository by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ 
git remote add origin https://github.com/peelmicro/nestjs-microservices-build-a-distributed-job-engine.git
git branch -M main
git push -u origin main
```

- We can see the repository in the following URL: https://github.com/peelmicro/nestjs-microservices-build-a-distributed-job-engine

### 1.2.2. Running the workflow

