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

### 14.6 Setting upp the `AWS Load Balancer Controller`

#### 14.6.1 We need to install the `AWS Load Balancer Controller`

- The `AWS Load Balancer Controller` is a controller that allows us to manage the `AWS Load Balancer` resources.
- We can follow the instructions from the [AWS Load Balancer Controller installation](hhttps://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/deploy/installation/) document.

![AWS Load Balancer Controller installation](images050.png)

- As we can see in the image below, we need to create an `IAM OIDC provider`.

![IAM OIDC provider](images051.png)

- We can create the `IAM OIDC provider` by executing the following command.

```bash
eksctl utils associate-iam-oidc-provider \
    --region eu-north-1 \
    --cluster jobber \
    --approve
2025-03-31 14:28:46 [ℹ]  will create IAM Open ID Connect provider for cluster "jobber" in "eu-north-1"
2025-03-31 14:28:46 [✔]  created IAM Open ID Connect provider for cluster "jobber" in "eu-north-1"
```

- Now, we have to Download the "IAM policy for the LBC"

![Dowload IAM policy for the LBC](images052.png)

- We can download the `IAM policy for the LBC` by executing the following command.

```bash
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.12.0/docs/install/iam_policy.json
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  8912  100  8912    0     0  26136      0 --:--:-- --:--:-- --:--:-- 26134
```

- We can create the `IAM policy for the LBC` by executing the following command.

![Create the IAM policy for the LBC](images053.png)

```bash
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam-policy.json
{
    "Policy": {
        "PolicyName": "AWSLoadBalancerControllerIAMPolicy",
        "PolicyId": "ANPARB6XN77WXN5SLDCX6",
        "Arn": "arn:aws:iam::072929378285:policy/AWSLoadBalancerControllerIAMPolicy",
        "Path": "/",
        "DefaultVersionId": "v1",
        "AttachmentCount": 0,
        "PermissionsBoundaryUsageCount": 0,
        "IsAttachable": true,
        "CreateDate": "2025-03-31T13:33:52+00:00",
        "UpdateDate": "2025-03-31T13:33:52+00:00"
    }
}
```

- We can create the `IAM role for the LBC` by executing the following command.
- We need to use the "Arn" value from the previous command to attach the policy to the role.

![Create the IAM role for the LBC](images054.png)

```bash
eksctl create iamserviceaccount \
    --cluster jobber \
    --namespace kube-system \
    --name aws-load-balancer-controller \
    --attach-policy-arn arn:aws:iam::072929378285:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --region eu-north-1 \
    --approve
2025-03-31 14:38:34 [ℹ]  1 iamserviceaccount (kube-system/aws-load-balancer-controller) was included (based on the include/exclude rules)
2025-03-31 14:38:34 [!]  metadata of serviceaccounts that exist in Kubernetes will be updated, as --override-existing-serviceaccounts was set
2025-03-31 14:38:34 [ℹ]  1 task: {
    2 sequential sub-tasks: {
        create IAM role for serviceaccount "kube-system/aws-load-balancer-controller",
        create serviceaccount "kube-system/aws-load-balancer-controller",
    } }2025-03-31 14:38:34 [ℹ]  building iamserviceaccount stack "eksctl-jobber-addon-iamserviceaccount-kube-system-aws-load-balancer-controller"
2025-03-31 14:38:35 [ℹ]  deploying stack "eksctl-jobber-addon-iamserviceaccount-kube-system-aws-load-balancer-controller"
2025-03-31 14:38:35 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-addon-iamserviceaccount-kube-system-aws-load-balancer-controller"
2025-03-31 14:39:05 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-addon-iamserviceaccount-kube-system-aws-load-balancer-controller"
2025-03-31 14:39:06 [ℹ]  created serviceaccount "kube-system/aws-load-balancer-controller"
```

- We need to add the `EKS` chart repo to Helm

![Add the EKS chart repo to Helm](images055.png)

```bash
helm repo add eks https://aws.github.io/eks-charts
"eks" has been added to your repositories
```

- We need to install Helm command for clusters with "IRSA":

![Install Helm command for clusters with "IRSA"](images056.png)

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    --namespace kube-system \
    --set clusterName=jobber \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller
NAME: aws-load-balancer-controller
LAST DEPLOYED: Mon Mar 31 14:46:15 2025
NAMESPACE: kube-system
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
AWS Load Balancer controller installed!
```

- We can check the `pods` by executing the following command.
- We should see the `aws-load-balancer-controller` pod running.
- This load balancer controller is going to watch for any ingress resources that get created in our cluster and automatically provision an AWS application load balancer in the cloud in order to expose that ingress to the public internet without us having to do anything.

```bash
kubectl get po -n kube-system
NAME                                          READY   STATUS    RESTARTS   AGE
aws-load-balancer-controller-d88554f4-74r2z   1/1     Running   0          48s
aws-load-balancer-controller-d88554f4-flfcl   1/1     Running   0          48s
aws-node-rmzcl                                2/2     Running   0          70m
aws-node-rt6k8                                2/2     Running   0          70m
coredns-b59df9565-2l7jb                       1/1     Running   0          74m
coredns-b59df9565-sqvth                       1/1     Running   0          74m
kube-proxy-4npkf                              1/1     Running   0          70m
kube-proxy-pqnwk                              1/1     Running   0          70m
metrics-server-8449d7f9c6-mjvgk               1/1     Running   0          74m
metrics-server-8449d7f9c6-smnpp               1/1     Running   0          74m
```

### 14.7 Setting up the `Amazon EBS CSI driver`

#### 14.7.1 We need to install the `Amazon EBS CSI driver`

- EBS stands for Elastic Block Storage and it's used to persist storage in the cloud.
- The `Amazon EBS CSI driver` is a CSI driver that allows us to manage the `Amazon EBS` volumes.
- We can follow the instructions from the [Store Kubernetes volumes with Amazon EBS](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html#managing-ebs-csi) document.

![Store Kubernetes volumes](images057.png)

- We need to create an "IAM role" for the `Amazon EBS CSI driver`.

![Create an IAM role for the Amazon EBS CSI driver](images058.png)

- We can install the `Amazon EBS CSI driver` by executing the following command.

```bash
eksctl create iamserviceaccount \
    --name ebs-csi-controller-sa \
    --namespace kube-system \
    --cluster jobber \
    --role-name AmazonEKS_EBS_CSI_Driver_Policy \
    --role-only \
    --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
    --approve
2025-03-31 15:01:16 [ℹ]  1 existing iamserviceaccount(s) (kube-system/aws-load-balancer-controller) will be excluded
2025-03-31 15:01:16 [ℹ]  1 iamserviceaccount (kube-system/ebs-csi-controller-sa) was included (based on the include/exclude rules)
2025-03-31 15:01:16 [!]  serviceaccounts in Kubernetes will not be created or modified, since the option --role-only is used
2025-03-31 15:01:16 [ℹ]  1 task: { create IAM role for serviceaccount "kube-system/ebs-csi-controller-sa" }
2025-03-31 15:01:16 [ℹ]  building iamserviceaccount stack "eksctl-jobber-addon-iamserviceaccount-kube-system-ebs-csi-controller-sa"
2025-03-31 15:01:16 [ℹ]  deploying stack "eksctl-jobber-addon-iamserviceaccount-kube-system-ebs-csi-controller-sa"
2025-03-31 15:01:16 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-addon-iamserviceaccount-kube-system-ebs-csi-controller-sa"
2025-03-31 15:01:47 [ℹ]  waiting for CloudFormation stack "eksctl-jobber-addon-iamserviceaccount-kube-system-ebs-csi-controller-sa"
```

- Before we can install the `Amazon EBS CSI driver` we need to go to the AmazonEKS_EBS_CSI_Driver_Policy we have just created and copy the "ARN", because we need to use it to install the `Amazon EBS CSI driver add-on`.

![Access the AmazonEKS_EBS_CSI_Driver_Policy](images059.png)

- We can copy the "ARN" value.

![Copy the ARN](images060.png)

- `ARN: arn:aws:iam::072929378285:role/AmazonEKS_EBS_CSI_Driver_Policy`

- We can install the `Amazon EBS CSI driver` by executing the following command.

```bash
eksctl create addon \
    --name aws-ebs-csi-driver \
    --cluster jobber \
    --region eu-north-1 \
    --service-account-role-arn arn:aws:iam::072929378285:role/AmazonEKS_EBS_CSI_Driver_Policy \
    --force
2025-03-31 15:13:40 [ℹ]  Kubernetes version "1.32" in use by cluster "jobber"
2025-03-31 15:13:41 [ℹ]  IRSA is set for "aws-ebs-csi-driver" addon; will use this to configure IAM permissions
2025-03-31 15:13:41 [!]  the recommended way to provide IAM permissions for "aws-ebs-csi-driver" addon is via pod identity associations; after addon creation is completed, run `eksctl utils migrate-to-pod-identity`
2025-03-31 15:13:41 [ℹ]  using provided ServiceAccountRoleARN "arn:aws:iam::072929378285:role/AmazonEKS_EBS_CSI_Driver_Policy"
2025-03-31 15:13:41 [ℹ]  creating addon: aws-ebs-csi-driver
```

- We can check the `pods` by executing the following command.
- We should see the `ebs-csi-controller` and `ebs-csi-node` pods running.
- These pods are now going to watch for persistent volumes that we create with a correct storage class.

```bash
kubectl get po -n kube-system
NAME                                          READY   STATUS    RESTARTS   AGE
aws-load-balancer-controller-d88554f4-74r2z   1/1     Running   0          28m
aws-load-balancer-controller-d88554f4-flfcl   1/1     Running   0          28m
aws-node-rmzcl                                2/2     Running   0          98m
aws-node-rt6k8                                2/2     Running   0          98m
coredns-b59df9565-2l7jb                       1/1     Running   0          102m
coredns-b59df9565-sqvth                       1/1     Running   0          102m
ebs-csi-controller-69bc78cf87-ns5q5           6/6     Running   0          56s
ebs-csi-controller-69bc78cf87-pkltn           6/6     Running   0          56s
ebs-csi-node-729f7                            3/3     Running   0          56s
ebs-csi-node-7mrq5                            3/3     Running   0          56s
kube-proxy-4npkf                              1/1     Running   0          98m
kube-proxy-pqnwk                              1/1     Running   0          98m
metrics-server-8449d7f9c6-mjvgk               1/1     Running   0          102m
metrics-server-8449d7f9c6-smnpp               1/1     Running   0          102m
```

### 14.8 Modifying the `Jobber Helm Chart` to be able to deploy it to `AWS EKS`

#### 14.8.1 We need to modify the `Jobber Helm Chart` to be able to deploy it to `AWS EKS`

- We need to take advantage of the `AWS Load Balancer Controller` and the `Amazon EBS CSI driver` to deploy the `Jobber` application to `AWS EKS`.

- We need to create the `values-aws.yaml` file to be able to deploy the `Jobber` application to `AWS EKS`.

> charts/jobber/values-aws.yaml

```yaml
ingress:
  alb: true

persistence:
  ebs: true

auth:
  jwt:
    secure: true

pulsar:
  global:
    storageClass: 'ebs-sc'

  zookeeper:
    persistence:
      storageClass: 'ebs-sc'
    volumes:
      data:
        storageClassName: 'ebs-sc'

  bookkeeper:
    volumes:
      journal:
        storageClassName: 'ebs-sc'
      ledgers:
        storageClassName: 'ebs-sc'

postgresql:
  primary:
    resources:
      limits:
        cpu: 1
    persistence:
      storageClass: 'ebs-sc'
```

- We need to modify the `ingress.yaml` file to be able to deploy it to `AWS EKS`.

> charts/jobber/templates/ingress.yaml

```diff
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
+{{- if .Values.ingress.alb }}
+  annotations:
+    alb.ingress.kubernetes.io/scheme: internet-facing
+    alb.ingress.kubernetes.io/target-type: ip
+    alb.ingress.kubernetes.io/listen-ports: '[{ "HTTP": 80 }, { "HTTPS": 443 }]'
+    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6
+    alb.ingress.kubernetes.io/ssl-redirect: "443"
+{{- end }}
spec:
+{{- if .Values.ingress.alb }}
+  ingressClassName: alb
+{{- end }}
  rules:
-   - host: jobber-local.com
+   - host: {{ if .Values.ingress.alb }} jobber-backend.com {{ else }} jobber-local.com {{ end }}
      http:
        paths:
          - path: /jobs
            pathType: Prefix
            backend:
              service:
                name: jobs-http
                port:
                  number: {{ .Values.jobs.port.http }}
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-http
                port:
                  number: {{ .Values.auth.port.http }}
```

- We need to create the new `storage-class.yaml` file to be able to deploy it to `AWS EKS`.

> charts/jobber/templates/storage-class.yaml

```yaml
{{- if .Values.persistence.ebs }}
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
{{- end }}
```

- We need to modify the `pvc.yaml` file for the `jobs` service to be able to deploy it to `AWS EKS`.

> charts/jobber/templates/jobs/pvc.yaml

```diff
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: uploads-pvc
spec:
  accessModes:
+    {{- if .Values.persistence.ebs }}
+    - ReadWriteOnce
+    {{- else }}
    - ReadWriteMany
+    {{- end }}
  resources:
    requests:
      storage: 5Gi
+  {{- if .Values.persistence.ebs }}
+  storageClassName: ebs-sc
+  {{- end}}
```

#### 14.8.2 We need to modify the `roles` for the `eksctl add-on IAM service account`

- We need to modify the `roles` for the `eksctl add-on IAM service account` to be able to deploy it to `AWS EKS`.

![Modify the roles for the eksctl add-on IAM service account](images061.png)

- We need to mosify the `AWSLoadBalancerControllerIAMPolicy` policy:

![Modify the AWSLoadBalancerControllerIAMPolicy policy](images062.png)

- We need to click on `JSON` and then on `Edit` to be able to modify the policy.

![Update the AWSLoadBalancerControllerIAMPolicy policy](images063.png)

- We need to ensure that the `elasticloadbalancing:DescribeListenerAttributes` policy has been added:

![Ensure DescribeListenerAttributes policy is added to the AWSLoadBalancerControllerIAMPolicy policy](images064.png)

#### 14.8.3 We need to ensure the `Jobber` application is deployed to `AWS EKS`

- We need to check the current `namespaces` by executing the following command:

```bash
kubectl get namespaces
NAME              STATUS   AGE
default           Active   3h35m
kube-node-lease   Active   3h35m
kube-public       Active   3h35m
kube-system       Active   3h35m
```

- We need to create the `postgresql` namespace by executing the following command:

```bash
kubectl create namespace postgresql
namespace/postgresql created
```

- We need to install the `jobber` helm chart by executing the following command:

```bash
helm install jobber ./charts/jobber -n jobber --create-namespace --values ./charts/jobber/values-aws.yaml
coalesce.go:237: warning: skipped value for pulsar.persistence: Not a table.
NAME: jobber
LAST DEPLOYED: Mon Mar 31 18:14:52 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

- We need to check the `namespaces` by executing the following command:

```bash
kubectl get namespaces
NAME              STATUS   AGE
default           Active   3h46m
jobber            Active   50s
kube-node-lease   Active   3h46m
kube-public       Active   3h46m
kube-system       Active   3h46m
postgresql        Active   9m24s
pulsar            Active   50s
```

- We need to check the `pods` by executing the following command:

```bash
kubectl get pods -n jobber
NAME                        READY   STATUS    RESTARTS        AGE
auth-6557955857-j8wgw       1/1     Running   0               4m33s
executor-78b8864ff-nm4rs    1/1     Running   4 (2m31s ago)   4m33s
jobs-5fd88f9d7b-s6c5g       1/1     Running   0               4m33s
products-865ff79986-b4qgb   1/1     Running   0               4m33s
```

- We need to check the `pvc` volumnes in `jobber` namespace by executing the following command:

```bash
kubectl get pvc -n jobber
NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
uploads-pvc   Bound    pvc-044e7cee-09a2-47f0-aa0b-1dd996c218b7   5Gi        RWO            ebs-sc         <unset>                 5m39s
```

- We need to check the `pvc` volumnes in `postgresql` namespace by executing the following command:

```bash
kubectl get pvc -n postgresql
NAME                       STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
data-jobber-postgresql-0   Bound    pvc-9f9f7d2c-ad2d-491c-a595-53a0ebb44dc8   8Gi        RWO            ebs-sc         <unset>                 6m56s
```

- We need to check the `pvc` volumnes in `pulsar` namespace by executing the following command:

```bash
kubectl get pvc -n pulsar
NAME                                                     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
jobber-pulsar-bookie-journal-jobber-pulsar-bookie-0      Bound    pvc-3310f5b1-b53d-4043-bed5-2c772145bede   10Gi       RWO            ebs-sc         <unset>                 7m40s
jobber-pulsar-bookie-ledgers-jobber-pulsar-bookie-0      Bound    pvc-bd4bf327-98f9-4c41-a071-f23e150103aa   50Gi       RWO            ebs-sc         <unset>                 7m40s
jobber-pulsar-zookeeper-data-jobber-pulsar-zookeeper-0   Bound    pvc-d8b1034a-6a7a-4764-9bd9-83af5ac7d012   20Gi       RWO            ebs-sc         <unset>                 7m40s
```

- We need to check the `ingress` in `jobber` namespace by executing the following command:

```bash
kubectl get ingress -n jobber
NAME      CLASS   HOSTS                ADDRESS   PORTS   AGE
ingress   alb     jobber-backend.com             80      8m49s
```

- We are supposed to get the ADDRESS.
- The empty ADDRESS field in your ingress output is normal - it typically takes a few minutes for the AWS Load Balancer Controller to provision and configure the Application Load Balancer (ALB).

- We can check if the `ALB` controller pods are running properly:

```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
NAME                                          READY   STATUS    RESTARTS   AGE
aws-load-balancer-controller-d88554f4-74r2z   1/1     Running   0          163m
aws-load-balancer-controller-d88554f4-flfcl   1/1     Running   0          163m
```

- We can check the `ALB` controller logs by executing the following command:

```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
{"level":"info","ts":"2025-03-31T16:18:01Z","logger":"controllers.ingress","msg":"creating listener","stackID":"jobber/ingress","resourceID":"443"}
{"level":"error","ts":"2025-03-31T16:18:01Z","msg":"Reconciler error","controller":"ingress","object":{"name":"ingress","namespace":"jobber"},"namespace":"jobber","name":"ingress","reconcileID":"2604dbee-3ae7-4251-842d-42fab12abbcb","error":"operation error Elastic Load Balancing v2: CreateListener, https response error StatusCode: 400, RequestID: b05eb9e2-327c-49b3-9fe8-f279c211de43, api error ValidationError: Certificate ARN 'arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6' is not valid"}
{"level":"info","ts":"2025-03-31T16:20:45Z","logger":"controllers.ingress","msg":"Auto Create SG","LB SGs":[{"$ref":"#/resources/AWS::EC2::SecurityGroup/ManagedLBSecurityGroup/status/groupID"},"sg-01bebf0dbf30c9432"],"backend SG":"sg-01bebf0dbf30c9432"}
{"level":"info","ts":"2025-03-31T16:20:45Z","logger":"controllers.ingress","msg":"successfully built model","model":"{\"id\":\"jobber/ingress\",\"resources\":{\"AWS::EC2::SecurityGroup\":{\"ManagedLBSecurityGroup\":{\"spec\":{\"groupName\":\"k8s-jobber-ingress-c412c33841\",\"description\":\"[k8s] Managed SecurityGroup for LoadBalancer\",\"ingress\":[{\"ipProtocol\":\"tcp\",\"fromPort\":443,\"toPort\":443,\"ipRanges\":[{\"cidrIP\":\"0.0.0.0/0\"}]},{\"ipProtocol\":\"tcp\",\"fromPort\":80,\"toPort\":80,\"ipRanges\":[{\"cidrIP\":\"0.0.0.0/0\"}]}]}}},\"AWS::ElasticLoadBalancingV2::Listener\":{\"443\":{\"spec\":{\"loadBalancerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::LoadBalancer/LoadBalancer/status/loadBalancerARN\"},\"port\":443,\"protocol\":\"HTTPS\",\"defaultActions\":[{\"type\":\"fixed-response\",\"fixedResponseConfig\":{\"contentType\":\"text/plain\",\"statusCode\":\"404\"}}],\"certificates\":[{\"certificateARN\":\"arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6\"}],\"sslPolicy\":\"ELBSecurityPolicy-2016-08\"}},\"80\":{\"spec\":{\"loadBalancerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::LoadBalancer/LoadBalancer/status/loadBalancerARN\"},\"port\":80,\"protocol\":\"HTTP\",\"defaultActions\":[{\"type\":\"redirect\",\"redirectConfig\":{\"port\":\"443\",\"protocol\":\"HTTPS\",\"statusCode\":\"HTTP_301\"}}]}}},\"AWS::ElasticLoadBalancingV2::ListenerRule\":{\"443:1\":{\"spec\":{\"listenerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::Listener/443/status/listenerARN\"},\"priority\":1,\"actions\":[{\"type\":\"forward\",\"forwardConfig\":{\"targetGroups\":[{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-jobs-http:3001/status/targetGroupARN\"}}]}}],\"conditions\":[{\"field\":\"host-header\",\"hostHeaderConfig\":{\"values\":[\"jobber-backend.com\"]}},{\"field\":\"path-pattern\",\"pathPatternConfig\":{\"values\":[\"/jobs\",\"/jobs/*\"]}}]}},\"443:2\":{\"spec\":{\"listenerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::Listener/443/status/listenerARN\"},\"priority\":2,\"actions\":[{\"type\":\"forward\",\"forwardConfig\":{\"targetGroups\":[{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-auth-http:3000/status/targetGroupARN\"}}]}}],\"conditions\":[{\"field\":\"host-header\",\"hostHeaderConfig\":{\"values\":[\"jobber-backend.com\"]}},{\"field\":\"path-pattern\",\"pathPatternConfig\":{\"values\":[\"/auth\",\"/auth/*\"]}}]}}},\"AWS::ElasticLoadBalancingV2::LoadBalancer\":{\"LoadBalancer\":{\"spec\":{\"name\":\"k8s-jobber-ingress-86bcb3fcfc\",\"type\":\"application\",\"scheme\":\"internet-facing\",\"ipAddressType\":\"ipv4\",\"subnetMapping\":[{\"subnetID\":\"subnet-0007eb0d55b6beb0c\"},{\"subnetID\":\"subnet-0c6589b7016d9a9e7\"},{\"subnetID\":\"subnet-0e096700420b9035a\"}],\"securityGroups\":[{\"$ref\":\"#/resources/AWS::EC2::SecurityGroup/ManagedLBSecurityGroup/status/groupID\"},\"sg-01bebf0dbf30c9432\"]}}},\"AWS::ElasticLoadBalancingV2::TargetGroup\":{\"jobber/ingress-auth-http:3000\":{\"spec\":{\"name\":\"k8s-jobber-authhttp-98be096a8f\",\"targetType\":\"ip\",\"port\":3000,\"protocol\":\"HTTP\",\"protocolVersion\":\"HTTP1\",\"ipAddressType\":\"ipv4\",\"healthCheckConfig\":{\"port\":\"traffic-port\",\"protocol\":\"HTTP\",\"path\":\"/\",\"matcher\":{\"httpCode\":\"200\"},\"intervalSeconds\":15,\"timeoutSeconds\":5,\"healthyThresholdCount\":2,\"unhealthyThresholdCount\":2}}},\"jobber/ingress-jobs-http:3001\":{\"spec\":{\"name\":\"k8s-jobber-jobshttp-8f1cc828a8\",\"targetType\":\"ip\",\"port\":3001,\"protocol\":\"HTTP\",\"protocolVersion\":\"HTTP1\",\"ipAddressType\":\"ipv4\",\"healthCheckConfig\":{\"port\":\"traffic-port\",\"protocol\":\"HTTP\",\"path\":\"/\",\"matcher\":{\"httpCode\":\"200\"},\"intervalSeconds\":15,\"timeoutSeconds\":5,\"healthyThresholdCount\":2,\"unhealthyThresholdCount\":2}}}},\"K8S::ElasticLoadBalancingV2::TargetGroupBinding\":{\"jobber/ingress-auth-http:3000\":{\"spec\":{\"template\":{\"metadata\":{\"name\":\"k8s-jobber-authhttp-98be096a8f\",\"namespace\":\"jobber\",\"creationTimestamp\":null},\"spec\":{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-auth-http:3000/status/targetGroupARN\"},\"targetType\":\"ip\",\"serviceRef\":{\"name\":\"auth-http\",\"port\":3000},\"networking\":{\"ingress\":[{\"from\":[{\"securityGroup\":{\"groupID\":\"sg-01bebf0dbf30c9432\"}}],\"ports\":[{\"protocol\":\"TCP\",\"port\":3000}]}]},\"ipAddressType\":\"ipv4\",\"vpcID\":\"vpc-010680def416ce229\"}}}},\"jobber/ingress-jobs-http:3001\":{\"spec\":{\"template\":{\"metadata\":{\"name\":\"k8s-jobber-jobshttp-8f1cc828a8\",\"namespace\":\"jobber\",\"creationTimestamp\":null},\"spec\":{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-jobs-http:3001/status/targetGroupARN\"},\"targetType\":\"ip\",\"serviceRef\":{\"name\":\"jobs-http\",\"port\":3001},\"networking\":{\"ingress\":[{\"from\":[{\"securityGroup\":{\"groupID\":\"sg-01bebf0dbf30c9432\"}}],\"ports\":[{\"protocol\":\"TCP\",\"port\":3001}]}]},\"ipAddressType\":\"ipv4\",\"vpcID\":\"vpc-010680def416ce229\"}}}}}}}"}
{"level":"info","ts":"2025-03-31T16:20:45Z","logger":"controllers.ingress","msg":"creating listener","stackID":"jobber/ingress","resourceID":"443"}
{"level":"error","ts":"2025-03-31T16:20:45Z","msg":"Reconciler error","controller":"ingress","object":{"name":"ingress","namespace":"jobber"},"namespace":"jobber","name":"ingress","reconcileID":"1555af36-1721-49fc-983e-57da433ade1c","error":"operation error Elastic Load Balancing v2: CreateListener, https response error StatusCode: 400, RequestID: b953826f-7f19-4dac-8d6e-9e252ce8f943, api error ValidationError: Certificate ARN 'arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6' is not valid"}
{"level":"info","ts":"2025-03-31T16:26:13Z","logger":"controllers.ingress","msg":"Auto Create SG","LB SGs":[{"$ref":"#/resources/AWS::EC2::SecurityGroup/ManagedLBSecurityGroup/status/groupID"},"sg-01bebf0dbf30c9432"],"backend SG":"sg-01bebf0dbf30c9432"}
{"level":"info","ts":"2025-03-31T16:26:13Z","logger":"controllers.ingress","msg":"successfully built model","model":"{\"id\":\"jobber/ingress\",\"resources\":{\"AWS::EC2::SecurityGroup\":{\"ManagedLBSecurityGroup\":{\"spec\":{\"groupName\":\"k8s-jobber-ingress-c412c33841\",\"description\":\"[k8s] Managed SecurityGroup for LoadBalancer\",\"ingress\":[{\"ipProtocol\":\"tcp\",\"fromPort\":80,\"toPort\":80,\"ipRanges\":[{\"cidrIP\":\"0.0.0.0/0\"}]},{\"ipProtocol\":\"tcp\",\"fromPort\":443,\"toPort\":443,\"ipRanges\":[{\"cidrIP\":\"0.0.0.0/0\"}]}]}}},\"AWS::ElasticLoadBalancingV2::Listener\":{\"443\":{\"spec\":{\"loadBalancerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::LoadBalancer/LoadBalancer/status/loadBalancerARN\"},\"port\":443,\"protocol\":\"HTTPS\",\"defaultActions\":[{\"type\":\"fixed-response\",\"fixedResponseConfig\":{\"contentType\":\"text/plain\",\"statusCode\":\"404\"}}],\"certificates\":[{\"certificateARN\":\"arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6\"}],\"sslPolicy\":\"ELBSecurityPolicy-2016-08\"}},\"80\":{\"spec\":{\"loadBalancerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::LoadBalancer/LoadBalancer/status/loadBalancerARN\"},\"port\":80,\"protocol\":\"HTTP\",\"defaultActions\":[{\"type\":\"redirect\",\"redirectConfig\":{\"port\":\"443\",\"protocol\":\"HTTPS\",\"statusCode\":\"HTTP_301\"}}]}}},\"AWS::ElasticLoadBalancingV2::ListenerRule\":{\"443:1\":{\"spec\":{\"listenerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::Listener/443/status/listenerARN\"},\"priority\":1,\"actions\":[{\"type\":\"forward\",\"forwardConfig\":{\"targetGroups\":[{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-jobs-http:3001/status/targetGroupARN\"}}]}}],\"conditions\":[{\"field\":\"host-header\",\"hostHeaderConfig\":{\"values\":[\"jobber-backend.com\"]}},{\"field\":\"path-pattern\",\"pathPatternConfig\":{\"values\":[\"/jobs\",\"/jobs/*\"]}}]}},\"443:2\":{\"spec\":{\"listenerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::Listener/443/status/listenerARN\"},\"priority\":2,\"actions\":[{\"type\":\"forward\",\"forwardConfig\":{\"targetGroups\":[{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-auth-http:3000/status/targetGroupARN\"}}]}}],\"conditions\":[{\"field\":\"host-header\",\"hostHeaderConfig\":{\"values\":[\"jobber-backend.com\"]}},{\"field\":\"path-pattern\",\"pathPatternConfig\":{\"values\":[\"/auth\",\"/auth/*\"]}}]}}},\"AWS::ElasticLoadBalancingV2::LoadBalancer\":{\"LoadBalancer\":{\"spec\":{\"name\":\"k8s-jobber-ingress-86bcb3fcfc\",\"type\":\"application\",\"scheme\":\"internet-facing\",\"ipAddressType\":\"ipv4\",\"subnetMapping\":[{\"subnetID\":\"subnet-0007eb0d55b6beb0c\"},{\"subnetID\":\"subnet-0c6589b7016d9a9e7\"},{\"subnetID\":\"subnet-0e096700420b9035a\"}],\"securityGroups\":[{\"$ref\":\"#/resources/AWS::EC2::SecurityGroup/ManagedLBSecurityGroup/status/groupID\"},\"sg-01bebf0dbf30c9432\"]}}},\"AWS::ElasticLoadBalancingV2::TargetGroup\":{\"jobber/ingress-auth-http:3000\":{\"spec\":{\"name\":\"k8s-jobber-authhttp-98be096a8f\",\"targetType\":\"ip\",\"port\":3000,\"protocol\":\"HTTP\",\"protocolVersion\":\"HTTP1\",\"ipAddressType\":\"ipv4\",\"healthCheckConfig\":{\"port\":\"traffic-port\",\"protocol\":\"HTTP\",\"path\":\"/\",\"matcher\":{\"httpCode\":\"200\"},\"intervalSeconds\":15,\"timeoutSeconds\":5,\"healthyThresholdCount\":2,\"unhealthyThresholdCount\":2}}},\"jobber/ingress-jobs-http:3001\":{\"spec\":{\"name\":\"k8s-jobber-jobshttp-8f1cc828a8\",\"targetType\":\"ip\",\"port\":3001,\"protocol\":\"HTTP\",\"protocolVersion\":\"HTTP1\",\"ipAddressType\":\"ipv4\",\"healthCheckConfig\":{\"port\":\"traffic-port\",\"protocol\":\"HTTP\",\"path\":\"/\",\"matcher\":{\"httpCode\":\"200\"},\"intervalSeconds\":15,\"timeoutSeconds\":5,\"healthyThresholdCount\":2,\"unhealthyThresholdCount\":2}}}},\"K8S::ElasticLoadBalancingV2::TargetGroupBinding\":{\"jobber/ingress-auth-http:3000\":{\"spec\":{\"template\":{\"metadata\":{\"name\":\"k8s-jobber-authhttp-98be096a8f\",\"namespace\":\"jobber\",\"creationTimestamp\":null},\"spec\":{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-auth-http:3000/status/targetGroupARN\"},\"targetType\":\"ip\",\"serviceRef\":{\"name\":\"auth-http\",\"port\":3000},\"networking\":{\"ingress\":[{\"from\":[{\"securityGroup\":{\"groupID\":\"sg-01bebf0dbf30c9432\"}}],\"ports\":[{\"protocol\":\"TCP\",\"port\":3000}]}]},\"ipAddressType\":\"ipv4\",\"vpcID\":\"vpc-010680def416ce229\"}}}},\"jobber/ingress-jobs-http:3001\":{\"spec\":{\"template\":{\"metadata\":{\"name\":\"k8s-jobber-jobshttp-8f1cc828a8\",\"namespace\":\"jobber\",\"creationTimestamp\":null},\"spec\":{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-jobs-http:3001/status/targetGroupARN\"},\"targetType\":\"ip\",\"serviceRef\":{\"name\":\"jobs-http\",\"port\":3001},\"networking\":{\"ingress\":[{\"from\":[{\"securityGroup\":{\"groupID\":\"sg-01bebf0dbf30c9432\"}}],\"ports\":[{\"protocol\":\"TCP\",\"port\":3001}]}]},\"ipAddressType\":\"ipv4\",\"vpcID\":\"vpc-010680def416ce229\"}}}}}}}"}
{"level":"info","ts":"2025-03-31T16:26:14Z","logger":"controllers.ingress","msg":"creating listener","stackID":"jobber/ingress","resourceID":"443"}
{"level":"error","ts":"2025-03-31T16:26:14Z","msg":"Reconciler error","controller":"ingress","object":{"name":"ingress","namespace":"jobber"},"namespace":"jobber","name":"ingress","reconcileID":"b0b2247b-9400-4c65-8a01-cab592313f73","error":"operation error Elastic Load Balancing v2: CreateListener, https response error StatusCode: 400, RequestID: 89405e86-73de-48c5-8a47-a0f50b24c619, api error ValidationError: Certificate ARN 'arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6' is not valid"}
{"level":"info","ts":"2025-03-31T13:46:24Z","logger":"setup","msg":"starting deferred tgb reconciler"}
{"level":"info","ts":"2025-03-31T13:46:24Z","logger":"setup","msg":"starting podInfo repo"}
{"level":"info","ts":"2025-03-31T13:46:26Z","logger":"controller-runtime.metrics","msg":"Starting metrics server"}
{"level":"info","ts":"2025-03-31T13:46:26Z","msg":"starting server","name":"health probe","addr":"[::]:61779"}
{"level":"info","ts":"2025-03-31T13:46:26Z","logger":"controller-runtime.metrics","msg":"Serving metrics server","bindAddress":":8080","secure":false}
{"level":"info","ts":"2025-03-31T13:46:26Z","logger":"controller-runtime.webhook","msg":"Starting webhook server"}
{"level":"info","ts":"2025-03-31T13:46:26Z","logger":"controller-runtime.certwatcher","msg":"Updated current TLS certificate"}
{"level":"info","ts":"2025-03-31T13:46:26Z","logger":"controller-runtime.webhook","msg":"Serving webhook server","host":"","port":9443}
{"level":"info","ts":"2025-03-31T13:46:26Z","logger":"controller-runtime.certwatcher","msg":"Starting certificate watcher"}
{"level":"info","ts":"2025-03-31T13:46:26Z","msg":"attempting to acquire leader lease kube-system/aws-load-balancer-controller-leader..."}
```

- The problem is the certificate that we are using in the ingress.yaml document is not valid: `alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6`

#### 14.8.4 Create a new certificate

- We need to access `Certificate Manager`

![Access Certificate Manager](images065.png)

- We need to click on `Request a certificate`

![Click on Request a certificate](images066.png)

- We need to `request a public certificate`.

![request a public certificate](images067.png)

- We need to put the `jobber-backend.com`

![Use the jobber-backend.com dcomain](images068.png)

- We get this "ARN":

`arn:aws:acm:eu-north-1:072929378285:certificate/18f73880-e502-4436-9dff-ffe847064fc5`

- We need to update the `ingress.yaml` document to put it:

> charts/jobber/templates/ingress.yaml

```diff
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
{{- if .Values.ingress.alb }}
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{ "HTTP": 80 }, { "HTTPS": 443 }]'
-   alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:905418201315:certificate/823799ce-2e91-41bf-bfaf-75449e5c0da6
+   alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-north-1:072929378285:certificate/18f73880-e502-4436-9dff-ffe847064fc5
    alb.ingress.kubernetes.io/ssl-redirect: "443"
{{- end }}
spec:
{{- if .Values.ingress.alb }}
  ingressClassName: alb
{{- end }}
  rules:
    - host: {{ if .Values.ingress.alb }} jobber-backend.com {{ else }} jobber-local.com {{ end }}
      http:
        paths:
          - path: /jobs
            pathType: Prefix
            backend:
              service:
                name: jobs-http
                port:
                  number: {{ .Values.jobs.port.http }}
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-http
                port:
                  number: {{ .Values.auth.port.http }}
```

- We need to upgrade the Helm Chart by executing:

```bash
helm upgrade jobber ./charts/jobber -n jobber --values ./charts/jobber/values-aws.yaml
coalesce.go:237: warning: skipped value for pulsar.persistence: Not a table.
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Mon Mar 31 19:43:02 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 3
TEST SUITE: None
```

- We need to rollout the `aws-load-balancer-controller` pods

```bash
kubectl rollout restart deployment aws-load-balancer-controller -n kube-system
deployment.apps/aws-load-balancer-controller restarted
```

- We need to ensure the pods are recreated:

```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
NAME                                            READY   STATUS    RESTARTS   AGE
aws-load-balancer-controller-56c7969656-ll4nv   1/1     Running   0          28s
aws-load-balancer-controller-56c7969656-v8dhc   1/1     Running   0          16s
```

- And we need to ensure there are no errors in the logs:

```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
{"level":"info","ts":"2025-03-31T17:45:32Z","logger":"setup","msg":"starting podInfo repo"}
{"level":"info","ts":"2025-03-31T17:45:32Z","logger":"setup","msg":"starting deferred tgb reconciler"}
{"level":"info","ts":"2025-03-31T17:45:34Z","logger":"controller-runtime.metrics","msg":"Starting metrics server"}
{"level":"info","ts":"2025-03-31T17:45:34Z","msg":"starting server","name":"health probe","addr":"[::]:61779"}
{"level":"info","ts":"2025-03-31T17:45:34Z","logger":"controller-runtime.metrics","msg":"Serving metrics server","bindAddress":":8080","secure":false}
{"level":"info","ts":"2025-03-31T17:45:34Z","logger":"controller-runtime.webhook","msg":"Starting webhook server"}
{"level":"info","ts":"2025-03-31T17:45:34Z","logger":"controller-runtime.certwatcher","msg":"Updated current TLS certificate"}
{"level":"info","ts":"2025-03-31T17:45:34Z","logger":"controller-runtime.webhook","msg":"Serving webhook server","host":"","port":9443}
{"level":"info","ts":"2025-03-31T17:45:34Z","logger":"controller-runtime.certwatcher","msg":"Starting certificate watcher"}
{"level":"info","ts":"2025-03-31T17:45:34Z","msg":"attempting to acquire leader lease kube-system/aws-load-balancer-controller-leader..."}
{"level":"info","ts":"2025-03-31T17:45:44Z","logger":"setup","msg":"starting podInfo repo"}
{"level":"info","ts":"2025-03-31T17:45:44Z","logger":"setup","msg":"starting deferred tgb reconciler"}
{"level":"info","ts":"2025-03-31T17:45:46Z","msg":"starting server","name":"health probe","addr":"[::]:61779"}
{"level":"info","ts":"2025-03-31T17:45:46Z","logger":"controller-runtime.metrics","msg":"Starting metrics server"}
{"level":"info","ts":"2025-03-31T17:45:46Z","logger":"controller-runtime.webhook","msg":"Starting webhook server"}
{"level":"info","ts":"2025-03-31T17:45:46Z","logger":"controller-runtime.metrics","msg":"Serving metrics server","bindAddress":":8080","secure":false}
{"level":"info","ts":"2025-03-31T17:45:46Z","logger":"controller-runtime.certwatcher","msg":"Updated current TLS certificate"}
{"level":"info","ts":"2025-03-31T17:45:46Z","logger":"controller-runtime.webhook","msg":"Serving webhook server","host":"","port":9443}
{"level":"info","ts":"2025-03-31T17:45:46Z","logger":"controller-runtime.certwatcher","msg":"Starting certificate watcher"}
{"level":"info","ts":"2025-03-31T17:45:46Z","msg":"attempting to acquire leader lease kube-system/aws-load-balancer-controller-leader..."}
```

- We need to delete the `ingress`

```bash
kubectl delete ingress ingress -n jobber
ingress.networking.k8s.io "ingress" deleted
```

- We need to upgrade the helm chart:

```bash
helm upgrade jobber ./charts/jobber -n jobber --values ./charts/jobber/values-aws.yaml
coalesce.go:237: warning: skipped value for pulsar.persistence: Not a table.
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Mon Mar 31 19:52:11 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 4
TEST SUITE: None
```

- It is still not working because it seems that the certificate is not valid.
- We are going to simplify the ingress.yaml document by removing the annontaion that we son't need at the moment:

> charts/jobber/templates/ingress.yaml

```diff
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
{{- if .Values.ingress.alb }}
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
+   alb.ingress.kubernetes.io/group.name: my-ingress-group
    alb.ingress.kubernetes.io/listen-ports: '[{ "HTTP": 80 }]'
+   # alb.ingress.kubernetes.io/listen-ports: '[{ "HTTP": 80 }, { "HTTPS": 443 }]'
+   # alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-north-1:072929378285:certificate/18f73880-e502-4436-9dff-ffe847064fc5
+   # alb.ingress.kubernetes.io/ssl-redirect: "443"
{{- end }}
spec:
{{- if .Values.ingress.alb }}
  ingressClassName: alb
{{- end }}
  rules:
    - host:
      {{ if .Values.ingress.alb }} jobber-backend.com {{ else }} jobber-local.com {{ end }}
      http:
        paths:
          - path: /jobs
            pathType: Prefix
            backend:
              service:
                name: jobs-http
                port:
                  number: {{ .Values.jobs.port.http }}
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-http
                port:
                  number: {{ .Values.auth.port.http }}
```

- We need to delete the ingress:

```bash
kubectl delete ingress ingress -n jobber
ingress.networking.k8s.io "ingress" deleted
```

- We need to upgrade the helm chart:

```bash
helm upgrade jobber ./charts/jobber -n jobber --values ./charts/jobber/values-aws.yaml
coalesce.go:237: warning: skipped value for pulsar.persistence: Not a table.
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Tue Apr  1 08:32:53 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 5
TEST SUITE: None
```

- We need to rollout the `aws-load-balancer-controller` pods:

```bash
ubectl rollout restart deployment aws-load-balancer-controller -n kube-system
deployment.apps/aws-load-balancer-controller restarted
```

- We need to ensure the pods are recreated:

```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
NAME                                           READY   STATUS    RESTARTS   AGE
aws-load-balancer-controller-5fb789bb4-7p8jt   1/1     Running   0          70s
aws-load-balancer-controller-5fb789bb4-sw59h   1/1     Running   0          59s
```

- And we need to ensure there are no errors in the logs:

```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
{"level":"info","ts":"2025-04-01T06:49:55Z","msg":"Starting workers","controller":"ingress","worker count":3}
{"level":"info","ts":"2025-04-01T06:49:55Z","msg":"Starting workers","controller":"service","worker count":3}
{"level":"info","ts":"2025-04-01T06:49:55Z","msg":"Starting workers","controller":"targetGroupBinding","controllerGroup":"elbv2.k8s.aws","controllerKind":"TargetGroupBinding","worker count":3}
{"level":"info","ts":"2025-04-01T06:49:55Z","msg":"Skipping targetgroupbinding reconcile","tgb":{"name":"k8s-jobber-authhttp-54e2616ae9","namespace":"jobber"},"calculated hash":"K9kUiLUHcHZuOxov9FmR9f_35Zx0fRApT0qg35GjxOM/dhs08uETiF5w5JmtvuQft7qTHKuPEX6oXebV_S7LJbw"}
{"level":"info","ts":"2025-04-01T06:49:55Z","msg":"Skipping targetgroupbinding reconcile","tgb":{"name":"k8s-jobber-jobshttp-70de410328","namespace":"jobber"},"calculated hash":"N_3GOeglDeAdxNywJ30aKlCFi4jLLH7AuVnOuxNb7Uw/8TRroSmqCPC9KNwS7tmUyltYQ7OfZ-FEwU9EJc5kpuk"}
{"level":"info","ts":"2025-04-01T06:49:55Z","logger":"controllers.ingress","msg":"Auto Create SG","LB SGs":[{"$ref":"#/resources/AWS::EC2::SecurityGroup/ManagedLBSecurityGroup/status/groupID"},"sg-054ef9b5a389d5c00"],"backend SG":"sg-054ef9b5a389d5c00"}
{"level":"info","ts":"2025-04-01T06:49:55Z","logger":"controllers.ingress","msg":"successfully built model","model":"{\"id\":\"my-ingress-group\",\"resources\":{\"AWS::EC2::SecurityGroup\":{\"ManagedLBSecurityGroup\":{\"spec\":{\"groupName\":\"k8s-myingressgroup-d4c60b60a0\",\"description\":\"[k8s] Managed SecurityGroup for LoadBalancer\",\"ingress\":[{\"ipProtocol\":\"tcp\",\"fromPort\":80,\"toPort\":80,\"ipRanges\":[{\"cidrIP\":\"0.0.0.0/0\"}]}]}}},\"AWS::ElasticLoadBalancingV2::Listener\":{\"80\":{\"spec\":{\"loadBalancerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::LoadBalancer/LoadBalancer/status/loadBalancerARN\"},\"port\":80,\"protocol\":\"HTTP\",\"defaultActions\":[{\"type\":\"fixed-response\",\"fixedResponseConfig\":{\"contentType\":\"text/plain\",\"statusCode\":\"404\"}}]}}},\"AWS::ElasticLoadBalancingV2::ListenerRule\":{\"80:1\":{\"spec\":{\"listenerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::Listener/80/status/listenerARN\"},\"priority\":1,\"actions\":[{\"type\":\"forward\",\"forwardConfig\":{\"targetGroups\":[{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-jobs-http:3001/status/targetGroupARN\"}}]}}],\"conditions\":[{\"field\":\"host-header\",\"hostHeaderConfig\":{\"values\":[\"jobber-backend.com\"]}},{\"field\":\"path-pattern\",\"pathPatternConfig\":{\"values\":[\"/jobs\",\"/jobs/*\"]}}]}},\"80:2\":{\"spec\":{\"listenerARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::Listener/80/status/listenerARN\"},\"priority\":2,\"actions\":[{\"type\":\"forward\",\"forwardConfig\":{\"targetGroups\":[{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-auth-http:3000/status/targetGroupARN\"}}]}}],\"conditions\":[{\"field\":\"host-header\",\"hostHeaderConfig\":{\"values\":[\"jobber-backend.com\"]}},{\"field\":\"path-pattern\",\"pathPatternConfig\":{\"values\":[\"/auth\",\"/auth/*\"]}}]}}},\"AWS::ElasticLoadBalancingV2::LoadBalancer\":{\"LoadBalancer\":{\"spec\":{\"name\":\"k8s-myingressgroup-9cf944356d\",\"type\":\"application\",\"scheme\":\"internet-facing\",\"ipAddressType\":\"ipv4\",\"subnetMapping\":[{\"subnetID\":\"subnet-0007eb0d55b6beb0c\"},{\"subnetID\":\"subnet-0c6589b7016d9a9e7\"},{\"subnetID\":\"subnet-0e096700420b9035a\"}],\"securityGroups\":[{\"$ref\":\"#/resources/AWS::EC2::SecurityGroup/ManagedLBSecurityGroup/status/groupID\"},\"sg-054ef9b5a389d5c00\"]}}},\"AWS::ElasticLoadBalancingV2::TargetGroup\":{\"jobber/ingress-auth-http:3000\":{\"spec\":{\"name\":\"k8s-jobber-authhttp-54e2616ae9\",\"targetType\":\"ip\",\"port\":3000,\"protocol\":\"HTTP\",\"protocolVersion\":\"HTTP1\",\"ipAddressType\":\"ipv4\",\"healthCheckConfig\":{\"port\":\"traffic-port\",\"protocol\":\"HTTP\",\"path\":\"/\",\"matcher\":{\"httpCode\":\"200\"},\"intervalSeconds\":15,\"timeoutSeconds\":5,\"healthyThresholdCount\":2,\"unhealthyThresholdCount\":2}}},\"jobber/ingress-jobs-http:3001\":{\"spec\":{\"name\":\"k8s-jobber-jobshttp-70de410328\",\"targetType\":\"ip\",\"port\":3001,\"protocol\":\"HTTP\",\"protocolVersion\":\"HTTP1\",\"ipAddressType\":\"ipv4\",\"healthCheckConfig\":{\"port\":\"traffic-port\",\"protocol\":\"HTTP\",\"path\":\"/\",\"matcher\":{\"httpCode\":\"200\"},\"intervalSeconds\":15,\"timeoutSeconds\":5,\"healthyThresholdCount\":2,\"unhealthyThresholdCount\":2}}}},\"K8S::ElasticLoadBalancingV2::TargetGroupBinding\":{\"jobber/ingress-auth-http:3000\":{\"spec\":{\"template\":{\"metadata\":{\"name\":\"k8s-jobber-authhttp-54e2616ae9\",\"namespace\":\"jobber\",\"creationTimestamp\":null},\"spec\":{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-auth-http:3000/status/targetGroupARN\"},\"targetType\":\"ip\",\"serviceRef\":{\"name\":\"auth-http\",\"port\":3000},\"networking\":{\"ingress\":[{\"from\":[{\"securityGroup\":{\"groupID\":\"sg-054ef9b5a389d5c00\"}}],\"ports\":[{\"protocol\":\"TCP\",\"port\":3000}]}]},\"ipAddressType\":\"ipv4\",\"vpcID\":\"vpc-010680def416ce229\"}}}},\"jobber/ingress-jobs-http:3001\":{\"spec\":{\"template\":{\"metadata\":{\"name\":\"k8s-jobber-jobshttp-70de410328\",\"namespace\":\"jobber\",\"creationTimestamp\":null},\"spec\":{\"targetGroupARN\":{\"$ref\":\"#/resources/AWS::ElasticLoadBalancingV2::TargetGroup/jobber/ingress-jobs-http:3001/status/targetGroupARN\"},\"targetType\":\"ip\",\"serviceRef\":{\"name\":\"jobs-http\",\"port\":3001},\"networking\":{\"ingress\":[{\"from\":[{\"securityGroup\":{\"groupID\":\"sg-054ef9b5a389d5c00\"}}],\"ports\":[{\"protocol\":\"TCP\",\"port\":3001}]}]},\"ipAddressType\":\"ipv4\",\"vpcID\":\"vpc-010680def416ce229\"}}}}}}}"}
{"level":"info","ts":"2025-04-01T06:49:57Z","logger":"controllers.ingress","msg":"modifying listener rule","stackID":"my-ingress-group","resourceID":"80:2","arn":"arn:aws:elasticloadbalancing:eu-north-1:072929378285:listener-rule/app/k8s-myingressgroup-9cf944356d/8537c26d31596070/5560f8f41cc83396/53b36ac94edf9594"}
{"level":"info","ts":"2025-04-01T06:49:57Z","logger":"controllers.ingress","msg":"modified listener rule","stackID":"my-ingress-group","resourceID":"80:2","arn":"arn:aws:elasticloadbalancing:eu-north-1:072929378285:listener-rule/app/k8s-myingressgroup-9cf944356d/8537c26d31596070/5560f8f41cc83396/53b36ac94edf9594"}
{"level":"info","ts":"2025-04-01T06:49:57Z","logger":"controllers.ingress","msg":"successfully deployed model","ingressGroup":"my-ingress-group"}
{"level":"info","ts":"2025-04-01T06:49:27Z","logger":"setup","msg":"starting deferred tgb reconciler"}
{"level":"info","ts":"2025-04-01T06:49:27Z","logger":"setup","msg":"starting podInfo repo"}
{"level":"info","ts":"2025-04-01T06:49:29Z","logger":"controller-runtime.metrics","msg":"Starting metrics server"}
{"level":"info","ts":"2025-04-01T06:49:29Z","logger":"controller-runtime.metrics","msg":"Serving metrics server","bindAddress":":8080","secure":false}
{"level":"info","ts":"2025-04-01T06:49:29Z","logger":"controller-runtime.webhook","msg":"Starting webhook server"}
{"level":"info","ts":"2025-04-01T06:49:29Z","msg":"starting server","name":"health probe","addr":"[::]:61779"}
{"level":"info","ts":"2025-04-01T06:49:29Z","logger":"controller-runtime.certwatcher","msg":"Updated current TLS certificate"}
{"level":"info","ts":"2025-04-01T06:49:29Z","logger":"controller-runtime.webhook","msg":"Serving webhook server","host":"","port":9443}
{"level":"info","ts":"2025-04-01T06:49:29Z","logger":"controller-runtime.certwatcher","msg":"Starting certificate watcher"}
{"level":"info","ts":"2025-04-01T06:49:29Z","msg":"attempting to acquire leader lease kube-system/aws-load-balancer-controller-leader..."}
```

- We can see that the ingress is working:

```bash
kubectl get ingress -n jobber
NAME      CLASS   HOSTS                ADDRESS                                                                 PORTS   AGE
ingress   alb     jobber-backend.com   k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com   80      17m
```

- We need to update the `users.http` file to use add the `Host` header:

> apps/auth/src/app/users/users.http

```http
# @url = http://localhost:3000/graphql
# @url = http://jobber-local.com/auth/graphql
# @ host = jobber-local.com
@url = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/auth/graphql
@host = jobber-backend.com
### Login
# @name login
POST {{url}}
Host: {{host}}
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

### Install httpbin and run using docker with "docker run -p 80:80 kennethreitz/httpbin"

GET http://0.0.0.0:80/anything
Content-Type: application/json
X-Full-Response: {{login.response.body.*}}

### Get all users
POST {{url}}
Host: {{host}}
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
Host: {{host}}
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
Host: {{host}}
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

### Get a user from the cookie

POST {{url}}
Host: {{host}}
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

### Create a user

POST {{url}}
Host: {{host}}
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
Host: {{host}}
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

- if we execute:

> apps/auth/src/app/users/users.http

```bash
@url = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/auth/graphql
@host = jobber-backend.com
### Login
# @name login
POST {{url}}
Host: {{host}}
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

- we get the following response:

> apps/auth/src/app/users/users.http

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 08:15:50 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 256
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"100-j6eWmhjyQyXt0rWikA85hNMaFag"

{
  "errors": [
    {
      "message": "Credentials are not valid.",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "login"
      ],
      "extensions": {
        "code": "UNAUTHENTICATED",
        "originalError": {
          "message": "Credentials are not valid.",
          "error": "Unauthorized",
          "statusCode": 401
        }
      }
    }
  ],
  "data": null
}
```

- That means that the ingress is working now.
