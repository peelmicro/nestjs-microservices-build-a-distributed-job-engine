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

### 14.3 Installing and Setting up the `AWS CLI` command line tool

#### 14.3.1 We need to install the `AWS CLI` command line tool

- We are going to deploy our jobber application to AWS EKS.
- We need to install the `AWS CLI` command line tool to be able to interact with our AWS account.
- We can follow the instructions from the [Installing or updating to the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) document.

![Installing the AWS CLI](images045.png)

- We can follow the `Snap package` instructions to install the `AWS CLI` command line tool in Linux.

![Snap package](images046.png)

- Check the current `snap` version to ensure that we have it installed.

```bash
snap version
snap    2.67.1+24.04
snapd   2.67.1+24.04
series  16
ubuntu  24.04
kernel  6.8.0-56-generic
```

- Install the `AWS CLI` command line tool.

```bash
sudo snap install aws-cli --classic
[sudo] password for juanpabloperez:
aws-cli (v2/stable) 2.25.6 from Amazon Web Services (aws✓) installed
```

- We need to ensure the `AWS CLI` has been installed correctly.

```bash
aws --version
aws-cli/2.13.25 Python/3.11.5 Linux/6.8.0-56-generic exe/x86_64.ubuntu.24 prompt/off
```

- It seems that `snag` is not installing the latest version of the `AWS CLI`, so we need to install it manually.

```bash
sudo snap refresh aws-cli
snap "aws-cli" has no updates available
```

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 65.0M  100 65.0M    0     0  25.5M      0  0:00:02  0:00:02 --:--:-- 25.5M
Archive:  awscliv2.zip
   creating: aws/
   creating: aws/dist/
  inflating: aws/THIRD_PARTY_LICENSES
  inflating: aws/README.md
  inflating: aws/install
   creating: aws/dist/awscli/
   creating: aws/dist/cryptography/
   creating: aws/dist/docutils/
   creating: aws/dist/lib-dynload/
  inflating: aws/dist/aws
  inflating: aws/dist/aws_completer
  inflating: aws/dist/libpython3.12.so.1.0
  inflating: aws/dist/_awscrt.abi3.so
  inflating: aws/dist/_cffi_backend.cpython-312-x86_64-linux-gnu.so
  inflating: aws/dist/_ruamel_yaml.cpython-312-x86_64-linux-gnu.so
  inflating: aws/dist/libz.so.1
  inflating: aws/dist/liblzma.so.5
  inflating: aws/dist/libbz2.so.1
  inflating: aws/dist/libffi.so.6
  inflating: aws/dist/awscli/customizations/sso/index.html
  inflating: aws/dist/awscli/data/ac.index
  inflating: aws/dist/awscli/data/metadata.json
  inflating: aws/dist/awscli/data/cli.json
Found preexisting AWS CLI installation: /usr/local/aws-cli/v2/current. Please rerun install script with --update flag.
```

```bash
sudo ./aws/install --update
You can now run: /usr/local/bin/aws --version
```

- We can now check the version of the `AWS CLI` command line tool.

```bash
 aws --version
