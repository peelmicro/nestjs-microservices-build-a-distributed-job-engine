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

### 1.2.1. Creating the first commit

- We are going to create the first commit and push it to the remote repository.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json
        modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        doc/

no changes added to commit (use "git add" and/or "git commit -a")
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git add .
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git commit -m "First commit"
[main 4388d95] First commit
 3 files changed, 353 insertions(+), 21 deletions(-)
 create mode 100644 doc/nestjs-microservices-build-a-distributed-job-engine.md
```

### 1.2.2. Creating the github repository

- We can go to the GitHub repository and create the `nestjs-microservices-build-a-distributed-job-engine` repository.

![Create repository](image001.png)

![Repository has been created](image002.png)

### 1.2.3. Linking and committing the local repository to the github repository

- We are going to link and commit the local repository to the github repository by executing the following commands:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ git remote add origin https://github.com/peelmicro/nestjs-microservices-build-a-distributed-job-engine.git
git branch -M main
git push -u origin main
error: remote origin already exists.
Enumerating objects: 56, done.
Counting objects: 100% (56/56), done.
Delta compression using up to 16 threads
Compressing objects: 100% (49/49), done.
Writing objects: 100% (56/56), 137.13 KiB | 10.55 MiB/s, done.
```

- We can see the repository in the following URL: <https://github.com/peelmicro/nestjs-microservices-build-a-distributed-job-engine>

![Repository has been pushed](image003.png)

### 1.2.4. We can see the actions defined in the `.github/workflows/ci.yml` file has been triggered

![Actions have been triggered](image004.png)

![Successfully executed](image005.png)

### 1.2.5. Create a Docker Compose file to run `PostgreSQL` and the microservices

- We are going to create a `docker-compose.yml` file to run `PostgreSQL` and the microservices.
- This is going to be the initial version of the `docker-compose.yml` file.

> docker-compose.yaml

```yaml
services:
  postgres:
    image: postgres
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: example
```

- We can start the `PostgreSQL` container by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker compose up
[+] Running 15/15
 ✔ postgres Pulled                                                                                                                                                           15.6s 
   ✔ c29f5b76f736 Already exists                                                                                                                                              0.0s 
   ✔ 3d0b32ee6c43 Pull complete                                                                                                                                               0.6s 
   ✔ edea13d45b54 Pull complete                                                                                                                                               1.1s 
   ✔ 91f23f0b9c1b Pull complete                                                                                                                                               1.2s 
   ✔ 5ea2d101ccee Pull complete                                                                                                                                               2.3s 
   ✔ 94f0cbfc26b6 Pull complete                                                                                                                                               2.4s 
   ✔ 6565e7451acf Pull complete                                                                                                                                               2.4s 
   ✔ 34047ddafe46 Pull complete                                                                                                                                               2.4s 
   ✔ 3e0e9cc584ce Pull complete                                                                                                                                              13.4s 
   ✔ 5d821824937c Pull complete                                                                                                                                              13.5s 
   ✔ f69cbdd712da Pull complete                                                                                                                                              13.5s 
   ✔ f62596e0b037 Pull complete                                                                                                                                              13.5s 
   ✔ 63b9b48ec2a9 Pull complete                                                                                                                                              13.5s 
   ✔ 1c47da8f7970 Pull complete                                                                                                                                              13.5s 
[+] Running 2/2
 ✔ Network nestjs-microservices-build-a-distributed-job-engine_default       Created                                                                                          0.1s 
 ✔ Container nestjs-microservices-build-a-distributed-job-engine-postgres-1  Created                                                                                          0.3s 
Attaching to postgres-1
Gracefully stopping... (press Ctrl+C again to force)
Error response from daemon: driver failed programming external connectivity on endpoint nestjs-microservices-build-a-distributed-job-engine-postgres-1 (e030981d9d0e44e56d04592f700d46e288601f606d35722d922c2d5d6cfe1a77): failed to bind port 0.0.0.0:5432/tcp: Error starting userland proxy: listen tcp4 0.0.0.0:5432: bind: address already in use
```

- It seems as if the port is already in use. Let's check if the port is already in use by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ sudo lsof -i :5432
[sudo] password for juanpabloperez: 
COMMAND   PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
postgres 2011 postgres    3u  IPv4  28797      0t0  TCP localhost:postgresql (LISTEN)
```

- We can see that the port is already in use by the `postgres` command.
- It seems that `postgres` is executed by `ubuntu` when the system starts.
- Let's see how it is executed by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ sudo systemctl status postgresql
● postgresql.service - PostgreSQL RDBMS
     Loaded: loaded (/usr/lib/systemd/system/postgresql.service; enabled; preset: enabled)
     Active: active (exited) since Sat 2025-02-15 03:49:21 GMT; 9h ago
   Main PID: 2499 (code=exited, status=0/SUCCESS)
        CPU: 1ms

Feb 15 03:49:21 jpp-PROX15-AMD systemd[1]: Starting postgresql.service - PostgreSQL RDBMS...
Feb 15 03:49:21 jpp-PROX15-AMD systemd[1]: Finished postgresql.service - PostgreSQL RDBMS.
```

- We can stop the `postgres` command and disable it by executing the following commands:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ sudo systemctl stop postgresql
sudo systemctl disable postgresql
Synchronizing state of postgresql.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install disable postgresql
Removed "/etc/systemd/system/multi-user.target.wants/postgresql.service".
```

- We can check the status of the `postgresql` service by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ sudo systemctl status postgresql
○ postgresql.service - PostgreSQL RDBMS
     Loaded: loaded (/usr/lib/systemd/system/postgresql.service; disabled; preset: enabled)
     Active: inactive (dead)

