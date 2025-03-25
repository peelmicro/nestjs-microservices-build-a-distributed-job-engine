# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 10)

## 12 Setting up the Kubernetes (cont.)

### 12.16. Adding the `Products` Service to the Helm Chart

#### 12.16.1. Adding the `products` templates

> charts/jobber/templates/products/deployment.yaml

```yaml
{{- if .Values.jobs.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobs
  labels:
    app: jobs
spec:
  replicas: {{ .Values.jobs.replicas }}
  selector:
    matchLabels:
      app: jobs
  template:
    metadata:
      labels:
        app: jobs
    spec:
      containers:
        - name: jobs
          image: {{ .Values.jobs.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
          ports:
            - containerPort: {{ .Values.jobs.port }}
          env:
            {{- include "common.env" . | nindent 12 }}
            - name: AUTH_GRPC_SERVICE_URL
              value: "auth-grpc:{{ .Values.auth.port.grpc }}"
            - name: PORT
              value: "{{ .Values.jobs.port }}"

{{- end }}
```

> charts/jobber/templates/products/service.yaml

```yaml
{{- if .Values.products.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: products
  labels:
    app: products
spec:
  type: ClusterIP
  selector:
    app: products
  ports:
    - protocol: TCP
      port: {{ .Values.products.port.grpc }}
      targetPort: {{ .Values.products.port.grpc }}
{{- end }}
```

#### 12.16.2. Adding the `products` values to the `values.yaml` file

- We need to add the `products` values to the `values.yaml` file.
- We also need to create the databases that we are going to use in our chart.

> charts/jobber/values.yaml

```yaml
.
postgresql:
  namespaceOverride: postgresql
  auth:
    username: postgres
    password: postgres
  primary:
    initdb:
      scripts:
        create-dbs.sql: |
          CREATE DATABASE auth;
          CREATE DATABASE products;
.
products:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/products:latest
  port:
    http: 3003
    grpc: 5001
```

#### 12.16.3. Removing the `DATABASE_URL` environment variable from the `common.tpl` file

- We need to remove the `DATABASE_URL` environment variable from the `common.tpl` file because we are going to use the `DATABASE_URL` for each database.
- We also need to add the `DATABASE_URL` environment variable to the `deployment.yaml` files for each service.

> charts/jobber/templates/common.tpl

```yaml
{{- define "common.env" -}}
- name: PULSAR_SERVICE_URL
  value: pulsar://{{ .Release.Name }}-pulsar-broker.pulsar.svc.cluster.local:6650
{{- end -}}
```

> charts/jobber/templates/auth/deployment.yaml

```diff
{{- if .Values.auth.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth
  labels:
    app: auth
spec:
  replicas: {{ .Values.auth.replicas }}
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      initContainers:
        - name: prisma-migrate
          image: {{ .Values.auth.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
          command: ["sh", "-c"]
          args:
            - |
              npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma
          env:
            {{- include "common.env" . | nindent 12 }}
+           - name: DATABASE_URL
+             value: postgresql://postgres:postgres@{{ .Release.Name }}-postgresql.postgresql.svc.cluster.local:5432/auth
      containers:
        - name: auth
          image: {{ .Values.auth.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
          ports:
            - containerPort: {{ .Values.auth.port.http }}
            - containerPort: {{ .Values.auth.port.grpc }}
          env:
            {{- include "common.env" . | nindent 12 }}
            - name: PORT
              value: "{{ .Values.auth.port.http }}"
            - name: JWT_SECRET
              value: {{ .Values.auth.jwt.secret }}
            - name: JWT_EXPIRATION_MS
              value: "{{ .Values.auth.jwt.expirationMs }}"
            - name: AUTH_GRPC_SERVICE_URL
              value: "0.0.0.0:{{ .Values.auth.port.grpc }}"
+            - name: DATABASE_URL
+              value: postgresql://postgres:postgres@{{ .Release.Name }}-postgresql.postgresql.svc.cluster.local:5432/auth
{{- end }}
```

> charts/jobber/templates/executor/deployment.yaml

```diff
{{- if .Values.executor.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: executor
  labels:
    app: executor
spec:
  replicas: {{ .Values.executor.replicas }}
  selector:
    matchLabels:
      app: executor
  template:
    metadata:
      labels:
        app: executor
    spec:
      containers:
        - name: executor
          image: {{ .Values.executor.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
          ports:
            - containerPort: {{ .Values.executor.port }}
          env:
            {{- include "common.env" . | nindent 12 }}
            - name: PORT
              value: "{{ .Values.executor.port }}"
+           - name: PRODUCTS_GRPC_SERVICE_URL
+             value: "products:{{ .Values.products.port.grpc }}"
{{- end }}

```

