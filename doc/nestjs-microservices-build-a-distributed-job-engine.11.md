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

#### 14.2.3 We need to upgrade our helm and ensure that ingress is running inside our jobber namespace

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

- We also need to execute the `rollout restart` command to ensure that the ingress is running inside our jobber namespace:

```bash
kubectl rollout restart deployment -n jobber
deployment.apps/auth restarted
deployment.apps/executor restarted
deployment.apps/jobs restarted
deployment.apps/products restarted
```

- `helm upgrade` alone won't restart pods if only the image content changed (same tag)
- `rollout restart` forces all pods to restart, which makes them pull the latest images

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
curl -v http://jobber-local.com/auth/graphql
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
curl -v http://jobber-local.com/auth/graphql
* Host jobber-local.com:80 was resolved.
* IPv6: (none)
* IPv4: 127.0.0.1, 192.168.49.2
*   Trying 127.0.0.1:80...
* connect to 127.0.0.1 port 80 from 127.0.0.1 port 55668 failed: Connection refused
*   Trying 192.168.49.2:80...
* Connected to jobber-local.com (192.168.49.2) port 80
> GET /auth/graphql HTTP/1.1
> Host: jobber-local.com
> User-Agent: curl/8.5.0
> Accept: */*
>
< HTTP/1.1 400 Bad Request
< Date: Sun, 30 Mar 2025 17:04:24 GMT
< Content-Type: application/json; charset=utf-8
< Content-Length: 406
< Connection: keep-alive
< X-Powered-By: Express
< ETag: W/"196-HUCJKwlQurC5GNaaJnH0d+HOnRw"
<
{"errors":[{"message":"This operation has been blocked as a potential Cross-Site Request Forgery (CSRF). Please either specify a 'content-type' header (with a type that is not one of application/x-www-form-urlencoded, multipart/form-data, text/plain) or provide a non-empty value for one of the following headers: x-apollo-operation-name, apollo-require-preflight\n","extensions":{"code":"BAD_REQUEST"}}]}
* Connection #0 to host jobber-local.com left intact
```

#### 14.2.4 We need to set up a `csrfPrevention` in the `app.module.ts` file for the auth service by using a `csrfPrevention` setting variable

> apps/auth/.env

```diff
GRAPHQL_CSRF_PREVENTION=false
```

> apps/jobs/.env

```diff
GRAPHQL_CSRF_PREVENTION=false
```

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
+     csrfPrevention: process.env.GRAPHQL_CSRF_PREVENTION === 'true',
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

> apps/jobs/src/app/app.module.ts

```diff
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
+     csrfPrevention: process.env.GRAPHQL_CSRF_PREVENTION === 'true',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

> charts/jobber/templates/common.tpl

```diff
{{- define "common.env" -}}
- name: PULSAR_SERVICE_URL
  value: pulsar://{{ .Release.Name }}-pulsar-broker.pulsar.svc.cluster.local:6650
+- name: GRAPHQL_CSRF_PREVENTION
+  value: "false"
{{- end -}}
```

#### 14.2.5 We can now test the ingress again

```bash
curl -v http://jobber-local.com/auth/graphql
* Host jobber-local.com:80 was resolved.
* IPv6: (none)
* IPv4: 127.0.0.1, 192.168.49.2
*   Trying 127.0.0.1:80...
* connect to 127.0.0.1 port 80 from 127.0.0.1 port 58510 failed: Connection refused
*   Trying 192.168.49.2:80...
* Connected to jobber-local.com (192.168.49.2) port 80
> GET /auth/graphql HTTP/1.1
> Host: jobber-local.com
> User-Agent: curl/8.5.0
> Accept: */*
>
< HTTP/1.1 400 Bad Request
< Date: Sun, 30 Mar 2025 17:39:35 GMT
< Content-Type: application/json; charset=utf-8
< Content-Length: 148
< Connection: keep-alive
< X-Powered-By: Express
< cache-control: no-store
< ETag: W/"94-npaMbIB5erTaplHAdDd5m/mgtR8"
<
{"errors":[{"message":"GraphQL operations must contain a non-empty `query` or a `persistedQuery` extension.","extensions":{"code":"BAD_REQUEST"}}]}
* Connection #0 to host jobber-local.com left intact
```

- The error is the expected one, because we are not sending any GraphQL query.

#### 14.2.6 Using the `users.http` file to test the ingress

> apps/auth/src/app/users/users.http

```http
# @url = http://localhost:3000/graphql
@url = http://jobber-local.com/auth/graphql

### Login
# @name login
POST {{url}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  login(loginInput: {
    email: "my-email2@msn.com",
    password: "MyPassword1!"
  }) {
    id
  }
}
```

- We see the response from the login mutation

```json
HTTP/1.1 200 OK
Date: Sun, 30 Mar 2025 17:51:10 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 30
Connection: close
X-Powered-By: Express
Set-Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MzM1NzA3MCwiZXhwIjoxNzQzMzg1ODcwfQ.Bb4BrOElpL8zX-CcoCIfIL6r3wOq9Evdis6LK8aVwrU; Path=/; Expires=Thu, 27 Jun 2080 19:42:20 GMT; HttpOnly
cache-control: no-store
ETag: W/"1e-whozyX4FBwy0vj1YOIa0TwPtur0"

{
  "data": {
    "login": {
      "id": "1"
    }
  }
}
```

- That means that the login mutation is working as expected and we are able to login to the auth service.
- We can use a unique url for all the services, so we don't need to change the url for each service.