Feb 15 03:49:21 jpp-PROX15-AMD systemd[1]: Starting postgresql.service - PostgreSQL RDBMS...
Feb 15 03:49:21 jpp-PROX15-AMD systemd[1]: Finished postgresql.service - PostgreSQL RDBMS.
Feb 15 12:51:01 jpp-PROX15-AMD systemd[1]: postgresql.service: Deactivated successfully.
Feb 15 12:51:01 jpp-PROX15-AMD systemd[1]: Stopped postgresql.service - PostgreSQL RDBMS.
```

- We can see if the `docker-compose.yml` file is working by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker compose up
Attaching to postgres-1
postgres-1  | The files belonging to this database system will be owned by user "postgres".
postgres-1  | This user must also own the server process.
postgres-1  | 
postgres-1  | The database cluster will be initialized with locale "en_US.utf8".
postgres-1  | The default database encoding has accordingly been set to "UTF8".
postgres-1  | The default text search configuration will be set to "english".
postgres-1  | 
postgres-1  | Data page checksums are disabled.
postgres-1  | 
postgres-1  | fixing permissions on existing directory /var/lib/postgresql/data ... ok
postgres-1  | creating subdirectories ... ok
postgres-1  | selecting dynamic shared memory implementation ... posix
postgres-1  | selecting default "max_connections" ... 100
postgres-1  | selecting default "shared_buffers" ... 128MB
postgres-1  | selecting default time zone ... Etc/UTC
postgres-1  | creating configuration files ... ok
postgres-1  | running bootstrap script ... ok
postgres-1  | performing post-bootstrap initialization ... ok
postgres-1  | syncing data to disk ... ok
postgres-1  | 
postgres-1  | 
postgres-1  | Success. You can now start the database server using:
postgres-1  | 
postgres-1  |     pg_ctl -D /var/lib/postgresql/data -l logfile start
postgres-1  | 
postgres-1  | initdb: warning: enabling "trust" authentication for local connections
postgres-1  | initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
postgres-1  | waiting for server to start....2025-02-15 12:55:55.649 UTC [48] LOG:  starting PostgreSQL 17.3 (Debian 17.3-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
postgres-1  | 2025-02-15 12:55:55.650 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres-1  | 2025-02-15 12:55:55.654 UTC [51] LOG:  database system was shut down at 2025-02-15 12:55:55 UTC
postgres-1  | 2025-02-15 12:55:55.659 UTC [48] LOG:  database system is ready to accept connections
postgres-1  |  done
postgres-1  | server started
postgres-1  | 
postgres-1  | /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
postgres-1  | 
postgres-1  | waiting for server to shut down....2025-02-15 12:55:55.785 UTC [48] LOG:  received fast shutdown request
postgres-1  | 2025-02-15 12:55:55.786 UTC [48] LOG:  aborting any active transactions
postgres-1  | 2025-02-15 12:55:55.788 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
postgres-1  | 2025-02-15 12:55:55.789 UTC [49] LOG:  shutting down
postgres-1  | 2025-02-15 12:55:55.790 UTC [49] LOG:  checkpoint starting: shutdown immediate
postgres-1  | 2025-02-15 12:55:55.795 UTC [49] LOG:  checkpoint complete: wrote 3 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.002 s, sync=0.001 s, total=0.006 s; sync files=2, longest=0.001 s, average=0.001 s; distance=0 kB, estimate=0 kB; lsn=0/14E4FA0, redo lsn=0/14E4FA0
postgres-1  | 2025-02-15 12:55:55.804 UTC [48] LOG:  database system is shut down
postgres-1  |  done
postgres-1  | server stopped
postgres-1  | 
postgres-1  | PostgreSQL init process complete; ready for start up.
postgres-1  | 
postgres-1  | 2025-02-15 12:55:55.932 UTC [1] LOG:  starting PostgreSQL 17.3 (Debian 17.3-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
postgres-1  | 2025-02-15 12:55:55.933 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgres-1  | 2025-02-15 12:55:55.933 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgres-1  | 2025-02-15 12:55:55.934 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres-1  | 2025-02-15 12:55:55.940 UTC [62] LOG:  database system was shut down at 2025-02-15 12:55:55 UTC
postgres-1  | 2025-02-15 12:55:55.944 UTC [1] LOG:  database system is ready to accept connections
```

- It seems that the `docker-compose.yml` file is working.

## 2. Setting up the Users microservice

### 2.1. Creating an `.env` file where we are going to define the database URL

- We are going to create an `.env` file where we are going to define the database URL.

> .env

```text
AUTH_DATABASE_URL=postgresql://postgres:example@localhost:5432/auth?schema=public
```

### 2.2. Installing Prisma ORM

#### 2.2.1. Install Prisma ORM

- We are going to install the Prisma ORM by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i prisma --save-dev

added 6 packages, and audited 1078 packages in 6s

186 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 2.2.2. Install Prisma Client

- We are going to install the Prisma Client by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i @prisma/client --save

added 1 package, and audited 1079 packages in 5s

186 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 2.3 Creating the Prisma schema

- Create a prisma folder in the `auth` microservice

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ mkdir apps/auth/prisma
```

- Create a `schema.prisma` file in the `prisma` folder
- We need to define: 
  - `generator`: This is the generator for the Prisma client. It is going to be the Prisma client for the `auth` microservice.
  - `datasource`: This is the datasource for the Prisma client. It is going to be the PostgreSQL database.
  - `model`: This is the model for the Prisma client. It is going to have the `User` model.

> apps/auth/prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../../node_modules/@prisma-clients/auth"
}

datasource db {
  provider = "postgresql"
  url      = env("AUTH_DATABASE_URL")
}

model User {
  id        Int      @default(autoincrement()) @id
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2.4. Generating the Prisma types

#### 2.4.1. Modifying the `project.json` file to include the generation of the `prisma` types

- We need to modify the `project.json` file for the `auth` microservice to include the generation of the `prisma` types.

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
      }
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "auth:build",
        "runBuildTargetDependencies": false
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
      "options": {
        "passWithNoTests": true
      }
    },
+   "generate-types": {
+     "command": "prisma generate",
+     "options": {
+       "cwd": "apps/auth"
+     }
+   }
  }
}
```

#### 2.4.2. Generating the Prisma types

- We need to generate the Prisma types by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx generate-types auth

> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 67ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22


—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate-types for project auth (1s)