> charts/jobber/templates/jobs/deployment.yaml

```diff
{{- if .Values.jobs.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobs
  labels:
    app: jobs
spec:
  replicas: {{ .Values.jobs.replicas }}
  selector:
    matchLabels:
      app: jobs
  template:
    metadata:
      labels:
        app: jobs
    spec:
      containers:
        - name: jobs
          image: {{ .Values.jobs.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
          ports:
            - containerPort: {{ .Values.jobs.port }}
          env:
            {{- include "common.env" . | nindent 12 }}
            - name: AUTH_GRPC_SERVICE_URL
              value: "auth-grpc:{{ .Values.auth.port.grpc }}"
            - name: PORT
              value: "{{ .Values.jobs.port }}"
+           - name: JOBS_GRPC_SERVICE_URL
+             value: "0.0.0.0:{{ .Values.jobs.port }}"
{{- end }}
```

### 12.17. Recreating the installed helm charts

- We need to recreate the installed helm charts because we have added new values to the `values.yaml` file.

#### 12.17.1. Removing the `postgresql` chart

- We are going to remove the `postgresql` namespace so that all the resources in the `postgresql` namespace are deleted.

```bash
kubectl delete namespace postgresql
namespace "postgresql" deleted
```

- We need to create the `postgresql` namespace again.

```bash
kubectl create namespace postgresql
namespace "postgresql" created
```

#### 12.17.2. Upgrading the `jobber` charts

- We are going to update the dependencies of the `jobber` charts.

```bash
helm dependency update charts/jobber
Getting updates for unmanaged Helm repositories...
...Successfully got an update from the "https://pulsar.apache.org/charts" chart repository
...Successfully got an update from the "https://charts.bitnami.com/bitnami" chart repository
Saving 2 charts
Downloading pulsar from repo https://pulsar.apache.org/charts
Downloading postgresql from repo https://charts.bitnami.com/bitnami
Pulled: registry-1.docker.io/bitnamicharts/postgresql:16.5.4
Digest: sha256:a724fb4529ffca602734350335fa45ae3ecf8bfb7f8a77bd23e82d9fee132940
Deleting outdated charts
```

- We need to upgrade the `jobber` charts.

```bash
helm upgrade jobber ./charts/jobber --namespace jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Tue Mar 25 05:31:56 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 8
TEST SUITE: None
```

- We need to ensure the `postgresql` pod is running.

```bash
kubectl get po -n postgresql
NAME                  READY   STATUS    RESTARTS   AGE
jobber-postgresql-0   1/1     Running   0          91s
```