aws-cli/2.25.6 Python/3.12.9 Linux/6.8.0-56-generic exe/x86_64.ubuntu.24
```

- We can use `AWS CLI` to authenticate our AWS account.
- We can use the same `access key id` and `secret access key` that we used to authenticate our AWS account for uploading the Docker images to the ECR repository.

![Access Sequirity Credentials](images047.png)

![Access Key](images048.png)

- We can now configure the `AWS CLI` command line tool to be able to interact with our AWS account.

```bash
aws configure
AWS Access Key ID [****************KIMP]: AKIARB6XN77W2EHQPDET
AWS Secret Access Key [****************A4Kj]: 5btbnkPXXXXXXXXXXXXXXXXXrDyQBcA
Default region name [eu-north-1]:
Default output format [json]:
```

- We can ensure that the configuration is correct by executing the following command.

```bash
aws sts get-caller-identity
{
    "UserId": "072929378285",
    "Account": "072929378285",
    "Arn": "arn:aws:iam::072929378285:root"
}
```

### 14.4 Setting up the `AWS EKS` cluster

#### 14.4.1 We need to install the `eksctl` command line tool

- `eksctl` is a command line tool for `AWS EKS` that allows us to create, delete and manage our `EKS` clusters.
- It's now fully maintained by `AWS` and it's the recommended tool to manage our `EKS` clusters.
- We can follow the instructions from the [eksctl Installation](https://eksctl.io/installation/) document.

![eksctl Installation](images049.png)

- We can download the `eksctl` command line tool from the [eksctl Releases](https://github.com/weaveworks/eksctl/releases) page.

```bash
curl -sL https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz | tar xz -C /tmp
```

- We can move the `eksctl` command line tool to the `/usr/local/bin` directory.

```bash
sudo mv /tmp/eksctl /usr/local/bin
```

- We can ensure that the `eksctl` command line tool has been installed correctly by executing the following command.

```bash
eksctl version
0.206.0
```

- We can now create a new `EKS` cluster using the `eksctl` command line tool.

```bash
eksctl create cluster --name jobber
2025-03-31 13:24:10 [ℹ]  eksctl version 0.206.0
2025-03-31 13:24:10 [ℹ]  using region eu-north-1
2025-03-31 13:24:10 [ℹ]  setting availability zones to [eu-north-1a eu-north-1b eu-north-1c]
2025-03-31 13:24:10 [ℹ]  subnets for eu-north-1a - public:192.168.0.0/19 private:192.168.96.0/19
2025-03-31 13:24:10 [ℹ]  subnets for eu-north-1b - public:192.168.32.0/19 private:192.168.128.0/19
2025-03-31 13:24:10 [ℹ]  subnets for eu-north-1c - public:192.168.64.0/19 private:192.168.160.0/19
2025-03-31 13:24:10 [ℹ]  nodegroup "ng-fa2d9068" will use "" [AmazonLinux2/1.32]
2025-03-31 13:24:10 [ℹ]  using Kubernetes version 1.32
2025-03-31 13:24:10 [ℹ]  creating EKS cluster "jobber" in "eu-north-1" region with managed nodes
2025-03-31 13:24:10 [ℹ]  will create 2 separate CloudFormation stacks for cluster itself and the initial managed nodegroup
2025-03-31 13:24:10 [ℹ]  if you encounter any issues, check CloudFormation console or try 'eksctl utils describe-stacks --region=eu-north-1 --cluster=jobber'
2025-03-31 13:24:10 [ℹ]  Kubernetes API endpoint access will use default of {publicAccess=true, privateAccess=false} for cluster "jobber" in "eu-north-1"
2025-03-31 13:24:10 [ℹ]  CloudWatch logging will not be enabled for cluster "jobber" in "eu-north-1"
2025-03-31 13:24:10 [ℹ]  you can enable it with 'eksctl utils update-cluster-logging --enable-types={SPECIFY-YOUR-LOG-TYPES-HERE (e.g. all)} --region=eu-north-1 --cluster=jobber'
2025-03-31 13:24:10 [ℹ]  default addons metrics-server, vpc-cni, kube-proxy, coredns were not specified, will install them as EKS addons
2025-03-31 13:24:10 [ℹ]
2 sequential tasks: { create cluster control plane "jobber",
    2 sequential sub-tasks: {
        2 sequential sub-tasks: {
            1 task: { create addons },
            wait for control plane to become ready,
        },
        create managed nodegroup "ng-fa2d9068",
    }
}
2025-03-31 13:24:10 [ℹ]  building cluster stack "eksctl-jobber-cluster"
2025-03-31 13:24:11 [ℹ]  deploying stack "eksctl-jobber-cluster"
2025-03-31 13:24:41 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:25:12 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:26:12 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:27:13 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:28:14 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:29:14 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:30:15 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:31:15 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:32:16 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-cluster"
2025-03-31 13:32:20 [ℹ]  creating addon: metrics-server
2025-03-31 13:32:21 [ℹ]  successfully created addon: metrics-server
2025-03-31 13:32:21 [!]  recommended policies were found for "vpc-cni" addon, but since OIDC is disabled on the cluster, eksctl cannot configure the requested permissions; the recommended way to provide IAM permissions for "vpc-cni" addon is via pod identity associations; after addon creation is completed, add all recommended policies to the config file, under `addon.PodIdentityAssociations`, and run `eksctl update addon`
2025-03-31 13:32:21 [ℹ]  creating addon: vpc-cni
2025-03-31 13:32:22 [ℹ]  successfully created addon: vpc-cni
2025-03-31 13:32:22 [ℹ]  creating addon: kube-proxy
2025-03-31 13:32:22 [ℹ]  successfully created addon: kube-proxy
2025-03-31 13:32:23 [ℹ]  creating addon: coredns
2025-03-31 13:32:23 [ℹ]  successfully created addon: coredns
2025-03-31 13:34:26 [ℹ]  building managed nodegroup stack "eksctl-jobber-nodegroup-ng-fa2d9068"
2025-03-31 13:34:26 [ℹ]  deploying stack "eksctl-jobber-nodegroup-ng-fa2d9068"
2025-03-31 13:34:27 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-nodegroup-ng-fa2d9068"
2025-03-31 13:34:57 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-nodegroup-ng-fa2d9068"
2025-03-31 13:35:39 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-nodegroup-ng-fa2d9068"
2025-03-31 13:36:20 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-nodegroup-ng-fa2d9068"
2025-03-31 13:38:07 [ℹ]  waiting for the control plane to become ready
2025-03-31 13:38:08 [✔]  saved kubeconfig as "/home/juanpabloperez/.kube/config"
2025-03-31 13:38:08 [ℹ]  no tasks
2025-03-31 13:38:08 [✔]  all EKS cluster resources for "jobber" have been created
2025-03-31 13:38:08 [ℹ]  nodegroup "ng-fa2d9068" has 2 node(s)
2025-03-31 13:38:08 [ℹ]  node "ip-192-168-30-231.eu-north-1.compute.internal" is ready
2025-03-31 13:38:08 [ℹ]  node "ip-192-168-62-149.eu-north-1.compute.internal" is ready
2025-03-31 13:38:08 [ℹ]  waiting for at least 2 node(s) to become ready in "ng-fa2d9068"
2025-03-31 13:38:08 [ℹ]  nodegroup "ng-fa2d9068" has 2 node(s)
2025-03-31 13:38:08 [ℹ]  node "ip-192-168-30-231.eu-north-1.compute.internal" is ready
2025-03-31 13:38:08 [ℹ]  node "ip-192-168-62-149.eu-north-1.compute.internal" is ready
2025-03-31 13:38:08 [✔]  created 1 managed nodegroup(s) in cluster "jobber"
2025-03-31 13:38:08 [✖]  kubectl not found, v1.10.0 or newer is required
2025-03-31 13:38:08 [ℹ]  cluster should be functional despite missing (or misconfigured) client binaries
2025-03-31 13:38:08 [✔]  EKS cluster "jobber" in "eu-north-1" region is ready
```

- We can check the nodes by executing the following command.

```bash
kubectl get nodes
E0331 13:39:06.438788  508433 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://192.168.49.2:8443/api?timeout=32s\": dial tcp 192.168.49.2:8443: connect: no route to host"
E0331 13:39:09.510552  508433 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://192.168.49.2:8443/api?timeout=32s\": dial tcp 192.168.49.2:8443: connect: no route to host"
E0331 13:39:12.582396  508433 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://192.168.49.2:8443/api?timeout=32s\": dial tcp 192.168.49.2:8443: connect: no route to host"
E0331 13:39:15.654520  508433 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"https://192.168.49.2:8443/api?timeout=32s\": dial tcp 192.168.49.2:8443: connect: no route to host"
```

- We can see there are some errors.
- The problem is that we have the `kubectl` command line tool installed as part of the `minikube` command line tool, that is currently configured to talk to minikube (192.168.49.2:8443) instead of your new EKS cluster. That's why we're getting the connection errors - it's trying to reach minikube which isn't running.
- The kubectl version warning from eksctl is because it can't find kubectl in the standard PATH - the version we installed through minikube is probably only accessible through the minikube alias we created (alias kubectl="minikube kubectl --").
- To fix this we need to install the official `kubectl` command line tool.

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
[sudo] password for juanpabloperez:
```

