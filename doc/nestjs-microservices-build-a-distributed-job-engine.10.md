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
```