- We need to ensure that the `jobber` pods are running.

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS   AGE
auth-5f5bd4f9-5xfb5         1/1     Running   0          10h
executor-694b7675b4-mttn8   1/1     Running   0          10h
jobs-564f8fd655-wt52x       1/1     Running   0          10h
products-6ccbc7f7c6-r9jll   1/1     Running   0          94s
```

- We should check the logs of the `products` service to ensure that it is running.

```bash
kubectl logs products-6ccbc7f7c6-r9jll -n jobber
Defaulted container "products" out of: products, drizzle-migrate (init)
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"ConfigHostModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"DatabaseModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"CategoriesModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742917131671,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"InstanceLoader","msg":"ProductsModule dependencies initialized"}
{"level":40,"time":1742917131672,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":40,"time":1742917131672,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":30,"time":1742917131672,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"RoutesResolver","msg":"ProductsController {/api}:"}
{"level":30,"time":1742917131672,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"NestApplication","msg":"Nest application successfully started"}
{"level":30,"time":1742917131672,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","msg":"🚀 Application is running on: http://localhost:3003/api"}
{"level":30,"time":1742917131732,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"NestMicroservice","msg":"Nest microservice successfully started"}
```

- We should check the services to ensure that they are running.

```bash
kubectl get svc -n jobber
NAME        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
auth-grpc   ClusterIP   10.102.190.3     <none>        5000/TCP   3d22h
auth-http   ClusterIP   10.100.168.38    <none>        3000/TCP   3d22h
jobs        ClusterIP   10.107.128.185   <none>        3001/TCP   3d22h
products    ClusterIP   10.96.223.249    <none>        5001/TCP   10h
```

- We are going to test the `services` by using `minikube service` command.

```bash
minikube service auth-http -n jobber
|-----------|-----------|-------------|--------------|
| NAMESPACE |   NAME    | TARGET PORT |     URL      |
|-----------|-----------|-------------|--------------|
| jobber    | auth-http |             | No node port |
|-----------|-----------|-------------|--------------|
😿  service jobber/auth-http has no node port
❗  Services [jobber/auth-http] have type "ClusterIP" not meant to be exposed, however for local development minikube allows you to access this !
🏃  Starting tunnel for service auth-http.
|-----------|-----------|-------------|------------------------|
| NAMESPACE |   NAME    | TARGET PORT |          URL           |
|-----------|-----------|-------------|------------------------|
| jobber    | auth-http |             | http://127.0.0.1:39407 |
|-----------|-----------|-------------|------------------------|
🎉  Opening service jobber/auth-http in default browser...
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
Opening in existing browser session.
```

- Using `Altair GraphQL Client` I can run this `mutation` to create a new user.

```graphql
mutation {
  upsertUser(upsertUserInput: { email: "my-email2@msn.com", password: "MyPassword1!" }) {
    id
    email
    createdAt
    updatedAt
  }
}
```

- And I get this response.

```json
{
  "data": {
    "upsertUser": {
      "id": "1",
      "email": "my-email2@msn.com",
      "createdAt": "2025-03-25T16:03:44.156Z",
      "updatedAt": "2025-03-25T16:03:44.156Z"
    }
  }
}
```

- And we can authenticate with the `auth` service.

```graphql
mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword1!" }) {
    accessToken
  }
}
```

- And we get this response.

```json
{
  "data": {
    "login": {
      "id": "1"
    }
  }
}
```

- We can also run the `jobs` service by using `minikube service` command.

```bash
minikube service jobs -n jobber
|-----------|------|-------------|--------------|
| NAMESPACE | NAME | TARGET PORT |     URL      |
|-----------|------|-------------|--------------|
| jobber    | jobs |             | No node port |
|-----------|------|-------------|--------------|
😿  service jobber/jobs has no node port
❗  Services [jobber/jobs] have type "ClusterIP" not meant to be exposed, however for local development minikube allows you to access this !
🏃  Starting tunnel for service jobs.
|-----------|------|-------------|------------------------|
| NAMESPACE | NAME | TARGET PORT |          URL           |
|-----------|------|-------------|------------------------|
| jobber    | jobs |             | http://127.0.0.1:44407 |
|-----------|------|-------------|------------------------|
🎉  Opening service jobber/jobs in default browser...
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
Opening in existing browser session.
```

- We can modify the `job.http` file to use the `jobs` service with that url.

```http
# @urlRest = http://localhost:3001/api
@urlRest = http://127.0.0.1:44407/api

### Upload file
POST {{urlRest}}/uploads/upload
Content-Type: multipart/form-data ; boundary=MfnBoundry

--MfnBoundry
Content-Disposition: form-data; name="file"; filename="products.json"
Content-Type: application/json

< ./data/products.json

--MfnBoundry--
```

- And We get this response.

```json
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 87
ETag: W/"57-69g2+XvM3LnlOxA/gR0LatrtY10"
Date: Tue, 25 Mar 2025 16:35:42 GMT
Connection: close

{
  "message": "File uploaded successfully",
  "filename": "file-1742920542750-107924662.json"
}
```

- We can run the following mutation to create a product job.

```graphql
mutation {
  executeJob(executeJobInput: { name: "LoadProducts", data: { fileName: "file-1742920542750-107924662.json" } }) {
    name
  }
}
```

- And we get this response.

```json
{
  "data": {
    "executeJob": {
      "name": "LoadProducts"
    }
  }
}
```

- We can check teh logs for the products service to ensure that the job is running.

```bash
kubectl logs products-6ccbc7f7c6-r9jll -n jobber
.
{"level":30,"time":1742921089175,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"GrpcLoggingInterceptor","requestId":"78b5b85e-d8ae-4abb-b73b-0135d231b83a","handler":"createProduct","duration":"2ms"}
{"level":30,"time":1742921089178,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"GrpcLoggingInterceptor","requestId":"627386ed-0973-42e2-b3b6-59571adfa7e9","handler":"createProduct","args":{"name":"Yoga Mat","category":"Sports & Outdoors","price":246.14999389648438,"stock":252,"rating":4.599999904632568,"description":"Non-slip yoga mat with extra cushioning for comfort during workouts."}}
{"level":30,"time":1742921089180,"pid":1,"hostname":"products-6ccbc7f7c6-r9jll","context":"GrpcLoggingInterceptor","requestId":"627386ed-0973-42e2-b3b6-59571adfa7e9","handler":"createProduct","duration":"2ms"}
.
```

- We are going to check the `postgresql` database to ensure that the products are created.

```bash
kubectl get po -n postgresql
NAME                  READY   STATUS    RESTARTS   AGE
jobber-postgresql-0   1/1     Running   0          11h
kubectl exec --stdin --tty jobber-postgresql-0 -n postgresql -- sh
$ psql -U postgres -d products
Password for user postgres:
psql (17.4)
Type "help" for help.