- We need to comment out the `minikube` alias in the `~/.bashrc` file.

> ~/.bashrc

```bash
# alias kubectl="minikube kubectl --"
```

- We need to reload the `~/.bashrc` file.

```bash
source ~/.bashrc
```

- We need our kuberconfig file to be able to talk to the new `EKS` cluster.

```bash
aws eks update-kubeconfig --name jobber --region eu-north-1
Added new context arn:aws:eks:eu-north-1:072929378285:cluster/jobber to /home/juanpabloperez/.kube/config
```

- It is recommended to start a new shell to ensure that the `kubectl` command line tool is using the new `EKS` cluster.

```bash
kubectl version
Client Version: v1.32.3
Kustomize Version: v5.5.0
Server Version: v1.32.2-eks-bc803b4
```

- We can check the nodes by executing the following command.

```bash
kubectl get nodes
NAME                                            STATUS   ROLES    AGE   VERSION
ip-192-168-30-231.eu-north-1.compute.internal   Ready    <none>   21m   v1.32.1-eks-5d632ec
ip-192-168-62-149.eu-north-1.compute.internal   Ready    <none>   21m   v1.32.1-eks-5d632ec
```

- We can check the `namespaces` by executing the following command.

```bash
kubectl get namespaces
NAME              STATUS   AGE
default           Active   28m
kube-node-lease   Active   28m
kube-public       Active   28m
kube-system       Active   28m
```

- We can check the `pods` by executing the following command.

```bash
kubectl get po -n kube-system
NAME                              READY   STATUS    RESTARTS   AGE
aws-node-rmzcl                    2/2     Running   0          23m
aws-node-rt6k8                    2/2     Running   0          23m
coredns-b59df9565-2l7jb           1/1     Running   0          26m
coredns-b59df9565-sqvth           1/1     Running   0          26m
kube-proxy-4npkf                  1/1     Running   0          23m
kube-proxy-pqnwk                  1/1     Running   0          23m
metrics-server-8449d7f9c6-mjvgk   1/1     Running   0          27m
metrics-server-8449d7f9c6-smnpp   1/1     Running   0          27m
```