View logs and investigate cache misses at https://nx.app/runs/JVNnDcWuQ9
```

- We can see the types have been generated in the `node_modules/@prisma-clients/auth` folder.

```bash
engine$ ls -s node_modules/@prisma-clients/auth
total 16036
    4 default.d.ts         76 index.d.ts                                        4 schema.prisma
    4 default.js            8 index.js                                          4 wasm.d.ts
    4 edge.d.ts         15900 libquery_engine-debian-openssl-3.0.x.so.node      8 wasm.js
    8 edge.js               4 package.json
    8 index-browser.js      4 runtime
```

#### 2.4.3. Creating the "migration" process to generate the migrations

- We need to modify the `project.json` file for the `auth` microservice to include the generation of the migrations.

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
      }
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "auth:build",
        "runBuildTargetDependencies": false
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
      "options": {
        "passWithNoTests": true
      }
    },
    "generate-types": {
      "command": "prisma generate",
      "options": {
        "cwd": "apps/auth"
      }
    },
+   "migrate-prisma": {
+     "command": "prisma migrate dev",
+     "options": {
+       "cwd": "apps/auth"
+     }
    }
  }
}
```

- We need to generate the migrations by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx migrate-prisma auth

> nx run auth:migrate-prisma

> prisma migrate dev

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "auth", schema "public" at "localhost:5432"

✔ Enter a name for the new migration: … users
Applying migration `20250216044013_users`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250216044013_users/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 65ms



————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target migrate-prisma for project auth (47s)

View logs and investigate cache misses at https://nx.app/runs/Y4WefIBGHf
```

#### 2.4.4. Fixing the issue with the migrations and not having the database created

- Even though the command `nx run auth:migrate-prisma auth` is working is not throwing any error, in fact, it didn't work because the database was not previously created.
- We are going to modify the `docker-compose.yml` file to ensure the needed databases are created before running the migrations.


##### 2.4.4.1. Creation of the `create-multiple-dbs.sh` script

- We are going to create the `create-multiple-dbs.sh` script to create the needed databases.

> bash/create-multiple-dbs.sh

```bash
#!/bin/bash

set -e
set -u