products=# SELECT * FROM products;
   id   |             name             |     category      |   price   | stock | rating |                                   description

--------+------------------------------+-------------------+-----------+-------+--------+------------------------------------------------------------
---------------------
      1 | Yoga Mat                     | Sports & Outdoors |    114.53 |   220 |      4 | Non-slip yoga mat with extra cushioning for comfort during
workouts.
      2 | Stainless Steel Water Bottle | Home & Kitchen    |       129 |   234 |    3.4 | Keeps beverages hot or cold for hours, perfect for outdoor
activities.
      3 | LED Desk Lamp                | Home & Kitchen    |    129.47 |   171 |      3 | Energy-efficient LED desk lamp with adjustable brightness l
evels.
      4 | Smart Watch                  | Electronics       |      42.5 |    75 |    4.6 | Track your fitness, receive notifications, and more with th
is sleek smartwatch.
      5 | Portable Charger             | Electronics       |      65.9 |   176 |    4.9 | Compact and powerful portable charger for your devices on t
he go.
      6 | Adjustable Office Chair      | Furniture         |     65.45 |   124 |    3.2 | Ergonomic office chair with adjustable height and lumbar su
pport.
      7 | LED Desk Lamp                | Home & Kitchen    |     170.6 |   250 |    3.7 | Energy-efficient LED desk lamp with adjustable brightness l
evels.
      8 | Bluetooth Headphones         | Electronics       | 33.780003 |   107 |    4.3 | Noise-cancelling over-ear Bluetooth headphones with premium
 sound quality.
      9 | Organic Coffee Beans         | Grocery           |    223.77 |    31 |      3 | Premium organic coffee beans for the perfect cup of coffee
every time.
     10 | LED Desk Lamp                | Home & Kitchen    |    204.51 |   173 |    4.8 | Energy-efficient LED desk lamp with adjustable brightness l
evels.
     11 | Running Shoes                | Apparel           |    218.09 |   251 |    4.8 | Lightweight and comfortable running shoes with excellent gr
ip.
     12 | Wireless Mouse               | Electronics       |     85.53 |   103 |    4.6 | A comfortable wireless mouse with ergonomic design and long
 battery life.
```

### 12.18 Creating a Jobs Volume

- If we delete the `jobs` pod, the job will be lost.
- Even though the `jobs` pod is recreated, the job will be lost.
- So, if we try to execute the same job again, to process the same file, it will fail.
- So, we need to create a volume that persists beyond the life of the `jobs` pod.
- The same way we have volumes for the `postgresql` and `pulsar` we can have a volume for the `jobs` service.

```bash
kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS     CLAIM                                                           STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-30631bbf-acf9-4cac-b499-f053403b61bc   50Gi       RWO            Delete           Bound      pulsar/jobber-pulsar-bookie-ledgers-jobber-pulsar-bookie-0      standard       <unset>                          4d9h
pvc-32107c69-0f1d-4f95-b338-7320c2efe80e   20Gi       RWO            Delete           Bound      pulsar/jobber-pulsar-zookeeper-data-jobber-pulsar-zookeeper-0   standard       <unset>                          4d9h
pvc-6be8fa39-b46b-4f41-aa8d-630afafb66d0   8Gi        RWO            Delete           Released   postgresql/data-jobber-postgresql-0                             standard       <unset>                          4d9h
pvc-b71c5084-ac7c-44bb-bb99-82a9af3edf9e   8Gi        RWO            Delete           Bound      postgresql/data-jobber-postgresql-0                             standard       <unset>                          11h
pvc-e0408e9b-bf05-47f9-9373-0966e3bebf49   10Gi       RWO            Delete           Bound      pulsar/jobber-pulsar-bookie-journal-jobber-pulsar-bookie-0      standard       <unset>                          4d9h
```

- We need to create a `pvc.yaml` file to create a volume for the `jobs` service.

> charts/jobber/templates/jobs/pvc.yaml

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: uploads-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
```

