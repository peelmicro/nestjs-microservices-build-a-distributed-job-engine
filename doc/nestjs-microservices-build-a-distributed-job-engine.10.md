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

## 13 Tracking Job Status

- We are going to add the ability to track the status of a job that has been executed.

### 13.1 Adding Jobs to the Database by using Prisma

- We need to modify the `.env` file to create the correct database url.

> apps/jobs/.env

```text
.
DATABASE_URL=postgresql://postgres:example@localhost:5432/jobs?schema=public
```

- We are going to create a new Prisma model to track the status of a job.

> apps/jobs/prisma/schema.prisma

```prisma
generator client {
    provider = "prisma-client-js"
    binaryTargets = ["native", "debian-openssl-1.1.x"]
    output = "../../../node_modules/@prisma-clients/jobs"
}

datasource db {
    provider = "postgresql"
    url = env("DATABASE_URL")
}

model Job {
   id Int @default(autoincrement()) @id
   name String
   size Int
   completed Int
   status String
   started DateTime @default(now())
   ended DateTime?
}
```

- We need to update the `project.json` file to add the `generate-prisma` and `migrate-prisma` scripts.

> apps/jobs/project.json

```diff
{
  "name": "jobs",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/jobs/src",
  "projectType": "application",
  "tags": [],
  "targets": {
+   "build": {
+     "dependsOn": ["generate-prisma", "^build"]
+   },
+   "test": {
+     "dependsOn": ["generate-prisma"]
+   },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
        "buildTarget": "jobs:build",
        "runBuildTargetDependencies": false
      },
      "configurations": {
        "development": {
          "buildTarget": "jobs:build:development"
        },
        "production": {
          "buildTarget": "jobs:build:production"
        }
      }
    },
+   "generate-prisma": {
+     "command": "prisma generate",
+     "options": {
+       "cwd": "{projectRoot}",
+       "input": ["prisma/schema.prisma"]
+     },
+     "cache": true
+   },
+   "migrate-prisma": {
+     "command": "prisma migrate dev",
+     "options": {
+       "cwd": "{projectRoot}"
+     }
+   }
+ }
}
```

- We need to run the `generate-prisma` script to create the pg script to create the database and table.

```bash
 nx generate-prisma jobs

> nx run jobs:generate-prisma

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/jobs in 89ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate-prisma for project jobs (1s)
```

- We need to run the `migrate-prisma` script to create the database.

```bash
nx migrate-prisma jobs

> nx run jobs:migrate-prisma

> prisma migrate dev

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "jobs", schema "public" at "localhost:5432"

? Enter a name for the new migration: › create-jobs-table
```

> Note: It is not working because it ends up hanging.

- We need to create the migration manually.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/jobs$ npx prisma migrate dev --name initial
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "jobs", schema "public" at "localhost:5432"