function create_database() {
    local database=$1
    echo "Checking database '$database'"
    if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw $database; then
        echo "Database '$database' already exists"
    else
        echo "Creating database '$database'"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
            CREATE DATABASE $database;
EOSQL
    fi
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_database $db
    done
    echo "Multiple databases setup completed"
fi
```

- We need to create the `create-multiple-dbs.sh` script in the `/docker-entrypoint-initdb.d` folder.
- The `docker-entrypoint-initdb.d` is a special directory in PostgreSQL Docker containers where initialization scripts are automatically executed when the container starts for the first time.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ ls docker-entrypoint-initdb.d/
create-multiple-dbs.sh
```

- We need to ensure the `create-multiple-dbs.sh` script is executable by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ chmod +x docker-entrypoint-initdb.d/create-multiple-dbs.sh
```

##### 2.4.4.2. Modifying the `docker-compose.yml` file to create the databases

- We need to modify the `docker-compose.yml` file to create the databases before running the migrations.

> docker-compose.yml

```yaml
services:
  postgres:
    image: postgres
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: example
      POSTGRES_MULTIPLE_DATABASES: auth,merchant,transactions
    volumes:
      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
```

The volume mapping:

```yaml
volumes:
  - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
```

means:

- Left side (./docker-entrypoint-initdb.d): path on your host machine
- Right side (/docker-entrypoint-initdb.d): path inside the container
- Any scripts (.sh, .sql) in this directory will run automatically when the container is first created. They run in alphabetical order.

##### 2.4.4.3. Restarting the docker compose

- We need to restart the docker compose by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker compose down
[+] Running 2/2
 ✔ Container nestjs-microservices-build-a-distributed-job-engine-postgres-1  Removed          0.2s 
 ✔ Network nestjs-microservices-build-a-distributed-job-engine_default       Removed          0.2s 
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker compose up
[+] Running 2/1
 ✔ Network nestjs-microservices-build-a-distributed-job-engine_default       Created          0.1s 
 ✔ Container nestjs-microservices-build-a-distributed-job-engine-postgres-1  Created          0.0s 
Attaching to postgres-1
postgres-1  | The files belonging to this database system will be owned by user "postgres".
postgres-1  | This user must also own the server process.
postgres-1  | 
postgres-1  | The database cluster will be initialized with locale "en_US.utf8".
postgres-1  | The default database encoding has accordingly been set to "UTF8".
postgres-1  | The default text search configuration will be set to "english".
postgres-1  | 
postgres-1  | Data page checksums are disabled.
postgres-1  | 
postgres-1  | fixing permissions on existing directory /var/lib/postgresql/data ... ok
postgres-1  | creating subdirectories ... ok
postgres-1  | selecting dynamic shared memory implementation ... posix
postgres-1  | selecting default "max_connections" ... 100
postgres-1  | selecting default "shared_buffers" ... 128MB
postgres-1  | selecting default time zone ... Etc/UTC
postgres-1  | creating configuration files ... ok
postgres-1  | running bootstrap script ... ok
postgres-1  | performing post-bootstrap initialization ... ok
postgres-1  | initdb: warning: enabling "trust" authentication for local connections
postgres-1  | initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
postgres-1  | syncing data to disk ... ok
postgres-1  | 
postgres-1  | 
postgres-1  | Success. You can now start the database server using:
postgres-1  | 
postgres-1  |     pg_ctl -D /var/lib/postgresql/data -l logfile start
postgres-1  | 
postgres-1  | waiting for server to start....2025-02-16 05:51:26.990 UTC [48] LOG:  starting PostgreSQL 17.3 (Debian 17.3-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
postgres-1  | 2025-02-16 05:51:26.991 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres-1  | 2025-02-16 05:51:26.994 UTC [51] LOG:  database system was shut down at 2025-02-16 05:51:26 UTC
postgres-1  | 2025-02-16 05:51:27.002 UTC [48] LOG:  database system is ready to accept connections
postgres-1  |  done
postgres-1  | server started
postgres-1  | 
postgres-1  | /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/create-multiple-dbs.sh
postgres-1  | Multiple database creation requested: auth
postgres-1  | Checking database 'auth'
postgres-1  | Creating database 'auth'
postgres-1  | CREATE DATABASE
postgres-1  | Multiple databases setup completed
postgres-1  | 
postgres-1  | 2025-02-16 05:51:27.219 UTC [48] LOG:  received fast shutdown request
postgres-1  | waiting for server to shut down....2025-02-16 05:51:27.220 UTC [48] LOG:  aborting any active transactions
postgres-1  | 2025-02-16 05:51:27.223 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
postgres-1  | 2025-02-16 05:51:27.225 UTC [49] LOG:  shutting down
postgres-1  | 2025-02-16 05:51:27.226 UTC [49] LOG:  checkpoint starting: shutdown immediate
postgres-1  | 2025-02-16 05:51:27.283 UTC [49] LOG:  checkpoint complete: wrote 921 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.032 s, sync=0.022 s, total=0.058 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4238 kB, estimate=4238 kB; lsn=0/1908978, redo lsn=0/1908978
postgres-1  | 2025-02-16 05:51:27.302 UTC [48] LOG:  database system is shut down
postgres-1  |  done
postgres-1  | server stopped
postgres-1  | 
postgres-1  | PostgreSQL init process complete; ready for start up.
postgres-1  | 
postgres-1  | 2025-02-16 05:51:27.342 UTC [1] LOG:  starting PostgreSQL 17.3 (Debian 17.3-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
postgres-1  | 2025-02-16 05:51:27.342 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgres-1  | 2025-02-16 05:51:27.342 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgres-1  | 2025-02-16 05:51:27.343 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres-1  | 2025-02-16 05:51:27.347 UTC [72] LOG:  database system was shut down at 2025-02-16 05:51:27 UTC
postgres-1  | 2025-02-16 05:51:27.352 UTC [1] LOG:  database system is ready to accept connections
```

- We can notice these comments in the logs:

```bash
postgres-1  | Multiple database creation requested: auth
postgres-1  | Checking database 'auth'
postgres-1  | Creating database 'auth'
postgres-1  | CREATE DATABASE
postgres-1  | Multiple databases setup completed
postgres-1  | 
```

##### 2.4.4.4. Ensuring the databases are created

- We need to know the name of the container.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ docker ps | grep postgres
26a521908893   postgres   "docker-entrypoint.s…"   28 minutes ago   Up 28 minutes   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   nestjs-microservices-build-a-distributed-job-engine-postgres-1
```

- We can ensure the databases are created by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$docker docker exec -it nestjs-microservices-build-a-distributed-job-engine-postgres-1 psql -U postgres -c "\l+ auth"
```

- We see the following output:

```bash
...skipping...
                                                    List of databases
   Name    |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules |   Access privileges   
-----------+----------+----------+-----------------+------------+------------+--------+-----------+-----------------------
 auth      | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | 
 postgres  | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | 
 template0 | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | =c/postgres          +
           |          |          |                 |            |            |        |           | postgres=CTc/postgres
 template1 | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | =c/postgres          +
           |          |          |                 |            |            |        |           | postgres=CTc/postgres
(4 rows)
```

> note: it seems that the `nx run auth:migrate-prisma auth` command is in fact creating the database. The issue was that I hadn't select [X] Show all databases in the connection string.

![DBeaver Connection String](image006.png)

##### 2.4.4.5. Running the migrations

- We need to run the migrations by executing the `nx migrate-prisma auth` command
- We can see the users table has been created.

![Users table has been created](image007.png)

#### 2.4.5. Forcing the `generate-types` target to run when executing `nx serve auth`

- We need to modify the `project.json` file to force the `generate-types` target to run when executing `nx serve auth`.
- We need to add the `generate-types` target to the `serve` target.

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
+     "dependsOn": ["generate-types"]
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "auth:build",
        "runBuildTargetDependencies": false
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
      "options": {
        "passWithNoTests": true
      }
    },
    "generate-types": {
      "command": "prisma generate",
      "options": {
        "cwd": "apps/auth"
      }
    },
    "migrate-prisma": {
      "command": "prisma migrate dev",
      "options": {
        "cwd": "apps/auth"
      }
    }
  }
}
```

- We need to run the `nx serve auth` command to see the `generate-types` target in action.
- We can see the `generate-types` target has been executed.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx build auth

> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 61ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want real-time updates to your database without manual polling? Discover how with Pulse: https://pris.ly/tip-0-pulse


> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 2.71 KiB [entry] [rendered]
webpack compiled successfully (efad3b78154bea4f)

——————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 1 task it depends on (7s)

View logs and investigate cache misses at https://nx.app/runs/nRcP4bAZdo
```

- We can see the `generate-types` target has been executed.

```bash
> nx run auth:generate-types

> prisma generate
```

#### 2.4.6. Generating the Prisma `Module` for the `auth` microservice

- We need to generate the Prisma `Module` for the `auth` microservice.
- First we need to create the `prisma` folder inside the `auth\src\app` folder by executing the following command.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ mkdir -p apps/auth/src/app/prisma
```

- Then we need to generate the Prisma `Module` by executing the following command from the `apps/auth/` folder.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx generate @nrwl/nest:module apps/auth/src/app/prisma
```

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ cd apps/auth/src/app/prisma/
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app/prisma$ nx g module prisma
✔ Which generator would you like to use? · @nx/nest:module

 NX  Generating @nx/nest:module

CREATE apps/auth/src/app/prisma/prisma.module.ts
UPDATE apps/auth/src/app/app.module.ts
```

> apps/auth/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
+ import { PrismaModule } from './prisma/prisma.module';

@Module({
+ imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- We need to create a `service` class to handle the Prisma client.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app/prisma$ nx g service prisma
✔ Which generator would you like to use? · @nx/nest:service

 NX  Generating @nx/nest:service

CREATE apps/auth/src/app/prisma/prisma.service.spec.ts
CREATE apps/auth/src/app/prisma/prisma.service.ts
UPDATE apps/auth/src/app/prisma/prisma.module.ts
```

