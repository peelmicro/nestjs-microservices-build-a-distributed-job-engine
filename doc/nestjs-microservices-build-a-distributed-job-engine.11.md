# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 11)

## 14 Setting up the Helm Chart for Production

### 14.1 Setting `globalPrefix` for each service

#### 14.1.1 We need to modify the `main.ts` file to be able to set the `globalPrefix` for each service

> apps/jobs/src/main.ts

```typescript
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { init } from '@jobber/nestjs';
import { Transport } from '@nestjs/microservices';
import { GrpcOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Packages } from '@jobber/grpc';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app, 'jobs');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('JOBS_GRPC_SERVICE_URL'),
      package: Packages.JOBS,
      protoPath: join(__dirname, '../../libs/grpc/proto/jobs.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
```

> apps/auth/src/main.ts

```typescript
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { Packages } from '@jobber/grpc';
import { join } from 'path';
import { init } from '@jobber/nestjs';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app, 'auth');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('AUTH_GRPC_SERVICE_URL'),
      package: Packages.AUTH,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
```

#### 14.1.2 We need to modify the `app.module.ts` file to be able to set the `globalPrefix` for each service

> apps/jobs/src/app/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { LoggerModule } from '@jobber/nestjs';
import { GqlLoggingPlugin } from '@jobber/graphql';
import { UploadsModule } from './uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';
@Module({
  imports: [
    LoggerModule,
    UploadsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JobsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      plugins: [new GqlLoggingPlugin()],
      useGlobalPrefix: true,
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

> apps/auth/src/app/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from '@jobber/nestjs';
import { GqlLoggingPlugin } from '@jobber/graphql';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: true,
      plugins: [new GqlLoggingPlugin()],
      useGlobalPrefix: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### 14.2 Setting up Ingress for the Helm Chart

#### 14.2.1 We need to create a new `ingress.yaml` file for the Helm Chart

- Ingress is used to route traffic to the services, it allows us to expose the services to the outside world.
- And we can set different paths on that host and tell where we want traffic to go.

> charts/jobber/templates/ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
spec:
  rules:
    - host: jobber-local.com
      http:
        paths:
          - path: /jobs
            pathType: Prefix
            backend:
              service:
                name: jobs-http
                port:
                  number: { { .Values.jobs.port.http } }
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-http
                port:
                  number: { { .Values.auth.port.http } }
```

#### 14.2.2 To test the ingress locally we need to add a minikube addon

- This will set up ingress nginx on our cluster and ensure that we actually have an ingress nginx controller that will be listening for any ingress resources created and automatically provisioning the connection inside of minikube.

```bash
minikube addons enable ingress
💡  ingress is an addon maintained by Kubernetes. For any concerns contact minikube on GitHub.
You can view the list of minikube maintainers at: https://github.com/kubernetes/minikube/blob/master/OWNERS
    ▪ Using image registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.4.4
    ▪ Using image registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.4.4
    ▪ Using image registry.k8s.io/ingress-nginx/controller:v1.11.3
🔎  Verifying ingress addon...
🌟  The 'ingress' addon is enabled
```

- We can ensure that the `ingress` namespace is created

```bash
kubectl get namespace
NAME              STATUS   AGE
default           Active   11d
ingress-nginx     Active   10m
jobber            Active   9d
kube-node-lease   Active   11d
kube-public       Active   11d
kube-system       Active   11d
postgresql        Active   24h
pulsar            Active   9d
```

- We need set up a alias inside of our hosts file for our machine to be able to forward traffic on our custom hostname that we set up earlier on the ingress dot local and send that traffic to minikube, which will be listening for traffic on our ingress resources.

```bash
code /etc/hosts
```

> /etc/hosts

```diff
127.0.0.1	localhost
127.0.1.1	jpp-PROX15-A
+127.0.0.1 jobber-local.com

# The following lines
::1     ip6-localhost
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefi
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

#### 14.2.3 We need to upgrade our helm and ensure thet ingress is running inside our jubber namespace

```bash
helm upgrade jobber ./charts/jobber -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Sun Mar 30 16:54:11 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 22
TEST SUITE: None
```

- We can ensure that the ingress is running inside our jobber namespace

```bash
kubectl get ing -n jobber
NAME      CLASS   HOSTS              ADDRESS        PORTS   AGE
ingress   nginx   jobber-local.com   192.168.49.2   80      43s
```

- We need to run `minikube tunnel` to ensure that the ingress is running and we can access the ingress from our browser

```bash
minikube tunnel
Status:
        machine: minikube
        pid: 180976
        route: 10.96.0.0/12 -> 192.168.49.2
        minikube: Running
        services: []
    errors:
                minikube: no errors
                router: no errors
                loadbalancer emulator: no errors
```

- We can test if we can access the ingress using the `curl` command

```bash
curl -v http://jobber-local.com/jobs
* Host jobber-local.com:80 was resolved.
* IPv6: (none)
* IPv4: 127.0.0.1
*   Trying 127.0.0.1:80...
* connect to 127.0.0.1 port 80 from 127.0.0.1 port 53148 failed: Connection refused
* Failed to connect to jobber-local.com port 80 after 1 ms: Couldn't connect to server
* Closing connection
curl: (7) Failed to connect to jobber-local.com port 80 after 1 ms: Couldn't connect to server
```

- We can see that we are getting a connection refused error, which means that the ingress is not working as expected.

- We need to update the etc/hosts file to be able to access the ingress from our browser

> /etc/hosts

```diff
127.0.0.1	localhost
127.0.1.1	jpp-PROX15-AMD
127.0.0.1 jobber-local.com
+192.168.49.2 jobber-local.com

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

- We can now try to access the ingress from the `curl` command

```bash
curl -v http://jobber-local.com/graphql
```
