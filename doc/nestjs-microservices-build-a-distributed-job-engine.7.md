# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 7)

## 11. Setting up the Kubernetes

### 11.1. Signing up for ECR (Elastic Container Registry)

- We are going to sign up for ECR to store our Docker images.
- We need to create a new account in AWS and get the credentials.
- We need to log in to the AWS console, then search for ECR and select `Elastic Container Registry`.

![Login to AWS - ECR](image013.png)

- We need to create a new repository by clicking on `Create a repository`.

![Create a new repository](image014.png)

- We need to give the repository a name, in this case `jobber/jobs`.
- Leave the rest of the defaults and click on `Create`.

![Create a new repository](image015.png)

- We can see the repository we just created.

![Create a new repository](image016.png)

- We can see the command to push the image to the repository.

![Create a new repository](image017.png)

- We are going to create additional repositories for the `executor` and `auth` services.

![Created new repositories](image018.png)

### 11.2. Setting up the GitHub Actions to build and push the Docker images

#### 11.2.1. Getting the credentials for the AWS ECR repository

- We need to get the credentials for the AWS ECR repository.
- We have to access `Security Credentials` in the AWS console.

![Security Credentials](image019.png)

- We need to click on `Create access key`.

![Create access key](image020.png)

- We need to click on `Create access key` again.

![Create access key](image021.png)

- We need to copy the `Access key ID` and `Secret access key` and paste them in the secure place.

![Create access key](image022.png)

#### 11.2.2. Setting up the credentials in the GitHub repository

- We need to go to the GitHub repository and click on `Settings`.

![Settings](image023.png)

- We need to click on the `New repository secret` to add the credentials.

![New repository secret](image024.png)

- We need to add the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as the secrets.

![New repository secret](image025.png)

- We can see the secrets we just added.

![New repository secret](image026.png)

- We could also add the `AWS_REGION` as the secret.
- We can get the region from the AWS console.

![AWS Region](image027.png)

- We could also add the `AWS_PASSWORD_STDIN` as the secret.
- We can get the password from `View push command` in the ECR repository.

![View push command](image028.png)

- We can see now of the secrets we have added.

![New repository secret](image029.png)

#### 11.2.3. Setting up the GitHub Actions workflow

- We need to update the `ci.yml` workflow file in the `.github/workflows` directory.

> .github/workflows/ci.yml

```yaml
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

      # - run: npm ci --legacy-peer-deps

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

      - name: Setup protoc
        uses: arduino/setup-protoc@v3.0.0

      # - run: npm install -g npm-check-updates
      # - run: ncu -u
      - run: npm ci --legacy-peer-deps

      # This could be not needed, because we are not going to use Nx Cloud
      # - uses: nrwl/nx-set-shas@v4
      #   with:
      #     main-branch-name: main
      #     set-environment-variables-for-job: true
      #     error-on-no-successful-workflow: false

      # Prepend any command with "nx-cloud record --" to record its logs to Nx Cloud
      # - run: npx nx-cloud record -- echo Hello World
      # Nx Affected runs only tasks affected by the changes in this PR/commit. Learn more: https://nx.dev/ci/features/affected
      # - run: npx nx affected -t lint test build # This is not needed, because we are not using Nx Cloud
      - run: npx nx run-many --targets=lint,test,build --all # Run on ALL projects, this is a better approach than nx affected if we don't use Nx Cloud
        env:
          NX_VERBOSE_LOGGING: 'true'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Log in to Amazon ECR
        run: |
          aws ecr get-login-password --region ${{ secrets.AWS_REGION }} | docker login --username AWS --password-stdin ${{ secrets.AWS_ECR_REGISTRY }}

      - name: Build and push all images to ECR
        run: |
          IMAGES=(
            "jobs apps/jobs/Dockerfile"
            "executor apps/executor/Dockerfile"
            "auth apps/auth/Dockerfile"
          )

          for image in "${IMAGES[@]}"; do
            NAME=$(echo $image | cut -d' ' -f1)
            DOCKERFILE=$(echo $image | cut -d' ' -f2)

            {
              docker build \
                --tag ${{ secrets.AWS_ECR_REGISTRY }}/jobber/$NAME:latest \
                -f $DOCKERFILE \
                . && docker push ${{ secrets.AWS_ECR_REGISTRY }}/jobber/$NAME:latest
            } &
          done

          wait
```

#### 11.2.4. Adding the .dockerignore file

- We need to add the `.dockerignore` file to the root of the project.

> .dockerignore

```text
node_modules
dist
```

#### 11.2.5. We need to ensure that the Docker build is successful

- We need to ensure that the Docker build is successful from the GitHub Actions workflow.

![Docker build successful](image030.png)

![Docker build successful details](image031.png)

- We can see the Docker images that were built and pushed to the ECR repository.

![Docker images](image032.png)

### 11.3. Setting up the `minikube` and `kubectl`

- We are going to use `helm` charts to manage the Kubernetes resources.
- We need to install the `minikube` and `kubectl` on our local machine.
- `minikube` is a tool that makes it easy to run a local Kubernetes cluster on macOS, Linux, and Windows.
- We can configure how to install `minikube` from the `minikube` website.

![Minikube](image033.png)

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 37.0M  100 37.0M    0     0  16.7M      0  0:00:02  0:00:02 --:--:-- 16.7M
```

- We can install the `minikube` using the `dpkg` command.

```bash
sudo dpkg -i minikube_latest_amd64.deb
[sudo] password for juanpabloperez:
Selecting previously unselected package minikube.
(Reading database ... 540450 files and directories currently installed.)
Preparing to unpack minikube_latest_amd64.deb ...
Unpacking minikube (1.35.0-0) ...
Setting up minikube (1.35.0-0) ...
```

- We can check the version of `minikube` by running the `minikube` command.

```bash
minikube version
minikube version: v1.35.0
commit: dd5d320e41b5451cdf3c01891bc4e13d189586ed-dirty
```

- We can start the `minikube` cluster by running the `minikube start` command.

```bash
minikube start
😄  minikube v1.35.0 on Ubuntu 24.04
✨  Automatically selected the docker driver. Other choices: none, ssh
📌  Using Docker driver with root privileges
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.46 ...
💾  Downloading Kubernetes v1.32.0 preload ...
    > preloaded-images-k8s-v18-v1...:  333.57 MiB / 333.57 MiB  100.00% 13.12 M
    > gcr.io/k8s-minikube/kicbase...:  500.31 MiB / 500.31 MiB  100.00% 16.05 M
🔥  Creating docker container (CPUs=2, Memory=15900MB) ...
🐳  Preparing Kubernetes v1.32.0 on Docker 27.4.1 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔗  Configuring bridge CNI (Container Networking Interface) ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
💡  kubectl not found. If you need it, try: 'minikube kubectl -- get pods -A'
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

- We can download the `kubectl` command by running the `minikube kubectl -- get pods -A` command.

```bash
 minikube kubectl -- get pods -A
    > kubectl.sha256:  64 B / 64 B [-------------------------] 100.00% ? p/s 0s
    > kubectl:  54.67 MiB / 54.67 MiB [------------] 100.00% 29.25 MiB p/s 2.1s
NAMESPACE     NAME                               READY   STATUS    RESTARTS      AGE
kube-system   coredns-668d6bf9bc-6f65f           1/1     Running   0             2m8s
kube-system   etcd-minikube                      1/1     Running   0             2m13s
kube-system   kube-apiserver-minikube            1/1     Running   0             2m13s
kube-system   kube-controller-manager-minikube   1/1     Running   0             2m13s
kube-system   kube-proxy-n4jt4                   1/1     Running   0             2m8s
kube-system   kube-scheduler-minikube            1/1     Running   0             2m14s
kube-system   storage-provisioner                1/1     Running   1 (98s ago)   2m12s
```

- We can create a new alias for the `kubectl` command.

```bash
alias kubectl="minikube kubectl --"
```

- We can ensure kubectl is working by running the `kubectl get pods -A` command.

```bash
kubectl get pods -A
NAMESPACE     NAME                               READY   STATUS    RESTARTS        AGE
kube-system   coredns-668d6bf9bc-6f65f           1/1     Running   0               5m22s
kube-system   etcd-minikube                      1/1     Running   0               5m27s
kube-system   kube-apiserver-minikube            1/1     Running   0               5m27s
kube-system   kube-controller-manager-minikube   1/1     Running   0               5m27s
kube-system   kube-proxy-n4jt4                   1/1     Running   0               5m22s
kube-system   kube-scheduler-minikube            1/1     Running   0               5m28s
kube-system   storage-provisioner                1/1     Running   1 (4m52s ago)   5m26s
```