- We need to update the `deployment.yaml` file to use the `pvc` volume.

> charts/jobber/templates/jobs/deployment.yaml

```diff
{{- if .Values.jobs.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobs
  labels:
    app: jobs
spec:
  replicas: {{ .Values.jobs.replicas }}
  selector:
    matchLabels:
      app: jobs
  template:
    metadata:
      labels:
        app: jobs
    spec:
      containers:
        - name: jobs
          image: {{ .Values.jobs.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
+         volumeMounts:
+           - name: uploads-volume
+             mountPath: /app/apps/jobs/uploads
          ports:
            - containerPort: {{ .Values.jobs.port }}
          env:
            {{- include "common.env" . | nindent 12 }}
            - name: AUTH_GRPC_SERVICE_URL
              value: "auth-grpc:{{ .Values.auth.port.grpc }}"
            - name: PORT
              value: "{{ .Values.jobs.port }}"
            - name: JOBS_GRPC_SERVICE_URL
              value: "0.0.0.0:{{ .Values.jobs.port }}"
+     volumes:
+       - name: uploads-volume
+         persistentVolumeClaim:
+           claimName: uploads-pvc
{{- end }}
```

- We need to upgrade the helm chart to ensure that the `pvc` volume is created.

```bash
helm upgrade jobber ./charts/jobber --namespace jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Tue Mar 25 17:18:29 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 18
TEST SUITE: None
```

- We can check the pods to ensure the `jobs` pod is created with success:

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS   AGE
auth-5f5bd4f9-5xfb5         1/1     Running   0          11h
executor-694b7675b4-mttn8   1/1     Running   0          11h
jobs-7c8ff99849-hp798       1/1     Running   0          68s
products-6ccbc7f7c6-r9jll   1/1     Running   0          100m
```

- We are going to upload a file to the `jobs` service.

```http
@urlRest = http://127.0.0.1:44407/api

### Upload file
POST {{urlRest}}/uploads/upload
Content-Type: multipart/form-data ; boundary=MfnBoundry

--MfnBoundry
Content-Disposition: form-data; name="file"; filename="products.json"
Content-Type: application/json

< ./data/products.json

--MfnBoundry--
```

- And we get this response.

```json
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 86
ETag: W/"56-xf2A8/jIhWlsgdFX2VplOdTIH/8"
Date: Tue, 25 Mar 2025 17:23:42 GMT
Connection: close

{
  "message": "File uploaded successfully",
  "filename": "file-1742923422451-92071658.json"
}
```

- If we execute the mutations from the `Altair GraphQL Client` we can see the job is created.

```graphql
mutation {
  executeJob(executeJobInput: { name: "LoadProducts", data: { fileName: "file-1742923422451-92071658.json" } }) {
    name
  }
}
```

- And we get this response.

```json
{
  "data": {
    "executeJob": {
      "name": "LoadProducts"
    }
  }
}
```

- We are going to scale the `jobs` service to 5 replicas to ensure we can create the job again.

```bash
kubectl scale deployment jobs -n jobber --replicas 5
deployment.apps/jobs scaled
```

- We can check the pods to ensure the `jobs` pod is created with success:

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS   AGE
auth-5f5bd4f9-5xfb5         1/1     Running   0          11h
executor-694b7675b4-mttn8   1/1     Running   0          11h
jobs-7c8ff99849-dzb6z       1/1     Running   0          21s
jobs-7c8ff99849-hp798       1/1     Running   0          9m57s
jobs-7c8ff99849-n7drz       1/1     Running   0          21s
jobs-7c8ff99849-vvt6f       1/1     Running   0          21s
jobs-7c8ff99849-whnjz       1/1     Running   0          21s
products-6ccbc7f7c6-r9jll   1/1     Running   0          109m
```

- We can try to go inside of of the `jobs` pod to ensure the `uploads` volume is created.

```bash
kubectl exec --stdin --tty jobs-7c8ff99849-n7drz -n jobber -- sh
# cd apps
# cd jobs
# cd uploads
# ls
file-1742923422451-92071658.json
```

- We can see the file is uploaded to the `uploads` volume.
- We can check the pvc for the jobber namespace.

```bash
kubectl get pvc -n jobber
NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
uploads-pvc   Bound    pvc-4ca1e54a-c71c-402e-b099-5860bc86d927   5Gi        RWX            standard       <unset>                 14m
```