Applying migration `20250326172346_initial`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250326172346_initial/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/jobs in 96ms
```

### 13.2 Saving the Job to Jobs table

- We are going to create a new prisma service to save the job to the database.

> apps/jobs/src/app/prisma/prisma.service.ts

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/jobs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- We need to create the `app.module.ts` file to use the `PrismaService` service.

> apps/jobs/src/app/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- We need to update the `app.module.ts` file to use the `PrismaModule` module.

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
+import { PrismaModule } from './prisma/prisma.module';
@Module({
  imports: [
    LoggerModule,
    UploadsModule,
+   PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JobsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      plugins: [new GqlLoggingPlugin()],
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

- We are going to create an enum to track the status of a job.

> apps/jobs/src/app/models/job-status.enum.ts

```typescript
export enum JobStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
```

- We need to update the `AbstractJob` class to save the job to the database.

> apps/jobs/src/app/jobs/abstract.job.ts

```typescript
import { Producer } from 'pulsar-client';
import { PulsarClient, serialize } from '@jobber/pulsar';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '../models/job-status.enum';
export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  protected abstract messageClass: new () => T;

  constructor(
    private readonly pulsarClient: PulsarClient,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(data: T, name: string) {
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(name);
    }
    const job = await this.prismaService.job.create({
      data: {
        name,
        size: Array.isArray(data) ? data.length : 1,
        completed: 0,
        status: JobStatus.IN_PROGRESS,
      },
    });
    if (Array.isArray(data)) {
      for (const message of data) {
        this.send({ ...message, jobId: job.id });
      }
      return job;
    }
    this.send({ ...data, jobId: job.id });
    return job;
  }

  private send(data: T) {
    this.validateData(data).then(() => this.producer.send({ data: serialize(data) }));
  }

  private async validateData(data: T) {
    const errors = await validate(plainToInstance(this.messageClass, data));
    if (errors.length) {
      throw new BadRequestException(`Job data is invalid: ${JSON.stringify(errors, null, 2)}`);
    }
  }
}
```

- We need to update the Jobs classes to update the job status when the job is completed.

> apps/jobs/src/app/jobs/fibonacci/fibonacci.job.ts

```typescript
import { PulsarClient, FibonacciMessage } from '@jobber/pulsar';
import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract.job';
import { Jobs } from '@jobber/nestjs';
import { PrismaService } from '../../prisma/prisma.service';
@Job({
  name: Jobs.FIBONACCI,
  description: 'Generate a Fibonacci sequence and store it in the DB.',
})
export class FibonacciJob extends AbstractJob<FibonacciMessage> {
  protected messageClass = FibonacciMessage;
  constructor(pulsarClient: PulsarClient, prismaService: PrismaService) {
    super(pulsarClient, prismaService);
  }
}
```

> apps/jobs/src/app/jobs/products/load-products.job.ts

```typescript
import { Jobs } from '@jobber/nestjs';
import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract.job';
import { LoadProductsMessage, PulsarClient } from '@jobber/pulsar';
import { PrismaService } from '../../prisma/prisma.service';

@Job({
  name: Jobs.LOAD_PRODUCTS,
  description: 'Loads uploaded product data into the DB after enrichment.',
})
export class LoadProductsJob extends AbstractJob<LoadProductsMessage> {
  protected messageClass = LoadProductsMessage;

  constructor(pulsarClient: PulsarClient, prismaService: PrismaService) {
    super(pulsarClient, prismaService);
  }
}
```

- We need to update the `jobs.module.ts` file to use the `PrismaModule` module.

> apps/jobs/src/app/jobs.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Packages } from '@jobber/grpc';
import { join } from 'path';
import { PulsarModule } from '@jobber/pulsar';
import { LoadProductsJob } from './jobs/products/load-products.job';
import { PrismaModule } from './prisma/prisma.module';
@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    PulsarModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: Packages.AUTH,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: Packages.AUTH,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver, LoadProductsJob],
})
export class JobsModule {}
```

### 13.3 Acknowledging a Job

#### 13.3.1 Creating the proto file for the `jobs` service

- We need to create a new proto file for the `jobs` service.

> apps/grpc/src/lib/proto/jobs.proto

```proto
syntax = "proto3";

package jobs;

service JobsService {
    rpc Acknowledge(AcknowledgeRequest) returns (AcknowledgeResponse) {}
}

message AcknowledgeRequest {
    int32 jobId = 1;
}

message AcknowledgeResponse {}
```

- As the `monorepo` is running, the `jobs.type.ts` document has been generated automatically.

> apps/grpc/src/lib/types/proto/jobs.ts

```typescript
// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v3.20.3
// source: jobs.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from '@bufbuild/protobuf/wire';
import { type handleUnaryCall, type UntypedServiceImplementation } from '@grpc/grpc-js';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export interface AcknowledgeRequest {
  jobId: number;
}

export interface AcknowledgeResponse {}

function createBaseAcknowledgeRequest(): AcknowledgeRequest {
  return { jobId: 0 };
}

export const AcknowledgeRequest: MessageFns<AcknowledgeRequest> = {
  encode(message: AcknowledgeRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.jobId !== 0) {
      writer.uint32(8).int32(message.jobId);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): AcknowledgeRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAcknowledgeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.jobId = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

function createBaseAcknowledgeResponse(): AcknowledgeResponse {
  return {};
}

export const AcknowledgeResponse: MessageFns<AcknowledgeResponse> = {
  encode(_: AcknowledgeResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): AcknowledgeResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAcknowledgeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
};

export interface JobsServiceClient {
  acknowledge(request: AcknowledgeRequest): Observable<AcknowledgeResponse>;
}

export interface JobsServiceController {
  acknowledge(request: AcknowledgeRequest): Promise<AcknowledgeResponse> | Observable<AcknowledgeResponse> | AcknowledgeResponse;
}

export function JobsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['acknowledge'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod('JobsService', method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod('JobsService', method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const JOBS_SERVICE_NAME = 'JobsService';

export type JobsServiceService = typeof JobsServiceService;
export const JobsServiceService = {
  acknowledge: {
    path: '/jobs.JobsService/Acknowledge',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AcknowledgeRequest) => Buffer.from(AcknowledgeRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AcknowledgeRequest.decode(value),
    responseSerialize: (value: AcknowledgeResponse) => Buffer.from(AcknowledgeResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => AcknowledgeResponse.decode(value),
  },
} as const;

export interface JobsServiceServer extends UntypedServiceImplementation {
  acknowledge: handleUnaryCall<AcknowledgeRequest, AcknowledgeResponse>;
}

interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
}
```