- We can modify the `~/.bashrc` file to add the `kubectl` alias and the `minikube start` command.

> ~/.bashrc

```bash
.
alias kubectl="minikube kubectl --"
alias mkstart="minikube start"
```

> Note: To reload the `~/.bashrc` file, we need to open a new terminal or run the `source ~/.bashrc` command.

- We can reload the `~/.bashrc` file by running the `source ~/.bashrc` command.

```bash
source ~/.bashrc
```

- We can get the status of the `minikube` cluster by running the `minikube status` command.

```bash
minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

- We can get the pods in the `default` namespace by running the `kubectl get pods` command.

```bash
kubectl -- get pods
kubectl controls the Kubernetes cluster manager.

 Find more information at: https://kubernetes.io/docs/reference/kubectl/

Basic Commands (Beginner):
  create          Create a resource from a file or from stdin
  expose          Take a replication controller, service, deployment or pod and expose it as a new Kubernetes service
  run             Run a particular image on the cluster
  set             Set specific features on objects

Basic Commands (Intermediate):
  explain         Get documentation for a resource
  get             Display one or many resources
  edit            Edit a resource on the server
  delete          Delete resources by file names, stdin, resources and names, or by resources and label selector

Deploy Commands:
  rollout         Manage the rollout of a resource
  scale           Set a new size for a deployment, replica set, or replication controller
  autoscale       Auto-scale a deployment, replica set, stateful set, or replication controller

Cluster Management Commands:
  certificate     Modify certificate resources
  cluster-info    Display cluster information
  top             Display resource (CPU/memory) usage
  cordon          Mark node as unschedulable
  uncordon        Mark node as schedulable
  drain           Drain node in preparation for maintenance
  taint           Update the taints on one or more nodes

Troubleshooting and Debugging Commands:
  describe        Show details of a specific resource or group of resources
  logs            Print the logs for a container in a pod
  attach          Attach to a running container
  exec            Execute a command in a container
  port-forward    Forward one or more local ports to a pod
  proxy           Run a proxy to the Kubernetes API server
  cp              Copy files and directories to and from containers
  auth            Inspect authorization
  debug           Create debugging sessions for troubleshooting workloads and nodes
  events          List events

Advanced Commands:
  diff            Diff the live version against a would-be applied version
  apply           Apply a configuration to a resource by file name or stdin
  patch           Update fields of a resource
  replace         Replace a resource by file name or stdin
  wait            Experimental: Wait for a specific condition on one or many resources
  kustomize       Build a kustomization target from a directory or URL

Settings Commands:
  label           Update the labels on a resource
  annotate        Update the annotations on a resource
  completion      Output shell completion code for the specified shell (bash, zsh, fish, or powershell)

Subcommands provided by plugins:

Other Commands:
  api-resources   Print the supported API resources on the server
  api-versions    Print the supported API versions on the server, in the form of "group/version"
  config          Modify kubeconfig files
  plugin          Provides utilities for interacting with plugins
  version         Print the client and server version information

Usage:
  kubectl [flags] [options]

Use "kubectl <command> --help" for more information about a given command.
Use "kubectl options" for a list of global command-line options (applies to all commands).
```

- We can get the namespaces by running the `kubectl get namespaces` command.

```bash
kubectl get namespaces
NAME              STATUS   AGE
default           Active   7m45s
kube-node-lease   Active   7m45s
kube-public       Active   7m45s
kube-system       Active   7m45s
```

- We can get the nodes by running the `kubectl get nodes` command.

```bash
kubectl get nodes
NAME       STATUS   ROLES           AGE     VERSION
minikube   Ready    control-plane   8m43s   v1.32.0
```

- We can get the pods from a specific namespace by running the `kubectl get pods -n <namespace>` command.

```bash
kubectl get po -n kube-system
NAME                               READY   STATUS    RESTARTS      AGE
coredns-668d6bf9bc-6f65f           1/1     Running   0             30m
etcd-minikube                      1/1     Running   0             30m
kube-apiserver-minikube            1/1     Running   0             30m
kube-controller-manager-minikube   1/1     Running   0             30m
kube-proxy-n4jt4                   1/1     Running   0             30m
kube-scheduler-minikube            1/1     Running   0             30m
storage-provisioner                1/1     Running   1 (30m ago)   30m
```

### 11.4 Updating `.prettierignore`

- We need to update the `.prettierignore` file to ignore the `charts` directory.
- The `charts` directory is a directory that contains the `helm` charts.
- We need to ignore the `charts` directory because it contains the `helm` charts for the `jobber` application.

> .prettierignore

```diff
# Add files here to ignore them from prettier formatting
+charts/**/*.yaml
/dist
/coverage
/.nx/cache
/.nx/workspace-data
```

### 11.5. Setting up the `helm` charts

#### 11.5.1. Installing `helm`

- We need to install the `helm` command as we can see in [Installing Helm](https://helm.sh/docs/intro/install/)
- We can use the `Debian/Ubuntu` installation command as we can see in [Install From Snap](https://helm.sh/docs/intro/install/#from-snap)

```bash
sudo snap install helm --classic
helm 3.17.2 from Snapcrafters✪ installed
```

- We can check the version of `helm` by running the `helm version` command.

```bash
helm version
version.BuildInfo{Version:"v3.17.2", GitCommit:"cc0bbbd6d6276b83880042c1ecb34087e84d41eb", GitTreeState:"clean", GoVersion:"go1.23.7"}
```

- We can get the help of the `helm` command by running the `helm help` command.

```bash
helm help
```

#### 11.5.2. Using the `helm CLI` to create a new chart

- From the `charts` directory, we can create a new chart by running the `helm create <chart-name>` command.

```bash
helm create jobber
Creating jobber
```

- We can see the new chart that was created.

```bash
ls -l jobber
total 20
drwxr-xr-x 2 juanpabloperez juanpabloperez 4096 Mar 19 18:15 charts
-rw-r--r-- 1 juanpabloperez juanpabloperez 1142 Mar 19 18:15 Chart.yaml
drwxr-xr-x 3 juanpabloperez juanpabloperez 4096 Mar 19 18:15 templates
-rw-r--r-- 1 juanpabloperez juanpabloperez 4292 Mar 19 18:15 values.yaml
```

- It has created the `Chart.yaml` file and the `templates` directory.

> charts/jobber/Chart.yaml

```yaml
apiVersion: v2
name: jobber
description: A Helm chart for Kubernetes

# A chart can be either an 'application' or a 'library' chart.
#
# Application charts are a collection of templates that can be packaged into versioned archives
# to be deployed.
#
# Library charts provide useful utilities or functions for the chart developer. They're included as
# a dependency of application charts to inject those utilities and functions into the rendering
# pipeline. Library charts do not define any templates and therefore cannot be deployed.
type: application

# This is the chart version. This version number should be incremented each time you make changes
# to the chart and its templates, including the app version.
# Versions are expected to follow Semantic Versioning (https://semver.org/)
version: 0.1.0

# This is the version number of the application being deployed. This version number should be
# incremented each time you make changes to the application. Versions are not expected to
# follow Semantic Versioning. They should reflect the version the application is using.
# It is recommended to use it with quotes.
appVersion: '1.16.0'
```

- We can see the `values.yaml` file that was created.

> charts/jobber/values.yaml

```yaml
# Default values for jobber.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

# This will set the replicaset count more information can be found here: https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/
replicaCount: 1

# This sets the container image more information can be found here: https://kubernetes.io/docs/concepts/containers/images/
image:
  repository: nginx
  # This sets the pull policy for images.
  pullPolicy: IfNotPresent
  # Overrides the image tag whose default is the chart appVersion.
  tag: ''

# This is for the secrets for pulling an image from a private repository more information can be found here: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
imagePullSecrets: []
# This is to override the chart name.
nameOverride: ''
fullnameOverride: ''

# This section builds out the service account more information can be found here: https://kubernetes.io/docs/concepts/security/service-accounts/
serviceAccount:
  # Specifies whether a service account should be created
  create: true
  # Automatically mount a ServiceAccount's API credentials?
  automount: true
  # Annotations to add to the service account
  annotations: {}
  # The name of the service account to use.
  # If not set and create is true, a name is generated using the fullname template
  name: ''

# This is for setting Kubernetes Annotations to a Pod.
# For more information checkout: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/
podAnnotations: {}
# This is for setting Kubernetes Labels to a Pod.
# For more information checkout: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
podLabels: {}

podSecurityContext:
  {}
  # fsGroup: 2000