> apps/auth/src/app/prisma/prisma.service.ts

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {}
```

> apps/auth/src/app/prisma/prisma.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
})
export class PrismaModule {}
```

- We need to update the `prisma.service.ts` file to use the Prisma client.

> apps/auth/src/app/prisma/prisma.service.ts

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/auth';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- We are going to remove any app.* document except the `app.module.ts` file. So the `app.controller.ts` and `app.service.ts` files will be removed. This is how the `app.module.ts` file should look like:

> apps/auth/src/app/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### 2.5 Creating the `users` endpoints

#### 2.5.1. Setting up GraphQL

- We are going to use GraphQL to create the `users` endpoints.

##### 2.5.1.1. Upgrading the dependencies

- We need to ensure we have the latest version of `nestjs` installed.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ ncu --deep -u
Upgrading /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/package.json
[====================] 37/37 100%

 @eslint/js                  ^9.8.0  →   ^9.20.0
 @nestjs/common             ^10.0.2  →   ^11.0.9
 @nestjs/core               ^10.0.2  →   ^11.0.9
 @nestjs/platform-express   ^10.0.2  →   ^11.0.9
 @nestjs/schematics         ^10.0.1  →   ^11.0.0
 @nestjs/testing            ^10.0.2  →   ^11.0.9
 @swc-node/register          ~1.9.1  →   ~1.10.9
 @swc/core                   ~1.5.7  →  ~1.10.16
 @swc/helpers               ~0.5.11  →   ~0.5.15
 @types/jest               ^29.5.12  →  ^29.5.14
 @types/node               ~18.16.9  →  ~22.13.4
 axios                       ^1.6.0  →    ^1.7.9
 eslint                      ^9.8.0  →   ^9.20.1
 eslint-config-prettier      ^9.0.0  →   ^10.0.1
 prettier                    ^2.6.2  →    ^3.5.1
 reflect-metadata           ^0.1.13  →    ^0.2.2
 rxjs                        ^7.8.0  →    ^7.8.1
 ts-jest                    ^29.1.0  →   ^29.2.5
 ts-node                     10.9.1  →    10.9.2
 tslib                       ^2.3.0  →    ^2.8.1
 typescript                  ~5.7.2  →    ~5.7.3
 typescript-eslint          ^8.19.0  →   ^8.24.0
 webpack-cli                 ^5.1.4  →    ^6.0.1
Upgrading /home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/dist/apps/auth/package.json
[====================] 5/5 100%

 @nestjs/common            10.4.15  →  11.0.9
 @nestjs/core              10.4.15  →  11.0.9
 @nestjs/platform-express  10.4.15  →  11.0.9
 reflect-metadata           0.1.14  →   0.2.2

Run npm install to install new versions.
```

- We need to install all the new versions by executing `npm install --force`.
- We are using `--force` because we are getting the following error if we don't use it:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: @nx/eslint-plugin@20.4.4
npm error Found: eslint-config-prettier@10.0.1
npm error node_modules/eslint-config-prettier
npm error   dev eslint-config-prettier@"^10.0.1" from the root project
npm error
npm error Could not resolve dependency:
npm error peerOptional eslint-config-prettier@"^9.0.0" from @nx/eslint-plugin@20.4.4
npm error node_modules/@nx/eslint-plugin
npm error   dev @nx/eslint-plugin@"20.4.4" from the root project
npm error
npm error Conflicting peer dependency: eslint-config-prettier@9.1.0
npm error node_modules/eslint-config-prettier
npm error   peerOptional eslint-config-prettier@"^9.0.0" from @nx/eslint-plugin@20.4.4
npm error   node_modules/@nx/eslint-plugin
npm error     dev @nx/eslint-plugin@"20.4.4" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error /home/juanpabloperez/.npm/_logs/2025-02-16T12_26_01_085Z-eresolve-report.txt
npm error A complete log of this run can be found in: /home/juanpabloperez/.npm/_logs/2025-02-16T12_26_01_085Z-debug-0.log
```

- We need to install all the new versions by executing `npm install --force`.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm i --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nx/eslint-plugin@20.4.4
npm warn Found: eslint-config-prettier@10.0.1
npm warn node_modules/eslint-config-prettier
npm warn   dev eslint-config-prettier@"^10.0.1" from the root project
npm warn
npm warn Could not resolve dependency:
npm warn peerOptional eslint-config-prettier@"^9.0.0" from @nx/eslint-plugin@20.4.4
npm warn node_modules/@nx/eslint-plugin
npm warn   dev @nx/eslint-plugin@"20.4.4" from the root project
npm warn
npm warn Conflicting peer dependency: eslint-config-prettier@9.1.0
npm warn node_modules/eslint-config-prettier
npm warn   peerOptional eslint-config-prettier@"^9.0.0" from @nx/eslint-plugin@20.4.4
npm warn   node_modules/@nx/eslint-plugin
npm warn     dev @nx/eslint-plugin@"20.4.4" from the root project
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 1116 packages, and audited 1117 packages in 7s

190 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

##### 2.5.1.2. Installing the GraphQL dependencies