- We just need to update the `index.ts` file to include the `JobsService`.

> libs/grpc/src/lib/types/proto/index.ts

```ts
export * from './auth';
export * from './products';
export * from './jobs';
```

#### 13.3.2 Updating the `jobs.service.ts` file

- We need to update the `jobs.service.ts` file to use the `PrismaService` service to include the `acknowledge` method and update the job status when the job is completed.

> apps/jobs/src/app/jobs.service.ts

```typescript
import { DiscoveredClassWithMeta, DiscoveryService } from '@golevelup/nestjs-discovery';
import { BadRequestException, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { JOB_METADATA_KEY } from './decorators/job.decorator';
import { JobMetadata } from './interfaces/job-metadata.interface';
import { AbstractJob } from './jobs/abstract.job';
import { readFileSync } from 'fs';
import { UPLOAD_FILE_PATH } from './uploads/upload';
import { PrismaService } from './prisma/prisma.service';
import { JobStatus } from './models/job-status.enum';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobMetadata>[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    this.jobs = await this.discoveryService.providersWithMetaAtKey<JobMetadata>(JOB_METADATA_KEY);
  }

  getJobsMetadata() {
    return this.jobs.map((job) => job.meta);
  }

  async getJob(id: number) {
    return this.prismaService.job.findUnique({
      where: { id },
    });
  }

  async getJobs() {
    return this.prismaService.job.findMany();
  }

  async executeJob(name: string, data?: any) {
    const job = this.jobs.find((job) => job.meta.name === name);
    if (!job) {
      throw new BadRequestException(`Job with name ${name} not found`);
    }
    if (!(job.discoveredClass.instance instanceof AbstractJob)) {
      throw new InternalServerErrorException('Job is not an instance of AbstractJob.');
    }
    return job.discoveredClass.instance.execute(data?.fileName ? this.getFile(data.fileName) : data || {}, job.meta.name);
  }

  getJobByName(name: string) {
    const job = this.jobs.find((job) => job.meta.name === name);
    if (!job) {
      throw new BadRequestException(`Job with name ${name} not found`);
    }

    // Return a Job object with the metadata
    return {
      name: job.meta.name,
      description: job.meta.description,
    };
  }

  async acknowledge(jobId: number) {
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException(`Job with ID ${jobId} does not exist.`);
    }

    if (job.ended) {
      return;
    }

    const updatedJob = await this.prismaService.job.update({
      where: { id: jobId },
      data: { completed: { increment: 1 } },
    });

    if (updatedJob.completed === job.size) {
      await this.prismaService.job.update({
        where: { id: jobId },
        data: { status: JobStatus.COMPLETED, ended: new Date() },
      });
    }

    return updatedJob;
  }

  private getFile(fileName?: string) {
    if (!fileName) {
      return;
    }
    try {
      return JSON.parse(readFileSync(`${UPLOAD_FILE_PATH}/${fileName}`, 'utf-8'));
    } catch (err) {
      throw new InternalServerErrorException(`Failed to read file: ${fileName}`);
    }
  }
}
```

#### 13.3.3 Creating the `jobs.controller.ts` file

- We need to create the new `jobs.controller.ts` file.

> apps/jobs/src/app/jobs.controller.ts