securityContext:
  {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

# This is for setting up a service more information can be found here: https://kubernetes.io/docs/concepts/services-networking/service/
service:
  # This sets the service type more information can be found here: https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types
  type: ClusterIP
  # This sets the ports more information can be found here: https://kubernetes.io/docs/concepts/services-networking/service/#field-spec-ports
  port: 80

# This block is for setting up the ingress for more information can be found here: https://kubernetes.io/docs/concepts/services-networking/ingress/
ingress:
  enabled: false
  className: ''
  annotations:
    {}
    # kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []
  #  - secretName: chart-example-tls
  #    hosts:
  #      - chart-example.local

resources:
  {}
  # We usually recommend not to specify default resources and to leave this as a conscious
  # choice for the user. This also increases chances charts run on environments with little
  # resources, such as Minikube. If you do want to specify resources, uncomment the following
  # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
  # limits:
  #   cpu: 100m
  #   memory: 128Mi
  # requests:
  #   cpu: 100m
  #   memory: 128Mi

# This is to setup the liveness and readiness probes more information can be found here: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
livenessProbe:
  httpGet:
    path: /
    port: http
readinessProbe:
  httpGet:
    path: /
    port: http

# This section is for setting up autoscaling more information can be found here: https://kubernetes.io/docs/concepts/workloads/autoscaling/
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80

# Additional volumes on the output Deployment definition.
volumes: []
# - name: foo
#   secret:
#     secretName: mysecret
#     optional: false

# Additional volumeMounts on the output Deployment definition.
volumeMounts: []
# - name: foo
#   mountPath: "/etc/foo"
#   readOnly: true

nodeSelector: {}

tolerations: []

affinity: {}
```

- We can see the `templates` directory that was created.

```bash
ls -l jobber/templates
total 32
-rw-r--r-- 1 juanpabloperez juanpabloperez 2375 Mar 19 18:15 deployment.yaml
-rw-r--r-- 1 juanpabloperez juanpabloperez 1772 Mar 19 18:15 _helpers.tpl
-rw-r--r-- 1 juanpabloperez juanpabloperez  988 Mar 19 18:15 hpa.yaml
-rw-r--r-- 1 juanpabloperez juanpabloperez 1085 Mar 19 18:15 ingress.yaml
-rw-r--r-- 1 juanpabloperez juanpabloperez 1740 Mar 19 18:15 NOTES.txt
-rw-r--r-- 1 juanpabloperez juanpabloperez  387 Mar 19 18:15 serviceaccount.yaml
-rw-r--r-- 1 juanpabloperez juanpabloperez  358 Mar 19 18:15 service.yaml
drwxr-xr-x 2 juanpabloperez juanpabloperez 4096 Mar 19 18:15 tests
```

- We are not going to use anything from the `templates` directory, so we can delete everything inside it.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts$ rm -rf jobber/templates/*
```

- We are going to remove the content from the `values.yaml` file as we are populated ourselves.

### 11.6. Creating the `jobber` templates in the `templates` directory

- We are going to create the `auth`, `executor` and `jobs` templates in the `templates` directory.
- Initially, we are going to create a folder for each of the services and then we will add the templates for each of them.

```bash
mkdir charts/jobber/templates/auth
mkdir charts/jobber/templates/executor
mkdir charts/jobber/templates/jobs
```

#### 11.6.1. Creating the initial `jobs` template

- We are going to start by creating the `jobs/deployment.yaml` file.
- This file will be used to deploy the `jobs` service.
- We want to control if any of the services are enabled or not, so we will add a `enabled` property to the `values.yaml` file.

> charts/jobber/values.yaml

```yaml
jobs:
  enabled: true
```

- We can manage if the service is enabled or not by using that property in the `deployment.yaml` file.
- We can create the base `deployment.yaml` file.

> charts/jobber/templates/jobs/deployment.yaml

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
{{- end }}
```

- We can update the `values.yaml` file to add the needed properties.

> charts/jobber/values.yaml

```yaml
global:
  imagePullPolicy: Always

jobs:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest
  port: 3001
```

- We are going to try to install the current `jobber` chart.
- We have to execute the `helm install` command from the `charts/jobber` directory.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm install jobber . -n jobber --create-namespace
NAME: jobber
LAST DEPLOYED: Thu Mar 20 06:17:22 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

- We can see the resources inside the `jobber` namespace.

```bash
kubectl get all -n jobber
NAME                        READY   STATUS             RESTARTS   AGE
pod/jobs-8549b87c7f-mvmmd   0/1     ImagePullBackOff   0          4m27s

NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/jobs   0/1     1            0           4m27s

NAME                              DESIRED   CURRENT   READY   AGE
replicaset.apps/jobs-8549b87c7f   1         1         0       4m27s
```

- We can see the pods that are running.

```bash
kubectl get pods -n jobber
NAME                    READY   STATUS             RESTARTS   AGE
jobs-8549b87c7f-mvmmd   0/1     ImagePullBackOff   0          5m14s
```

- We can see the logs of the pod.

```bash
kubectl logs -n jobber jobs-8549b87c7f-mvmmd
Error from server (BadRequest): container "jobs" in pod "jobs-8549b87c7f-mvmmd" is waiting to start: trying and failing to pull image
```

- We can see the describe of the pod to get more information.

```bash
kubectl describe pod -n jobber jobs-8549b87c7f-mvmmd
Name:             jobs-8549b87c7f-mvmmd
Namespace:        jobber
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Thu, 20 Mar 2025 06:17:22 +0000
Labels:           app=jobs
                  pod-template-hash=8549b87c7f
Annotations:      <none>
Status:           Pending
IP:               10.244.0.4
IPs:
  IP:           10.244.0.4
Controlled By:  ReplicaSet/jobs-8549b87c7f
Containers:
  jobs:
    Container ID:
    Image:          072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest
    Image ID:
    Port:           3001/TCP
    Host Port:      0/TCP
    State:          Waiting
      Reason:       ImagePullBackOff
    Ready:          False
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-jl5x5 (ro)
Conditions:
  Type                        Status
  PodReadyToStartContainers   True
  Initialized                 True
  Ready                       False
  ContainersReady             False
  PodScheduled                True
Volumes:
  kube-api-access-jl5x5:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   BestEffort
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type     Reason     Age                     From               Message
  ----     ------     ----                    ----               -------
  Normal   Scheduled  7m48s                   default-scheduler  Successfully assigned jobber/jobs-8549b87c7f-mvmmd to minikube
  Normal   Pulling    4m54s (x5 over 7m48s)   kubelet            Pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest"
  Warning  Failed     4m53s (x5 over 7m47s)   kubelet            Failed to pull image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest": Error response from daemon: Head "https://072929378285.dkr.ecr.eu-north-1.amazonaws.com/v2/jobber/jobs/manifests/latest": no basic auth credentials
  Warning  Failed     4m53s (x5 over 7m47s)   kubelet            Error: ErrImagePull
  Warning  Failed     2m37s (x20 over 7m46s)  kubelet            Error: ImagePullBackOff
  Normal   BackOff    2m25s (x21 over 7m46s)  kubelet            Back-off pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest"
```

- The problem is that the image repository is private and we need to provide the credentials.

#### 11.6.2. Adding the credentials to get the image from the private repository

- We can use the `registry-creds` addon to add the credentials to the cluster as we can see on [Configure credentials for AWS Elastic Container Registry using registry-creds addon](https://minikube.sigs.k8s.io/docs/tutorials/configuring_creds_for_aws_ecr/).
- We are going to add the credentials to the cluster by using `minikube addons configure registry-creds`.

```bash
 minikube addons configure registry-creds

Do you want to enable AWS Elastic Container Registry? [y/n]: y
-- Enter AWS Access Key ID: AKIARxxxxxxxxxxQPDET
-- Enter AWS Secret Access Key: 5btbyyyyyyyyyyyyyyyyyyDyQBcA
-- (Optional) Enter AWS Session Token:
-- Enter AWS Region: eu-north-1
-- Enter 12 digit AWS Account ID (Comma separated list): 072929378285
-- (Optional) Enter ARN of AWS role to assume:

Do you want to enable Google Container Registry? [y/n]: n

Do you want to enable Docker Registry? [y/n]: n

Do you want to enable Azure Container Registry? [y/n]: n
✅  registry-creds was successfully configured
```

- We need to enable the `registry-creds` addon by using `minikube addons enable registry-creds`.

```bash
minikube addons enable registry-creds
❗  registry-creds is a 3rd party addon and is not maintained or verified by minikube maintainers, enable at your own risk.
❗  registry-creds does not currently have an associated maintainer.
    ▪ Using image docker.io/upmcenterprises/registry-creds:1.10
🌟  The 'registry-creds' addon is enabled
```

- We need to uninstall the `jobber` chart by using `helm uninstall jobber -n jobber`.

```bash
helm uninstall jobber -n jobber
release "jobber" uninstalled
```

- It is recommended to stop the `minikube` service by using `minikube stop`.

```bash
minikube stop
✋  Stopping node "minikube"  ...
🛑  Powering off "minikube" via SSH ...
🛑  1 node stopped.
```

- We can start the `minikube` service again by using `minikube start`.

```bash
minikube start
😄  minikube v1.35.0 on Ubuntu 24.04
✨  Using the docker driver based on existing profile
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.46 ...
🔄  Restarting existing docker container for "minikube" ...
🐳  Preparing Kubernetes v1.32.0 on Docker 27.4.1 ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
    ▪ Using image docker.io/upmcenterprises/registry-creds:1.10
🌟  Enabled addons: default-storageclass, storage-provisioner, registry-creds
💡  kubectl not found. If you need it, try: 'minikube kubectl -- get pods -A'
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

- We can try to install the `jobber` chart again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm install jobber . -n jobber --create-namespace
NAME: jobber
LAST DEPLOYED: Thu Mar 20 07:02:10 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

- We can see the pods inside the `jobber` namespace.

```bash
kubectl get pods -n jobber
NAME                    READY   STATUS             RESTARTS      AGE
jobs-64c5ccd96d-5crfw   0/1     CrashLoopBackOff   1 (14s ago)   40s
```

- We can see the describe of the pod.

```bash
kubectl describe pod -n jobber jobs-64c5ccd96d-5crfw
Name:             jobs-64c5ccd96d-5crfw
Namespace:        jobber
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Thu, 20 Mar 2025 07:16:25 +0000
Labels:           app=jobs
                  pod-template-hash=64c5ccd96d
Annotations:      <none>
Status:           Running
IP:               10.244.0.12
IPs:
  IP:           10.244.0.12
Controlled By:  ReplicaSet/jobs-64c5ccd96d
Containers:
  jobs:
    Container ID:   docker://c8b41ab30d93d2f8a00232e0ffd6a158acea0f0df1f4045e4a38c943b32e4a68
    Image:          072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest
    Image ID:       docker-pullable://072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs@sha256:1944e3c2935799731f60279c4cb4def4a319a7c8013931fb92b97a4cb006d55d
    Port:           3001/TCP
    Host Port:      0/TCP
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
      Started:      Thu, 20 Mar 2025 07:17:08 +0000
      Finished:     Thu, 20 Mar 2025 07:17:09 +0000
    Ready:          False
    Restart Count:  2
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-294b6 (ro)
Conditions:
  Type                        Status
  PodReadyToStartContainers   True
  Initialized                 True
  Ready                       False
  ContainersReady             False
  PodScheduled                True
Volumes:
  kube-api-access-294b6:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   BestEffort
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  63s                default-scheduler  Successfully assigned jobber/jobs-64c5ccd96d-5crfw to minikube
  Normal   Pulled     40s                kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest" in 22.98s (22.98s including waiting). Image size: 489827977 bytes.
  Normal   Pulled     38s                kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest" in 637ms (637ms including waiting). Image size: 489827977 bytes.
  Normal   Pulling    21s (x3 over 63s)  kubelet            Pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest"
  Normal   Created    20s (x3 over 40s)  kubelet            Created container: jobs
  Normal   Started    20s (x3 over 40s)  kubelet            Started container jobs
  Normal   Pulled     20s                kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest" in 700ms (700ms including waiting). Image size: 489827977 bytes.
  Warning  BackOff    5s (x4 over 36s)   kubelet            Back-off restarting failed container jobs in pod jobs-64c5ccd96d-5crfw_jobber(2f19ccd8-35d4-4cf4-8475-73056b62fb6d)
```

- We can see the logs of the pod.

```bash
kubectl logs -n jobber jobs-64c5ccd96d-5crfw
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] LoggerModule dependencies initialized +0ms
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/20/2025, 7:20:05 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/20/2025, 7:20:05 AM   ERROR [ExceptionHandler] TypeError: Configuration key "PULSAR_SERVICE_URL" does not exist
    at ConfigService.getOrThrow (/app/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at new PulsarClient (/app/dist/libs/pulsar/main.js:67:44)
    at Injector.instantiateClass (/app/node_modules/@nestjs/core/injector/injector.js:373:19)
    at callback (/app/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/app/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/app/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/app/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async /app/node_modules/@nestjs/core/injector/instance-loader.js:56:13
    at async Promise.all (index 3)
    at async InstanceLoader.createInstancesOfProviders (/app/node_modules/@nestjs/core/injector/instance-loader.js:55:9)
```

#### 11.6.3. Adding the Pulsar and Postgres services URLs to the jobber chart dependencies

- We need to add the `pulsar` and `postgres` services URLs to the `jobber` chart dependencies.
- We can do this by using the `Chart.yaml` file.

> charts/jobber/Chart.yaml

```yaml
.
dependencies:
  - name: pulsar
    version: 4.0.0
    repository: https://pulsar.apache.org/charts
  - name: postgresql
    version: 16.5.4
    repository: https://charts.bitnami.com/bitnami
```

- We need to add the `pulsar` and `postgres` values to the `jobber` chart.
- We can access the [Apache Pulsar Helm Chart](https://github.com/apache/pulsar-helm-chart) and [Bitnami package for PostgreSQL](https://github.com/bitnami/charts/tree/main/bitnami/postgresql) to get the latest versions of the charts.
- As long as we use the same property name as we have in the `dependencies` section, the values will be injected to the `charts/pulsar` and `charts/postgresql` directories.

> charts/jobber/values.yaml

```yaml
.global:
  imagePullPolicy: Always

jobs:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest
  port: 3001

pulsar:
  namespace: pulsar
  namespaceCreate: true
  # Disable VictoriaMetrics components completely
  victoria-metrics-k8s-stack:
    enabled: false
  zookeeper:
    replicaCount: 1
    podMonitor:
      enabled: false
  broker:
    replicaCount: 1
    podMonitor:
      enabled: false
  bookkeeper:
    replicaCount: 1
    podMonitor:
      enabled: false
  autorecovery:
    podMonitor:
      enabled: false
  proxy:
    podMonitor:
      enabled: false
  kube-prometheus-stack:
    enabled: false
    prometheusOperator:
      enabled: false
    grafana:
      enabled: false
    alertmanager:
      enabled: false
    prometheus:
      enabled: false

  # Minimal deployment
  components:
    zookeeper: true
    bookkeeper: true
    broker: true
    proxy: false
    autorecovery: false
    functions: false
    toolset: true

postgresql:
  namespaceOverride: postgresql
  auth:
    username: postgres
    password: postgres
    database: jobber
```

- We need to update the dependencies by using `helm dependency update`.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm dependency update
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

- We can execute the `helm upgrade` command to install the `jobber` chart again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm upgrade jobber . -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Thu Mar 20 17:37:55 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

- We can see the namespaces we have now.

```bash
kubectl get namespaces
NAME              STATUS   AGE
default           Active   2d
jobber            Active   11h
kube-node-lease   Active   2d
kube-public       Active   2d
kube-system       Active   2d
postgresql        Active   7m53s
pulsar            Active   109s
```

- We can check now the pods inside the `postgresql` namespace.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ kubectl get pods -n postgresql
NAME                  READY   STATUS    RESTARTS   AGE
jobber-postgresql-0   1/1     Running   0          3m49s
```

- We can check now the pods inside the `pulsar` namespace.

```bash
kubectl get pods -n pulsar
NAME                        READY   STATUS     RESTARTS   AGE
jobber-pulsar-bookie-0      0/1     Init:0/1   0          9h
jobber-pulsar-broker-0      0/1     Init:0/2   0          9h
jobber-pulsar-toolset-0     1/1     Running    0          9h
jobber-pulsar-zookeeper-0   1/1     Running    0          9h
```

- `brookie` and `broker` pods cannot be started, so we are going to create a simpler version of the `pulsar` chart.

> charts/jobber/Chart.yaml

```yaml
.
dependencies:
  - name: pulsar
    version: 3.7.0
    repository: https://pulsar.apache.org/charts
```

> charts/jobber/values.yaml

```yaml
.
pulsar:
  # Disable all monitoring
  victoria-metrics-k8s-stack:
    enabled: false
  kube-prometheus-stack:
    enabled: false

  # Minimal deployment - only what's absolutely needed
  components:
    zookeeper: true
    bookkeeper: true
    broker: true
    proxy: false
    autorecovery: false
    functions: false
    toolset: true

  # Disable all persistence
  # persistence: false

  # Minimal resources
  zookeeper:
    replicaCount: 1
    resources:
      requests:
        memory: "128Mi"
        cpu: "0.1"
  bookkeeper:
    replicaCount: 1
    resources:
      requests:
        memory: "128Mi"
        cpu: "0.1"
  broker:
    replicaCount: 1
    resources:
      requests:
        memory: "128Mi"
        cpu: "0.1"
```

- We need to update dependencies again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm dependency update
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

- We need to uninstall and install the `jobber` chart again.

```bash
helm uninstall jobber -n jobber
release "jobber" uninstalled
```

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm install jobber . -n jobber
NAME: jobber
LAST DEPLOYED: Fri Mar 21 04:28:09 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

- We can check the pods again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ kubectl get pods -n pulsar
NAME                              READY   STATUS      RESTARTS   AGE
jobber-pulsar-bookie-0            1/1     Running     0          63s
jobber-pulsar-bookie-init-vltk4   0/1     Completed   0          63s
jobber-pulsar-broker-0            1/1     Running     0          63s
jobber-pulsar-pulsar-init-k5whk   0/1     Completed   0          63s
jobber-pulsar-toolset-0           1/1     Running     0          63s
jobber-pulsar-zookeeper-0         1/1     Running     0          63s
```

- We can check the logs of the `jobber` pod.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ kubectl get pods -n jobber
NAME                    READY   STATUS             RESTARTS      AGE
jobs-64c5ccd96d-jkgmx   0/1     CrashLoopBackOff   7 (60s ago)   11m
```

- We can check the logs of the `jobs` pod.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ kubectl logs -n jobber jobs-64c5ccd96d-jkgmx
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] LoggerModule dependencies initialized +0ms
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/21/2025, 4:39:03 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/21/2025, 4:39:03 AM   ERROR [ExceptionHandler] TypeError: Configuration key "PULSAR_SERVICE_URL" does not exist
    at ConfigService.getOrThrow (/app/node_modules/@nestjs/config/dist/config.service.js:132:19)
    at new PulsarClient (/app/dist/libs/pulsar/main.js:67:44)
    at Injector.instantiateClass (/app/node_modules/@nestjs/core/injector/injector.js:373:19)
    at callback (/app/node_modules/@nestjs/core/injector/injector.js:65:45)
    at async Injector.resolveConstructorParams (/app/node_modules/@nestjs/core/injector/injector.js:145:24)
    at async Injector.loadInstance (/app/node_modules/@nestjs/core/injector/injector.js:70:13)
    at async Injector.loadProvider (/app/node_modules/@nestjs/core/injector/injector.js:98:9)
    at async /app/node_modules/@nestjs/core/injector/instance-loader.js:56:13
    at async Promise.all (index 3)
    at async InstanceLoader.createInstancesOfProviders (/app/node_modules/@nestjs/core/injector/instance-loader.js:55:9)
```

- We can see the error is related to the `PULSAR_SERVICE_URL` configuration key. So we need to setup the environment variables.

### 11.7. Adding Environment Variables to the Jobber Service

- We need to add both the `PULSAR_SERVICE_URL` and `PORT` environment variables (as we can see in the .env file).
- We can add environment variables to the `jobs` service by using the `env` section in the `deployment.yaml` file.
- We are going to add the `PORT` environment variable to the `jobs` service.

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
+         env:
+           - name: PORT
+             value: "{{ .Values.jobs.port }}"
{{- end }}
```

- But, regarding the `PULSAR_SERVICE_URL` environment variable, we are going to create a common environment variable for all the services.
- We can see the services that are running for the pulsar namespace.

```bash
kubectl get svc -n pulsar
NAME                      TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                               AGE
jobber-pulsar-bookie      ClusterIP   None         <none>        3181/TCP,8000/TCP                     43m
jobber-pulsar-broker      ClusterIP   None         <none>        8080/TCP,6650/TCP                     43m
jobber-pulsar-toolset     ClusterIP   None         <none>        <none>                                43m
jobber-pulsar-zookeeper   ClusterIP   None         <none>        8000/TCP,2888/TCP,3888/TCP,2181/TCP   43m
```

- The `jobber-pulsar-broker` service is the one we need to use to connect to the Pulsar service.

- We need to add the `DATABASE_URL` environment variable to the `jobs` service.
- We can see the services that are running for the postgresql namespace.

```bash
kubectl get svc -n postgresql
NAME                   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
jobber-postgresql      ClusterIP   10.104.227.248   <none>        5432/TCP   48m
jobber-postgresql-hl   ClusterIP   None             <none>        5432/TCP   48m
```

- The `jobber-postgresql` service is the one we need to use to connect to the PostgreSQL service.
- With this information, we are going to create the `common.tpl` file in the `charts/jobber/templates` directory.

> charts/jobber/templates/common.tpl

```yaml
{{- define "common.env" -}}
- name: PULSAR_SERVICE_URL
  value: pulsar://{{ .Release.Name }}-pulsar-broker.pulsar.svc.cluster.local:6650
- name: DATABASE_URL
  value: postgresql://postgres:postgres@{{ .Release.Name }}-postgresql.postgresql.svc.cluster.local:5432/jobber
{{- end -}}
```

- We need to update the `deployment.yaml` file to use the `common.tpl` file.

> charts/jobber/templates/jobs/deployment.yaml

```diff
.
env:
    spec:
      containers:
        - name: jobs
          image: {{ .Values.jobs.image }}
          imagePullPolicy: {{ .Values.global.imagePullPolicy }}
          ports:
            - containerPort: {{ .Values.jobs.port }}
          env:
+           {{- include "common.env" . | nindent 12 }}
            - name: PORT
              value: "{{ .Values.jobs.port }}"
```

- We need to upgrade the `jobber` chart again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm upgrade jobber . -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Fri Mar 21 05:27:57 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 4
TEST SUITE: None
```

- We can check the pods again and see that they are running.

```bash
kubectl get pods -n jobber
NAME                    READY   STATUS    RESTARTS   AGE
jobs-54b647f788-vc74s   1/1     Running   0          38s
```

- We can check the logs of the `jobs` pod again and see that it is running.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ kubectl logs -n jobber jobs-54b647f788-vc74s
[
  {
    meta: {
      name: 'Fibonacci',
      description: 'Generate a Fibonacci sequence and store it in the DB.'
    },
    discoveredClass: {
      name: 'FibonacciJob',
      instance: [FibonacciJob],
      injectType: [class FibonacciJob extends AbstractJob],
      dependencyType: [class FibonacciJob extends AbstractJob],
      parentModule: [Object]
    }
  }
]
{"level":30,"time":1742534882982,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"ClientsModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"ConfigHostModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"DiscoveryModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"PulsarModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"GraphQLSchemaBuilderModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"JobsModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"InstanceLoader","msg":"GraphQLModule dependencies initialized"}
{"level":40,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":40,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"GraphQLModule","msg":"Mapped {/graphql, POST} route"}
{"level":30,"time":1742534882983,"pid":1,"hostname":"jobs-54b647f788-vc74s","context":"NestApplication","msg":"Nest application successfully started"}
{"level":30,"time":1742534882984,"pid":1,"hostname":"jobs-54b647f788-vc74s","msg":"🚀 Application is running on: http://localhost:3001/api"}
```

### 11.8. Updating the `schema.prisma` file to make it work with the `jobber` service inside the cluster

- We need to update the `schema.prisma` file to make it work with the `jobber` service inside the cluster.
- We need to add the `binaryTargets` property

> apps/auth/prisma/schema.prisma

```diff
generator client {
  provider = "prisma-client-js"
+ binaryTargets = ["native", "debian-openssl-1.1.x"]
  output   = "../../../node_modules/@prisma-clients/auth"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @default(autoincrement()) @id
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

### 11.9. Creating the `deployment.yaml` file for the `executor` and `auth` services

- We need to update our `auth` service to use the `AUTH_GRPC_SERVICE_URL` environment variable.

> apps/auth/.env

```diff
.
+AUTH_GRPC_SERVICE_URL=localhost:5000
```

> apps/auth/src/main.ts

```diff
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'path';
import { init } from '@jobber/nestjs';
+import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app);
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
+     url: app.get(ConfigService).getOrThrow('AUTH_GRPC_SERVICE_URL'),
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
```

- We need to create the `deployment.yaml` file for the `executor` service.

> charts/jobber/templates/executor/deployment.yaml

```yaml
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
{{- end }}
```

- We need to create the `deployment.yaml` file for the `auth` service.

> charts/jobber/templates/auth/deployment.yaml

```yaml
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
{{- end }}
```

- We need to add the new values to the `values.yaml` file.

> values.yaml

```yaml
.
executor:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/executor:latest
  port: 3002

auth:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest
  port:
    http: 3000
    grpc: 5000
  jwt:
    secret: CBm2b6nKxeDTl2UOZxbR6YwqDbUmxAJl
    expirationMs: 28800000
```

- We need to upgrade the `jobber` chart again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm upgrade jobber . -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Fri Mar 21 06:14:46 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 5
TEST SUITE: None
```

- We can check the pods again and see that they are running.

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS   AGE
auth-f6d6f5559-bwt7g        1/1     Running   0          64s
executor-56d7cb958f-8h5ss   1/1     Running   0          64s
jobs-54b647f788-vc74s       1/1     Running   0          47m
```

- We can describe the `executor` pod and see that it is running.

```bash
uanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ kubectl describe po executor-56d7cb958f-8h5ss -n jobber
Name:             executor-56d7cb958f-8h5ss
Namespace:        jobber
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Fri, 21 Mar 2025 06:14:49 +0000
Labels:           app=executor
                  pod-template-hash=56d7cb958f
Annotations:      <none>
Status:           Running
IP:               10.244.0.34
IPs:
  IP:           10.244.0.34
Controlled By:  ReplicaSet/executor-56d7cb958f
Containers:
  executor:
    Container ID:   docker://e1e727e6fe597664faad839ca4a2696ee4467de339219d8c5461e9443ea82ae5
    Image:          072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/executor:latest
    Image ID:       docker-pullable://072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/executor@sha256:ae5600fe12bb0c2b1ae7bcce3b1002b383277f1bf804537cc08f8ec72aa3ff07
    Port:           3002/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Fri, 21 Mar 2025 06:15:18 +0000
    Ready:          True
    Restart Count:  0
    Environment:
      PULSAR_SERVICE_URL:  pulsar://jobber-pulsar-broker.pulsar.svc.cluster.local:6650
      DATABASE_URL:        postgresql://postgres:postgres@jobber-postgresql.postgresql.svc.cluster.local:5432/jobber
      PORT:                3002
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-sdt6n (ro)
Conditions:
  Type                        Status
  PodReadyToStartContainers   True
  Initialized                 True
  Ready                       True
  ContainersReady             True
  PodScheduled                True
Volumes:
  kube-api-access-sdt6n:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   BestEffort
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  2m41s  default-scheduler  Successfully assigned jobber/executor-56d7cb958f-8h5ss to minikube
  Normal  Pulling    2m42s  kubelet            Pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/executor:latest"
  Normal  Pulled     2m14s  kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/executor:latest" in 27.444s (27.444s including waiting). Image size: 741368862 bytes.
  Normal  Created    2m13s  kubelet            Created container: executor
  Normal  Started    2m13s  kubelet            Started container executor
```

- We can see the `executor` pod is running and the `auth` pod is running.

```bash
kubectl logs executor-56d7cb958
f-8h5ss -n jobber
{"level":30,"time":1742537719963,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"ConfigHostModule dependencies initialized"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"PulsarModule dependencies initialized"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"JobsModule dependencies initialized"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":40,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":40,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","context":"NestApplication","msg":"Nest application successfully started"}
{"level":30,"time":1742537719964,"pid":1,"hostname":"executor-56d7cb958f-8h5ss","msg":"🚀 Application is running on: http://localhost:3002/api"}
```

- We can describe the `auth` pod and see that it is running.

```bash
kubectl describe po auth-f6d6f5559-bwt7g -n jobber
Name:             auth-f6d6f5559-bwt7g
Namespace:        jobber
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Fri, 21 Mar 2025 06:14:49 +0000
Labels:           app=auth
                  pod-template-hash=f6d6f5559
Annotations:      <none>
Status:           Running
IP:               10.244.0.33
IPs:
  IP:           10.244.0.33
Controlled By:  ReplicaSet/auth-f6d6f5559
Containers:
  auth:
    Container ID:   docker://00fe6212cfd267b0ed60d4dd000d44bf2dba87c23a914ecfb26358c1f67d3fa8
    Image:          072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest
    Image ID:       docker-pullable://072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth@sha256:bd5a179dd93f8dc23fbbb88fd1002d61a6b02281b31819a20cd8c5022e026760
    Ports:          3000/TCP, 5000/TCP
    Host Ports:     0/TCP, 0/TCP
    State:          Running
      Started:      Fri, 21 Mar 2025 06:15:44 +0000
    Ready:          True
    Restart Count:  0
    Environment:
      PULSAR_SERVICE_URL:     pulsar://jobber-pulsar-broker.pulsar.svc.cluster.local:6650
      DATABASE_URL:           postgresql://postgres:postgres@jobber-postgresql.postgresql.svc.cluster.local:5432/jobber
      PORT:                   3000
      JWT_SECRET:             CBm2b6nKxeDTl2UOZxbR6YwqDbUmxAJl
      JWT_EXPIRATION_MS:      2.88e+07
      AUTH_GRPC_SERVICE_URL:  0.0.0.0:5000
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-9x69n (ro)
Conditions:
  Type                        Status
  PodReadyToStartContainers   True
  Initialized                 True
  Ready                       True
  ContainersReady             True
  PodScheduled                True
Volumes:
  kube-api-access-9x69n:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   BestEffort
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  22m   default-scheduler  Successfully assigned jobber/auth-f6d6f5559-bwt7g to minikube
  Normal  Pulling    22m   kubelet            Pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest"
  Normal  Pulled     21m   kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest" in 26.606s (54.05s including waiting). Image size: 755335817 bytes.
  Normal  Created    21m   kubelet            Created container: auth
  Normal  Started    21m   kubelet            Started container auth
```

- We can see the logs of the `auth` pod and see that it is running.

```bash
kubectl logs auth-f6d6f5559-bwt7g -n jobber
{"level":30,"time":1742537745335,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"PrismaModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"ConfigHostModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"JwtModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"UsersModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"GraphQLSchemaBuilderModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"GraphQLModule dependencies initialized"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"InstanceLoader","msg":"AuthModule dependencies initialized"}
{"level":40,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":40,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"RoutesResolver","msg":"AuthController {/api}:"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"GraphQLModule","msg":"Mapped {/graphql, POST} route"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"NestApplication","msg":"Nest application successfully started"}
{"level":30,"time":1742537745336,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","msg":"🚀 Application is running on: http://localhost:3000/api"}
{"level":30,"time":1742537745401,"pid":1,"hostname":"auth-f6d6f5559-bwt7g","context":"NestMicroservice","msg":"Nest microservice successfully started"}
```

### 11.10 Creating Kubernetes Services to expose actual network traffic to our underlying

- We are going to create Kubernetes Services to expose actual network traffic to our underlying for the `auth` and `jobs` services.

- We need to create the `service.http.yaml` file for the `auth` service for exposing the `http` ports to the outside world.

> charts/jobber/templates/auth/service.http.yaml

```yaml
{{- if .Values.auth.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: auth-http
  labels:
    app: auth
spec:
  type: ClusterIP
  selector:
    app: auth
  ports:
    - protocol: TCP
      port: {{ .Values.auth.port.http }}
      targetPort: {{ .Values.auth.port.http }}
{{- end }}
```

- We need to create the `service.grpc.yaml` file for the `auth` service for exposing the `grpc` ports to the outside world.

> charts/jobber/templates/auth/service.grpc.yaml

```yaml
{{- if .Values.auth.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: auth-grpc
  labels:
    app: auth
spec:
  type: ClusterIP
  selector:
    app: auth
  ports:
    - protocol: TCP
      port: {{ .Values.auth.port.grpc }}
      targetPort: {{ .Values.auth.port.grpc }}
{{- end }}
```

- We need to create the `service.yaml` file for the `jobs` service for exposing the `http` port to the outside world.

> charts/jobber/templates/jobs/service.yaml

```yaml
{{- if .Values.jobs.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: jobs
  labels:
    app: jobs
spec:
  type: ClusterIP
  selector:
    app: jobs
  ports:
    - protocol: TCP
      port: {{ .Values.jobs.port }}
      targetPort: {{ .Values.jobs.port }}
{{- end }}
```

- We need to upgrade the `jobber` chart again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm upgrade jobber . -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Fri Mar 21 17:17:35 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 3
TEST SUITE: None
```

- We can check the services see that they are running.

```bash
 kubectl get svc -n jobber
NAME        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
auth-grpc   ClusterIP   10.102.190.3     <none>        5000/TCP   12m
auth-http   ClusterIP   10.100.168.38    <none>        3000/TCP   12m
jobs        ClusterIP   10.107.128.185   <none>        3001/TCP   12m
```

### 11.11 Accessing the services from inside the cluster using Minikube

- We can access the services from inside the cluster using Minikube.

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
| jobber    | jobs |             | http://127.0.0.1:35537 |
|-----------|------|-------------|------------------------|
🎉  Opening service jobber/jobs in default browser...
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
Opening in existing browser session.
```

- We can open that URL in the browser and see the `jobs` service.
- Where we can see there is an error because we have access to the `/graphql` endpoint.

![Jobs Service](image034.png)

- If we access the `/graphql` endpoint we can it is working.

![Jobs Service GraphQL](image035.png)

- We can even run a query.

![Jobs Service GraphQL Query](image036.png)

- We can access to the `auth` service using the `auth-http` service.

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
| jobber    | auth-http |             | http://127.0.0.1:41025 |
|-----------|-----------|-------------|------------------------|
🎉  Opening service jobber/auth-http in default browser...
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
Opening in existing browser session.
```

### 11.12 Running the Prisma database migrations

- We need to run the Prisma database migrations so that any changes to the database schema are applied in the database from the cluster.
- We need to modify the `libs/prisma/package.json` file to include the `prisma` npm package inside the `dependencies` section instead of the `devDependencies` section. The reason for this is that we need the dependency tp be copy inside the docker image, as if it is only in the `devDependencies` section, it will not be copied.

> libs/prisma/package.json

```json
{
  "name": "@jobber/prisma",
  "version": "0.0.0",
  "dependencies": {
    "@prisma/client": "^6.4.1",
    "prisma": "^6.4.1"
  }
}
```

- We need to update the `charts/jobber/templates/auth/deployment.yaml` file to include the `prisma-migrate` init container.

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
+     initContainers:
+       - name: prisma-migrate
+         image: {{ .Values.auth.image }}
+         imagePullPolicy: {{ .Values.global.imagePullPolicy }}
+         command: ["sh", "-c"]
+         args:
+           - |
+             npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma
+         env:
+           {{- include "common.env" . | nindent 12 }}
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
{{- end }}
```

- We need to upgrade the `jobber` chart again.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm upgrade jobber . -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Fri Mar 21 17:17:35 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 3
TEST SUITE: None
```

- Once we ensure the `GitHub Actions` pipeline is working, we can execute `helm upgrade jobber . -n jobber` to deploy the changes to the cluster.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/charts/jobber$ helm upgrade jobber . -n jobber
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Sat Mar 22 04:50:16 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 4
TEST SUITE: None
```

- We can check the pods to see that the `auth` service has been restarted and the `prisma-migrate` init container has been executed.

```bash
kubectl get pods -n jobberkubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS        AGE
auth-cf965b874-t2t8x        1/1     Running   0               64s
executor-56d7cb958f-vr6qp   1/1     Running   2 (5m37s ago)   21h
jobs-54b647f788-qvpbg       1/1     Running   1 (6m40s ago)   21h
```

- We can see the logs of the `auth` service to see that the `prisma-migrate` init container has been executed.

```bash
kubectl logs auth-cf965b874-t2t8x -c prisma-migrate -n jobber
npm warn exec The following package was not found and will be installed: prisma@6.5.0
Prisma schema loaded from apps/auth/prisma/schema.prisma
Datasource "db": PostgreSQL database "jobber", schema "public" at "jobber-postgresql.postgresql.svc.cluster.local:5432"

1 migration found in prisma/migrations

Applying migration `20250216044013_users`

The following migration(s) have been applied:

migrations/
  └─ 20250216044013_users/
    └─ migration.sql

All migrations have been successfully applied.
```

- We can try again to access the `auth` service from the browser and see that it is working.
- We have to execute `minikube service auth-http -n jobber` to have access to the service.

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
| jobber    | auth-http |             | http://127.0.0.1:41325 |
|-----------|-----------|-------------|------------------------|
🎉  Opening service jobber/auth-http in default browser...
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
Opening in existing browser session.
```

- We need to try to create a user using the `auth` service from the browser.

> Request:

```
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
```

> Response:

```json
{
  "data": {
    "upsertUser": {
      "id": "1",
      "email": "my-email2@msn.com",
      "createdAt": "2025-03-22T05:13:32.787Z",
      "updatedAt": "2025-03-22T05:13:32.786Z"
    }
  }
}
```

- Now, we can try to authenticate using the `auth` service from the browser.

![Auth Service User Created](image037.png)

> Request:

```
mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword1!" }) {
    id
  }
}
```

> Response:

```json
{
  "errors": [
    {
      "message": "\"expiresIn\" should be a number of seconds or string representing a timespan eg: \"1d\", \"20h\", 60",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["login"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ],
  "data": null
}
```

- We can see that the error is because the `expiresIn` is not properly defined in our `values.yaml` document.
- If we describe the `auth` service.

```bash
kubectl describe po auth-cf965b874-t2t8x -n jobber
Name:             auth-cf965b874-t2t8x
Namespace:        jobber
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Sat, 22 Mar 2025 04:50:19 +0000
Labels:           app=auth
                  pod-template-hash=cf965b874
Annotations:      <none>
Status:           Running
IP:               10.244.0.69
IPs:
  IP:           10.244.0.69
Controlled By:  ReplicaSet/auth-cf965b874
Init Containers:
  prisma-migrate:
    Container ID:  docker://5801390b21c939547afff80c12ba625e50392e36a8a0d8235241f380192ee6ef
    Image:         072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest
    Image ID:      docker-pullable://072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth@sha256:dc8c7dc608ee63461c16115425ca8f456ce81a4bbad9c3ea55be82e6ed7bcbbc
    Port:          <none>
    Host Port:     <none>
    Command:
      sh
      -c
    Args:
      npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma

    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Sat, 22 Mar 2025 04:50:21 +0000
      Finished:     Sat, 22 Mar 2025 04:50:25 +0000
    Ready:          True
    Restart Count:  0
    Environment:
      PULSAR_SERVICE_URL:  pulsar://jobber-pulsar-broker.pulsar.svc.cluster.local:6650
      DATABASE_URL:        postgresql://postgres:postgres@jobber-postgresql.postgresql.svc.cluster.local:5432/jobber
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-s5j29 (ro)
Containers:
  auth:
    Container ID:   docker://75584a0b735698890493b3d6e85d52927581f14e4e3ffe2a93f21bf6306e02f3
    Image:          072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest
    Image ID:       docker-pullable://072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth@sha256:dc8c7dc608ee63461c16115425ca8f456ce81a4bbad9c3ea55be82e6ed7bcbbc
    Ports:          3000/TCP, 5000/TCP
    Host Ports:     0/TCP, 0/TCP
    State:          Running
      Started:      Sat, 22 Mar 2025 04:50:27 +0000
    Ready:          True
    Restart Count:  0
    Environment:
      PULSAR_SERVICE_URL:     pulsar://jobber-pulsar-broker.pulsar.svc.cluster.local:6650
      DATABASE_URL:           postgresql://postgres:postgres@jobber-postgresql.postgresql.svc.cluster.local:5432/jobber
      PORT:                   3000
      JWT_SECRET:             CBm2b6nKxeDTl2UOZxbR6YwqDbUmxAJl
      JWT_EXPIRATION_MS:      2.88e+07
      AUTH_GRPC_SERVICE_URL:  0.0.0.0:5000
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-s5j29 (ro)
Conditions:
  Type                        Status
  PodReadyToStartContainers   True
  Initialized                 True
  Ready                       True
  ContainersReady             True
  PodScheduled                True
Volumes:
  kube-api-access-s5j29:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   BestEffort
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  34m   default-scheduler  Successfully assigned jobber/auth-cf965b874-t2t8x to minikube
  Normal  Pulling    33m   kubelet            Pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest"
  Normal  Pulled     33m   kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest" in 994ms (994ms including waiting). Image size: 821651218 bytes.
  Normal  Created    33m   kubelet            Created container: prisma-migrate
  Normal  Started    33m   kubelet            Started container prisma-migrate
  Normal  Pulling    33m   kubelet            Pulling image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest"
  Normal  Pulled     33m   kubelet            Successfully pulled image "072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest" in 771ms (771ms including waiting). Image size: 821651218 bytes.
  Normal  Created    33m   kubelet            Created container: auth
  Normal  Started    33m   kubelet            Started container auth
```

- We can see that the `JWT_EXPIRATION_MS` is set to `2.88e+07` which is not a valid value.
- We need to set the `JWT_EXPIRATION_MS` to a valid value.

```diff
.
auth:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/auth:latest
  port:
    http: 3000
    grpc: 5000
  jwt:
    secret: CBm2b6nKxeDTl2UOZxbR6YwqDbUmxAJl
-   expirationMs: 28800000
+   expirationMs: "28800000"
```

- We need to upgrade the `jobber` chart again.
- If we execute the login mutation again, we can see that it is working.

> Request:

```graphql
mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword1!" }) {
    id
  }
}
```

> Response:

```json
{
  "data": {
    "login": {
      "id": "1"
    }
  }
}
```

- We are ready to test the `jobs` service.
- We need to execute the `minikube service jobs-http -n jobber` command to have access to the service.

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
| jobber    | auth-http |             | http://127.0.0.1:42469 |
|-----------|-----------|-------------|------------------------|
🎉  Opening service jobber/auth-http in default browser...
❗  Because you are using a Docker driver on linux, the terminal needs to be open to run it.
Opening in existing browser session.
```

- If we try to execute the the `jobsMetadata` query.

> Request:

```
query {
  jobsMetadata {
    name
    description
  }
}
```

> Response:

```json
{
  "errors": [
    {
      "message": "Forbidden resource",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["jobsMetadata"],
      "extensions": {
        "code": "FORBIDDEN",
        "originalError": {
          "message": "Forbidden resource",
          "error": "Forbidden",
          "statusCode": 403
        }
      }
    }
  ],
  "data": null
}
```

- We can see that the error is because the `jobs` service is not authenticated.
- We can see the logs of the `jobs` service to see what is happening.

```bash
kubectl logs jobs-54b647f788-qvpbg -n jobber
[
  {
    meta: {
      name: 'Fibonacci',
      description: 'Generate a Fibonacci sequence and store it in the DB.'
    },
    discoveredClass: {
      name: 'FibonacciJob',
      instance: [FibonacciJob],
      injectType: [class FibonacciJob extends AbstractJob],
      dependencyType: [class FibonacciJob extends AbstractJob],
      parentModule: [Object]
    }
  }
]
{"level":30,"time":1742618718080,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"ClientsModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"ConfigHostModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"DiscoveryModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"PulsarModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"GraphQLSchemaBuilderModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"JobsModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"InstanceLoader","msg":"GraphQLModule dependencies initialized"}
{"level":40,"time":1742618718081,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
.
{"level":50,"time":1742622368266,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"GqlAuthGuard","err":{"type":"Error","message":"14 UNAVAILABLE: No connection established. Last error: connect ECONNREFUSED 127.0.0.1:5000 (2025-03-22T05:45:01.040Z)","stack":"Error: 14 UNAVAILABLE: No connection established. Last error: connect ECONNREFUSED 127.0.0.1:5000 (2025-03-22T05:45:01.040Z)\n    at callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:32:19)\n    at Object.onReceiveStatus (/app/node_modules/@grpc/grpc-js/build/src/client.js:193:76)\n    at Object.onReceiveStatus (/app/node_modules/@grpc/grpc-js/build/src/client-interceptors.js:361:141)\n    at Object.onReceiveStatus (/app/node_modules/@grpc/grpc-js/build/src/client-interceptors.js:324:181)\n    at /app/node_modules/@grpc/grpc-js/build/src/resolving-call.js:129:78\n    at process.processTicksAndRejections (node:internal/process/task_queues:85:11)\nfor call at\n    at ServiceClientImpl.makeUnaryRequest (/app/node_modules/@grpc/grpc-js/build/src/client.js:161:32)\n    at ServiceClientImpl.<anonymous> (/app/node_modules/@grpc/grpc-js/build/src/make-client.js:105:19)\n    at Observable._subscribe (/app/node_modules/@nestjs/microservices/client/client-grpc.js:198:48)\n    at Observable._trySubscribe (/app/node_modules/rxjs/dist/cjs/internal/Observable.js:41:25)\n    at /app/node_modules/rxjs/dist/cjs/internal/Observable.js:35:31\n    at Object.errorContext (/app/node_modules/rxjs/dist/cjs/internal/util/errorContext.js:22:9)\n    at Observable.subscribe (/app/node_modules/rxjs/dist/cjs/internal/Observable.js:26:24)\n    at /app/node_modules/rxjs/dist/cjs/internal/operators/map.js:9:16\n    at OperatorSubscriber.<anonymous> (/app/node_modules/rxjs/dist/cjs/internal/util/lift.js:14:28)\n    at /app/node_modules/rxjs/dist/cjs/internal/Observable.js:30:30","code":14,"details":"No connection established. Last error: connect ECONNREFUSED 127.0.0.1:5000 (2025-03-22T05:45:01.040Z)","metadata":{}},"msg":"14 UNAVAILABLE: No connection established. Last error: connect ECONNREFUSED 127.0.0.1:5000 (2025-03-22T05:45:01.040Z)"}
{"level":30,"time":1742622368267,"pid":1,"hostname":"jobs-54b647f788-qvpbg","context":"GqlLoggingPlugin","requestId":"a1f8fa3f-8ae4-48aa-83dd-02356b1ece96","query":"query {\n  jobsMetadata {\n    name\n    description\n  }\n}","statusCode":200,"duration":"3ms"}
```

- We can see the reason is that the `jobs` is not working because it is trying to connect to the `auth` service using `localhost` instead of expected `kubernetes url`.
- We want to provide our auth `gRPC service name` here, so that we send the request to our gRPC server
- We need to modify the `JobsModule` to use the `kubernetes url` to connect to the `auth` service.

- We need to change the `.env` file to include the `AUTH_GRPC_SERVICE_URL` variable.

> apps/jobs/.env

```diff
PORT=3001
PULSAR_SERVICE_URL=pulsar://localhost:6650
+AUTH_GRPC_SERVICE_URL=localhost:5000
```

- We need to change the `deployment.yaml` file to include the `AUTH_GRPC_SERVICE_URL` variable.

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
+           - name: AUTH_GRPC_SERVICE_URL
+             value: "auth-grpc:{{ .Values.auth.port.grpc }}"
            - name: PORT
              value: "{{ .Values.jobs.port }}"

{{- end }}
```

- We need to update the `JobsModule` to use the `AUTH_GRPC_SERVICE_URL` variable.

> apps/jobs/src/app/jobs.module.ts

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ClientsModule.registerAsync([
      {
        name: AUTH_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [FibonacciJob, JobsService, JobsResolver],
})
export class JobsModule {}
```

- Once we have updated the jobber chart with `helm upgrade jobber . -n jobber`, we can see that the `jobs` service is working.
- We can execute the `jobsMetadata` query again to see that it is working.

> Request:

```http
query {
  jobsMetadata {
    name
    description
  }
}
```

> Response:

````json
{
  "data": {
    "jobsMetadata": []
  }
}
```{
  "data": {
    "jobsMetadata": [
      {
        "name": "Fibonacci",
        "description": "Generate a Fibonacci sequence and store it in the DB."
      }
    ]
  }
}
````

- We can try to execute the `Fibonacci` job.

> Request:

```http
mutation {
  executeJob(executeJobInput: {name: "Fibonacci", data: {iterations: 40}}) {
    name
  }
}
```

> Response:

```json
{
  "data": {
    "executeJob": {
      "name": "Fibonacci"
    }
  }
}
```

- We can see the logs of the `executor` service to see that the `Fibonacci` job is working.

```bash
kubectl logs executor-56d7cb958f-vr6qp -n jobber
{"level":30,"time":1742618779312,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"NestFactory","msg":"Starting Nest application..."}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"AppModule dependencies initialized"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"ConfigHostModule dependencies initialized"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"ConfigModule dependencies initialized"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"PulsarModule dependencies initialized"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"JobsModule dependencies initialized"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"InstanceLoader","msg":"LoggerModule dependencies initialized"}
{"level":40,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":40,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"LegacyRouteConverter","msg":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"NestApplication","msg":"Nest application successfully started"}
{"level":30,"time":1742618779313,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","msg":"🚀 Application is running on: http://localhost:3002/api"}
{"level":30,"time":1742643288711,"pid":1,"hostname":"executor-56d7cb958f-vr6qp","context":"Fibonacci","msg":"FibonacciConsumer: Result: {\n  \"number\": \"102334155\",\n  \"length\": 9,\n  \"iterations\": \"40\",\n  \"ms\": 2\n}"}
```