- We need to install the `@nestjs/graphq`, `@nestjs/apollo`, `@apoll`/server` and `graphql` package.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nestjs/apollo@11.0.6
npm warn Found: @nestjs/common@11.0.9
npm warn node_modules/@nestjs/common
npm warn   peer @nestjs/common@"^11.0.0" from @nestjs/core@11.0.9
npm warn   node_modules/@nestjs/core
npm warn     peer @nestjs/core@"^11.0.0" from @nestjs/platform-express@11.0.9
npm warn     node_modules/@nestjs/platform-express
npm warn     2 more (@nestjs/testing, the root project)
npm warn   3 more (@nestjs/platform-express, @nestjs/testing, the root project)
npm warn
npm warn Could not resolve dependency:
npm warn peer @nestjs/common@"^9.0.0" from @nestjs/apollo@11.0.6
npm warn node_modules/@nestjs/apollo
npm warn   @nestjs/apollo@"11" from the root project
npm warn
npm warn Conflicting peer dependency: @nestjs/common@9.4.3
npm warn node_modules/@nestjs/common
npm warn   peer @nestjs/common@"^9.0.0" from @nestjs/apollo@11.0.6
npm warn   node_modules/@nestjs/apollo
npm warn     @nestjs/apollo@"11" from the root project
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nestjs/apollo@11.0.6
npm warn Found: @nestjs/core@11.0.9
npm warn node_modules/@nestjs/core
npm warn   peer @nestjs/core@"^11.0.0" from @nestjs/platform-express@11.0.9
npm warn   node_modules/@nestjs/platform-express
npm warn     peerOptional @nestjs/platform-express@"^11.0.0" from @nestjs/core@11.0.9
npm warn     2 more (@nestjs/testing, the root project)
npm warn   2 more (@nestjs/testing, the root project)
npm warn
npm warn Could not resolve dependency:
npm warn peer @nestjs/core@"^9.3.8" from @nestjs/apollo@11.0.6
npm warn node_modules/@nestjs/apollo
npm warn   @nestjs/apollo@"11" from the root project
npm warn
npm warn Conflicting peer dependency: @nestjs/core@9.4.3
npm warn node_modules/@nestjs/core
npm warn   peer @nestjs/core@"^9.3.8" from @nestjs/apollo@11.0.6
npm warn   node_modules/@nestjs/apollo
npm warn     @nestjs/apollo@"11" from the root project
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nestjs/graphql@11.0.6
npm warn Found: @nestjs/common@11.0.9
npm warn node_modules/@nestjs/common
npm warn   peer @nestjs/common@"^11.0.0" from @nestjs/core@11.0.9
npm warn   node_modules/@nestjs/core
npm warn     peer @nestjs/core@"^11.0.0" from @nestjs/platform-express@11.0.9
npm warn     node_modules/@nestjs/platform-express
npm warn     2 more (@nestjs/testing, the root project)
npm warn   3 more (@nestjs/platform-express, @nestjs/testing, the root project)
npm warn
npm warn Could not resolve dependency:
npm warn peer @nestjs/common@"^9.3.8" from @nestjs/graphql@11.0.6
npm warn node_modules/@nestjs/graphql
npm warn   @nestjs/graphql@"11" from the root project
npm warn   1 more (@nestjs/apollo)
npm warn
npm warn Conflicting peer dependency: @nestjs/common@9.4.3
npm warn node_modules/@nestjs/common
npm warn   peer @nestjs/common@"^9.3.8" from @nestjs/graphql@11.0.6
npm warn   node_modules/@nestjs/graphql
npm warn     @nestjs/graphql@"11" from the root project
npm warn     1 more (@nestjs/apollo)
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nestjs/graphql@11.0.6
npm warn Found: @nestjs/core@11.0.9
npm warn node_modules/@nestjs/core
npm warn   peer @nestjs/core@"^11.0.0" from @nestjs/platform-express@11.0.9
npm warn   node_modules/@nestjs/platform-express
npm warn     peerOptional @nestjs/platform-express@"^11.0.0" from @nestjs/core@11.0.9
npm warn     2 more (@nestjs/testing, the root project)
npm warn   2 more (@nestjs/testing, the root project)
npm warn
npm warn Could not resolve dependency:
npm warn peer @nestjs/core@"^9.3.8" from @nestjs/graphql@11.0.6
npm warn node_modules/@nestjs/graphql
npm warn   @nestjs/graphql@"11" from the root project
npm warn   1 more (@nestjs/apollo)
npm warn
npm warn Conflicting peer dependency: @nestjs/core@9.4.3
npm warn node_modules/@nestjs/core
npm warn   peer @nestjs/core@"^9.3.8" from @nestjs/graphql@11.0.6
npm warn   node_modules/@nestjs/graphql
npm warn     @nestjs/graphql@"11" from the root project
npm warn     1 more (@nestjs/apollo)
npm warn ERESOLVE overriding peer dependency
npm warn ERESOLVE overriding peer dependency
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nestjs/graphql@11.0.6
npm warn Found: reflect-metadata@0.2.2
npm warn node_modules/reflect-metadata
npm warn   peer reflect-metadata@"^0.1.12" from @nestjs/mapped-types@1.2.2
npm warn   node_modules/@nestjs/graphql/node_modules/@nestjs/mapped-types
npm warn     @nestjs/mapped-types@"1.2.2" from @nestjs/graphql@11.0.6
npm warn     node_modules/@nestjs/graphql
npm warn
npm warn Could not resolve dependency:
npm warn peer reflect-metadata@"^0.1.13" from @nestjs/graphql@11.0.6
npm warn node_modules/@nestjs/graphql
npm warn   @nestjs/graphql@"11" from the root project
npm warn   1 more (@nestjs/apollo)
npm warn
npm warn Conflicting peer dependency: reflect-metadata@0.1.14
npm warn node_modules/reflect-metadata
npm warn   peer reflect-metadata@"^0.1.13" from @nestjs/graphql@11.0.6
npm warn   node_modules/@nestjs/graphql
npm warn     @nestjs/graphql@"11" from the root project
npm warn     1 more (@nestjs/apollo)
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @nx/eslint-plugin@20.4.4
npm warn Found: eslint-config-prettier@10.0.1
npm warn node_modules/eslint-config-prettier
npm warn   dev eslint-config-prettier@"^10.0.1" from the root project
npm warn
npm warn Could not resolve dependency:
npm warn peerOptional eslint-config-prettier@"^9.0.0" from @nx/eslint-plugin@20.4.4
npm warn node_modules/@nx/eslint-plugin
npm warn   dev @nx/eslint-plugin@"20.4.4" from the root project
npm warn
npm warn Conflicting peer dependency: eslint-config-prettier@9.1.0
npm warn node_modules/eslint-config-prettier
npm warn   peerOptional eslint-config-prettier@"^9.0.0" from @nx/eslint-plugin@20.4.4
npm warn   node_modules/@nx/eslint-plugin
npm warn     dev @nx/eslint-plugin@"20.4.4" from the root project
npm warn deprecated lodash.omit@4.5.0: This package is deprecated. Use destructuring assignment syntax instead.
npm warn deprecated @apollo/server-plugin-landing-page-graphql-playground@4.0.0: The use of GraphQL Playground in Apollo Server was supported in previous versions, but this is no longer the case as of December 31, 2022. This package exists for v4 migration purposes only. We do not intend to resolve security issues or other bugs with this package if they arise, so please migrate away from this to [Apollo Server's default Explorer](https://www.apollographql.com/docs/apollo-server/api/plugin/landing-pages) as soon as possible.
npm warn deprecated subscriptions-transport-ws@0.11.0: The `subscriptions-transport-ws` package is no longer maintained. We recommend you use `graphql-ws` instead. For help migrating Apollo software to `graphql-ws`, see https://www.apollographql.com/docs/apollo-server/data/subscriptions/#switching-from-subscriptions-transport-ws    For general help using `graphql-ws`, see https://github.com/enisdenjo/graphql-ws/blob/master/README.md

added 76 packages, removed 1 package, and audited 1193 packages in 10s

193 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

##### 2.5.1.3. Ensuring the `auth` microservice is still working

- We need to ensure the `auth` microservice is still working.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve auth

 NX   Running target serve for project auth and 2 tasks it depends on:

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 77ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22


> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 2.35 KiB [entry] [rendered]
webpack compiled successfully (e9daf51baee2fec5)

> nx run auth:serve:development


> nx run auth:generate-types

> prisma generate

Environment variables loaded from ../../.env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.3.1) to ./../../node_modules/@prisma-clients/auth in 53ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22


> nx run auth:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 2.35 KiB [entry] [rendered]
webpack compiled successfully (e9daf51baee2fec5)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 1 task it depends on (5s)

Debugger listening on ws://localhost:9229/46dc945e-3d2a-4a7b-ab79-7f2e17d0c78f
For help, see: https://nodejs.org/en/docs/inspector

[Nest] 288596  - 16/02/2025, 12:49:11     LOG [NestFactory] Starting Nest application...
[Nest] 288596  - 16/02/2025, 12:49:11     LOG [InstanceLoader] AppModule dependencies initialized +11ms
[Nest] 288596  - 16/02/2025, 12:49:11     LOG [InstanceLoader] PrismaModule dependencies initialized +1ms
[Nest] 288596  - 16/02/2025, 12:49:11     LOG [NestApplication] Nest application successfully started +71ms
[Nest] 288596  - 16/02/2025, 12:49:11     LOG 🚀 Application is running on: http://localhost:3000/api
```