```typescript
import { AcknowledgeRequest, JobsServiceController, JobsServiceControllerMethods } from '@jobber/grpc';
import { Controller } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller()
@JobsServiceControllerMethods()
export class JobsController implements JobsServiceController {
  constructor(private readonly jobsService: JobsService) {}

  async acknowledge(request: AcknowledgeRequest) {
    await this.jobsService.acknowledge(request.jobId);
  }
}
```

#### 13.3.4 Updating the `jobs.module.ts` file

- We need to update the `jobs.module.ts` file to include the `JobsController`.

> apps/jobs/src/app/jobs.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Packages } from '@jobber/grpc';
import { join } from 'path';
import { PulsarModule } from '@jobber/pulsar';
import { LoadProductsJob } from './jobs/products/load-products.job';
import { PrismaModule } from './prisma/prisma.module';
import { JobsController } from './jobs.controller';
@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    PulsarModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: Packages.AUTH,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: Packages.AUTH,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [JobsController],
  providers: [FibonacciJob, JobsService, JobsResolver, LoadProductsJob],
})
export class JobsModule {}
```

#### 13.3.5 Updating the `main.ts` file

- We need to update the `.env` file to include the `JOBS_GRPC_SERVICE_URL` environment variable.

> apps/jobs/.env

```text
.
JOBS_GRPC_SERVICE_URL=localhost:5002
```

- We need to update the `main.ts` file to include the gRPC microservice.

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
  await init(app);
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

### 13.4 Updating the Executor Service to implement the call to the `acknowledge` method

#### 13.4.1 Creating the `job-clients.module.ts` file

- We need to modify the `.env` file to include the `JOBS_GRPC_SERVICE_URL` environment variable.

> apps/executor/.env

```text
.
JOBS_GRPC_SERVICE_URL=localhost:5002
```

- We need to create the `job-clients.module.ts` file that is going to provide the clients access for the `jobs` gRPC service.

> apps/executor/src/app/jobs/job-clients.module.ts

```typescript
import { Packages } from '@jobber/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: Packages.JOBS,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('JOBS_GRPC_SERVICE_URL'),
            package: Packages.JOBS,
            protoPath: join(__dirname, '../../libs/grpc/proto/jobs.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class JobClientsModule {}
```

- We need to update the `jobs.module.ts` file to include the `JobClientsModule`.

> apps/executor/src/app/jobs/jobs.module.ts

```typescript
import { PulsarModule } from '@jobber/pulsar';
import { Module } from '@nestjs/common';
import { FibonacciConsumer } from './fibonacci/fibonacci.consumer';
import { LoadProductModule } from './products/load-products.module';
import { JobClientsModule } from './job-clients.module';

@Module({
  imports: [PulsarModule, LoadProductModule, JobClientsModule],
  providers: [FibonacciConsumer],
})
export class JobsModule {}
```

- We need to update the `LoadProductModule` to include the `JobClientsModule`.

> apps/executor/src/app/products/load-products.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LoadProductsConsumer } from './load-products.consumer';
import { PulsarModule } from '@jobber/pulsar';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Packages } from '@jobber/grpc';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { JobClientsModule } from '../job-clients.module';
@Module({
  imports: [
    PulsarModule,
    JobClientsModule,
    ClientsModule.registerAsync([
      {
        name: Packages.PRODUCTS,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('PRODUCTS_GRPC_SERVICE_URL'),
            package: Packages.PRODUCTS,
            protoPath: join(__dirname, '../../libs/grpc/proto/products.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [LoadProductsConsumer],
})
export class LoadProductModule {}
```

#### 13.4.2 Creating the `jobs.consumer.ts` file

- We need to create the `jobs.consumer.ts` file that is going to be used as an abstract class to consume the `jobs` service.

> apps/executor/src/app/jobs/jobs.consumer.ts

```typescript
import { AcknowledgeRequest, JOBS_SERVICE_NAME, JobsServiceClient } from '@jobber/grpc';
import { PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export abstract class JobConsumer<T extends AcknowledgeRequest> extends PulsarConsumer<T> {
  private jobsService: JobsServiceClient;

  constructor(
    topic: string,
    pulsarClient: PulsarClient,
    private readonly grpcClient: ClientGrpc,
  ) {
    super(pulsarClient, topic);
  }

  async onModuleInit(): Promise<void> {
    this.jobsService = this.grpcClient.getService<JobsServiceClient>(JOBS_SERVICE_NAME);
    await super.onModuleInit();
  }

  protected async onMessage(data: T): Promise<void> {
    await this.execute(data);
    await firstValueFrom(this.jobsService.acknowledge(data));
  }

  protected abstract execute(data: T): Promise<void>;
}
```

#### 13.4.4 Updating the `fibonacci.consumer.ts` file

- We need to update the `fibonacci.consumer.ts` file to extend the `JobConsumer` class.

> apps/executor/src/app/jobs/fibonacci/fibonacci.consumer.ts

```typescript
iimport { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Jobs } from '@jobber/nestjs';
import { FibonacciMessage, PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { iterate } from 'fibonacci';
import { Packages } from '@jobber/grpc';
import { ClientGrpc } from '@nestjs/microservices';
import { JobConsumer } from '../job.consumer';
@Injectable()
export class FibonacciConsumer
  extends JobConsumer<FibonacciMessage>
  implements OnModuleInit
{
  constructor(
    pulsarClient: PulsarClient,
    @Inject(Packages.JOBS) clientJobs: ClientGrpc
  ) {
    super(Jobs.FIBONACCI, pulsarClient,  clientJobs);
  }

  protected async execute(data: FibonacciMessage): Promise<void> {
    const result = iterate(data.iterations);
    this.logger.log(result);
  }
}
```

#### 13.4.5 Updating the `jobs.consumer.ts` file

- We need to update the `jobs.consumer.ts` file to extend the `JobConsumer` class.

> apps/executor/src/app/jobs/jobs.consumer.ts

```typescript
import { Packages, PRODUCTS_SERVICE_NAME, ProductsServiceClient } from '@jobber/grpc';
import { Jobs } from '@jobber/nestjs';
import { LoadProductsMessage, PulsarClient } from '@jobber/pulsar';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JobConsumer } from '../job.consumer';

@Injectable()
export class LoadProductsConsumer extends JobConsumer<LoadProductsMessage> implements OnModuleInit {
  private productsService: ProductsServiceClient;

  constructor(
    pulsarClient: PulsarClient,
    @Inject(Packages.JOBS) clientJobs: ClientGrpc,
    @Inject(Packages.PRODUCTS) private clientProducts: ClientGrpc,
  ) {
    super(Jobs.LOAD_PRODUCTS, pulsarClient, clientJobs);
  }

  async onModuleInit() {
    this.productsService = this.clientProducts.getService<ProductsServiceClient>(PRODUCTS_SERVICE_NAME);
    await super.onModuleInit();
  }

  protected async execute(data: LoadProductsMessage) {
    await firstValueFrom(this.productsService.createProduct(data));
  }
}
```

### 13.5 Ensuring the system is working as expected

- We need to ensure the system is working as expected by starting the `jobs` and `executor` services and sending a message to the `LoadProducts` job.

> apps/jobs/src/app/job.http

```http
### Execute Load Products job with one filename
POST {{url}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "LoadProducts", data: {fileName: "file-1742659574274-319632607.json"}}) {
    name
  }
}
```

- We receive the following response:

```json
HTTP/1.1 200 OK
X-Powered-By: Express
cache-control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 48
ETag: W/"30-/M4kLcVyISYwL5nFCGTaXBJBQDM"
Date: Thu, 27 Mar 2025 11:00:45 GMT
Connection: close

{
  "data": {
    "executeJob": {
      "name": "LoadProducts"
    }
  }
}
```

- We can see the job are executing by checking the `jobs` table in the database:

![Jobs Table in Progress](images043.png)

- We can see the job when it is finished by checking the `jobs` table in the database:

![Jobs Table in Progress](images044.png)

### 13.6 Updating the Jobs Docker to include Prisma

- We need to update the `Dockerfile` to include Prisma.

> apps/jobs/Dockerfile

```diff
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
+COPY --from=builder /workspace/apps/jobs/prisma ./apps/jobs/prisma
COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json
COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json

ENV NODE_ENV=production

RUN npm ci --legacy-peer-deps

+COPY --from=builder /workspace/node_modules/@prisma-clients/jobs/ ./node_modules/@prisma-clients/jobs/
COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/jobs/main"]
```