##### 2.5.1.4. Modifying the `app.module.ts` file to use GraphQL

- We need to modify the `app.module.ts` file to use GraphQL.

> apps/auth/src/app/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

#### 2.5.2. Creating the `User` GraphQL type

##### 2.5.2.1. Creating a library where we are going to share all the `NestJS` code.

- With `Nx` we can have `applications` and `libraries`.
  - `Applications` are the main projects that we are going to deploy.
  - `Libraries` are shared libraries that we can use across different applications.
- We are going to create the `NestJS` library by executing the following command:

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx g lib nestjs-utils
```

- We need to create the `User` GraphQL type.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx g library libs/nestjs
✔ Which generator would you like to use? · @nx/nest:library

 NX  Generating @nx/nest:library

✔ Which linter would you like to use? · eslint
✔ Which unit test runner would you like to use? · jest
CREATE libs/nestjs/tsconfig.lib.json
CREATE libs/nestjs/tsconfig.json
CREATE libs/nestjs/src/index.ts
CREATE libs/nestjs/README.md
CREATE libs/nestjs/project.json
CREATE libs/nestjs/eslint.config.mjs
CREATE libs/nestjs/tsconfig.spec.json
CREATE libs/nestjs/jest.config.ts
UPDATE tsconfig.base.json
CREATE libs/nestjs/src/lib/nestjs.module.ts

 NX   👀 View Details of nestjs

Run "nx show project nestjs" to view details about this project.


 NX   👀 View Details of nestjs

Run "nx show project nestjs" to view details about this project.
```

- The documents inside the `libs/nestjs` folder are the following:

> libs/nestjs/src/lib/graphql/abstract.model.ts

```ts
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType({ isAbstract: true })
export class AbstractModel {
  @Field(() => ID)
  id: number;
}
```

> libs/nestjs/src/lib/graphql/index.ts

```ts
export * from './abstract.model';
```

> libs/nestjs/src/lib/index.ts

```ts
export * from './graphql';
```

> libs/nestjs/src/index.ts

```ts
export * from './lib';
```

##### 2.5.2.2. Creating the `User` GraphQL type in the `auth` application

- We are going to create the `apps/auth/src/app/users/models` folder.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ mkdir apps/auth/src/app/users
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ mkdir apps/auth/src/app/users/models
```

- We need to create the `User` model.

> apps/auth/src/app/users/models/user.model.ts

```ts
import { AbstractModel } from "@jobber/nestjs";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User extends AbstractModel {
  @Field(() => String)
  email: string;
}
```

##### 2.5.2.3. Creating the `User` GraphQL resolver

- We need to create the `User` GraphQL resolver.
- We are going to use `nx` to create the resolver.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app/users$ nx g resolver users
✔ Which generator would you like to use? · @nx/nest:resolver

 NX  Generating @nx/nest:resolver

CREATE apps/auth/src/app/users/users.resolver.spec.ts
CREATE apps/auth/src/app/users/users.resolver.ts
UPDATE apps/auth/src/app/app.module.ts
```

- We are going to create the `Users` service as well.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app/users$ nx g service users
✔ Which generator would you like to use? · @nx/nest:service

 NX  Generating @nx/nest:service

CREATE apps/auth/src/app/users/users.service.spec.ts
CREATE apps/auth/src/app/users/users.service.ts
UPDATE apps/auth/src/app/app.module.ts
```

- We need to create the `Users` module as well.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/auth/src/app/users$ nx g module users
✔ Which generator would you like to use? · @nx/nest:module

 NX  Generating @nx/nest:module

CREATE apps/auth/src/app/users/users.module.ts
UPDATE apps/auth/src/app/app.module.ts
```

- We are going to modify the `Users` resolver adding a `users` query juts to ensure everything is working.

> apps/auth/src/app/users/users.resolver.ts

```ts
import { Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async getUsers() {}
}
```

- We need to modify the `Users` module to add the `UsersResolver` and `UsersService`.

> apps/auth/src/app/users/users.module.ts

```ts
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
```

- We need to modify the `AppModule` to add the `UsersModule`.

> apps/auth/src/app/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
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

- We also need to modify the `main.ts` file to add the `json` middleware.

> apps/auth/src/main.ts

```ts
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
```

- Now if we start the `auth` microservice and we navigate to the `http://localhost:3000/graphql` we can access to the GraphQL playground.

![GraphQL Playground](image008.png)

##### 2.5.2.4. Adding the `class-validator` and `class-transformer` libraries to the `auth` application

- We need to add the `class-validator` and `class-transformer` libraries to the `auth` application, so that we can validate the `User` input and transform the `User` output.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm install class-validator class-transformer --force
npm warn using --force Recommended protections disabled.
.
added 5 packages, removed 1 package, and audited 1202 packages in 3s

193 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

##### 2.5.2.5. Adding the `Inputs` GraphQL type to the `auth` application

- We need to create the `CreateUserInput` that will be using the `class-validator` and `class-transformer` libraries.

> apps/auth/src/app/users/dto/create-user.input.ts

```ts
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsStrongPassword } from "class-validator";

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword()
  password: string;
}
```

- We need to modify the `main.ts` file to use the `ValidationPipe` to validate any input.

> apps/auth/src/main.ts

```ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
```

##### 2.5.2.6. Adding the `bcrypt` library to the `auth` application to encrypt the password

- We need to add the `bcrypt` library to the `auth` application.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm install bcryptjs --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 1 package, removed 1 package, and audited 1203 packages in 6s

193 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ npm install @types/bcryptjs --save-dev --force
npm warn using --force Recommended protections disabled.
npm warn ERESOLVE overriding peer dependency
.
added 1 package, and audited 1204 packages in 2s

193 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

##### 2.5.2.7. Adding the proper `Queries` and `Mutations` to the `User` GraphQL type to the `auth` application

- These are the final files for the `User` GraphQL type:

> apps/auth/src/app/users/models/user.model.ts

```ts
import { AbstractModel } from "@jobber/nestjs";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User extends AbstractModel {
  @Field(() => String)
  email: string;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}
```

> apps/auth/src/app/users/dto/upsert-user.input.ts

```ts
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsOptional, IsStrongPassword } from "class-validator";

@InputType()
export class UpsertUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword()
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsStrongPassword()
  newPassword?: string;
}
```

> apps/auth/src/app/users/users.service.ts

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from "bcryptjs";
import crypto from 'crypto';

bcrypt.setRandomFallback((len: number) => {
  return Array.from(crypto.randomBytes(len));
});

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new Logger(UsersService.name);

  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async getUser(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async getUsers() {
    return this.prismaService.user.findMany();
  }

  async upsertUser(data: Prisma.UserCreateInput & { newPassword?: string }) {
    if (!data.password) {
      throw new Error('Password is required');
    }

    const existingUser = await this.getUserByEmail(data.email);

    if (existingUser) {
      // Verify current password
      if (!bcrypt.compareSync(data.password, existingUser.password)) {
        throw new Error('Invalid current password');
      }

      // Fields to exclude from comparison
      const excludedFields = ['id', 'email', 'createdAt', 'updatedAt', 'password', 'newPassword'];

      // Prepare update data
      const updateData: Prisma.UserUpdateInput & { newPassword?: string } = { ...data };
      delete updateData.newPassword; // Remove newPassword from the data to update

      // Handle password update if newPassword is provided
      if (data.newPassword) {
        const salt = bcrypt.genSaltSync(10);
        updateData.password = bcrypt.hashSync(data.newPassword, salt);
      } else {
        delete updateData.password; // Don't update password if newPassword isn't provided
      }

      // Compare existing user with new data
      const hasChanges = Object.keys(updateData).some(key => {
        if (excludedFields.includes(key)) return false;
        return updateData[key] !== existingUser[key];
      });

      if (!hasChanges && !data.newPassword) {
        return existingUser;
      }

      updateData.updatedAt = new Date();

      return this.prismaService.user.update({
        where: { email: data.email },
        data: updateData,
      });
    }

    // Create new user (ignore newPassword for creation)
    const salt = bcrypt.genSaltSync(10);
    const newUserData = {
      ...data,
      password: bcrypt.hashSync(data.password, salt),
      updatedAt: new Date(),
    };
    delete newUserData.newPassword;

    return this.prismaService.user.create({
      data: newUserData,
    });
  }
}
```

> apps/auth/src/app/users/users.resolver.ts

```ts
import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UpsertUserInput } from './dto/upsert-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async upsertUser(@Args('upsertUserInput') upsertUserInput: UpsertUserInput) {
    return this.usersService.upsertUser(upsertUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Query(() => User, { name: 'user' })
  async getUser(@Args('id', { type: () => Number }) id: number) {
    return this.usersService.getUser(id);
  }

  @Query(() => User, { name: 'userByEmail' })
  async getUserByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.getUserByEmail(email);
  }
}
```

##### 2.5.2.8. Adding the `http` requests document to the `Users` model

- We need to add the `http` requests document to the `Users` model.

> apps/auth/src/app/users/users.http

```http

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

### Get a user by email

POST http://localhost:3000/graphql
Content-Type: application/json
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

POST http://localhost:3000/graphql
Content-Type: application/json
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

POST http://localhost:3000/graphql
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

POST http://localhost:3000/graphql
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
