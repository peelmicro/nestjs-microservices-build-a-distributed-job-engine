# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 12)

## 14 Setting up the Helm Chart for Production (continued)

### 14.9 Testing the Helm Chart in the Production Environment

#### 14.9.1 Updating the `jobs.http` file

- We need to update the `jobs.http` file to use the production environment.

> apps/jobs/src/app/job.http

```http
# @urlLogin = http://localhost:3000/graphql

# @url = http://localhost:3001/graphql

# @urlLogin = http://jobber-local.com/auth/graphql
# @ host = jobber-local.com

@urlLogin = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/auth/graphql
@url = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/jobs/graphql
@host = jobber-backend.com
### Login
# @name login
POST {{urlLogin}}
Host: {{host}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword1!" }) {
    id
  }
}

### Install httpbin and run using docker with "docker run -p 80:80 kennethreitz/httpbin"
GET http://0.0.0.0:80/anything
Content-Type: application/json
X-Full-Response: {{login.response.body.*}}

### Get jobs metadata
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  jobsMetadata {
    name
    description
  }
}

### Execute Fibonacci job with invalid name
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Bad"}) {
    name
  }
}

### Execute Fibonacci job with one message
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci", data: {iterations: 40}}) {
    name
  }
}

### Execute Fibonacci job with multiple messages
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci", data: [{iterations: 40}, {iterations: 41}]}) {
    name
  }
}


### Execute Fibonacci job with invalid data

POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "Fibonacci", data: {iteration: 40}}) {
    name
  }
}

# @urlRest = http://localhost:3001/api
#@urlRest = http://127.0.0.1:46051/api
#@urlRest = http://jobber-local.com/jobs
@urlRest = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/jobs

### Upload file
POST {{urlRest}}/uploads/upload
Host: {{host}}
Content-Type: multipart/form-data ; boundary=MfnBoundry

--MfnBoundry
Content-Disposition: form-data; name="file"; filename="products.json"
Content-Type: application/json

< ./data/products.json

--MfnBoundry--


### Execute Load Products job with one filename
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "LoadProducts", data: {fileName: "file-1742659574274-319632607.json"}}) {
    name
  }
}
```

#### 14.9.2 Create a new user in the production environment

- We need to execute `### Create a user` from the `users.http` file:

> apps/auth/src/app/users/users.http

```http
@url = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/auth/graphql
@host = jobber-backend.com

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
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 08:21:02 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 141
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"8d-1gOuLImDL0eCNPOZBHZ8nKnyb9Q"

{
  "data": {
    "upsertUser": {
      "id": "1",
      "email": "my-email2@msn.com",
      "createdAt": "2025-04-01T08:21:02.045Z",
      "updatedAt": "2025-04-01T08:21:02.044Z"
    }
  }
}
```

#### 14.9.3 Logging in the production environment

- We need to execute `### Login` from the `jobs.http` file:

> apps/jobs/src/app/job.http

```http
@urlLogin = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/auth/graphql
@url = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/jobs/graphql
@host = jobber-backend.com
### Login
# @name login
POST {{urlLogin}}
Host: {{host}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  login(loginInput: { email: "my-email2@msn.com", password: "MyPassword1!" }) {
    id
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 08:27:52 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 30
Connection: close
X-Powered-By: Express
Set-Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MzQ5NjA3MiwiZXhwIjoxNzQzNTI0ODcyfQ.FTXEBoFas2gJMxO4ic6mun0sf1nKcgPIZexDkc8alD8; Path=/; Expires=Mon, 01 Jul 2080 00:55:44 GMT; HttpOnly
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

#### 14.9.4 Updloading the products file in the production environment

- We need to execute `### Upload file` from the `jobs.http` file:

> apps/jobs/src/app/job.http

```http
@urlRest = http://k8s-myingressgroup-9cf944356d-2123168966.eu-north-1.elb.amazonaws.com/jobs

### Upload file
POST {{urlRest}}/uploads/upload
Host: {{host}}
Content-Type: multipart/form-data ; boundary=MfnBoundry

--MfnBoundry
Content-Disposition: form-data; name="file"; filename="products.json"
Content-Type: application/json

< ./data/products.json

--MfnBoundry--
```

- We get the following response:

```json
HTTP/1.1 201 Created
Date: Tue, 01 Apr 2025 08:37:44 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Connection: close
X-Powered-By: Express
ETag: W/"57-rn5DUx1uBgU3vCEoZLWoIKhwU+s"

{
  "message": "File uploaded successfully",
  "filename": "file-1743496662577-722169074.json"
}
```

#### 14.9.5 Executing a job in the production environment

- We need to execute `### Execute Load Products job with one filename` from the `jobs.http` file:

> apps/jobs/src/app/job.http

```http
### Execute Load Products job with one filename
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "LoadProducts", data: {fileName: "file-1743496662577-722169074.json"}}) {
    name
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 08:43:33 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 48
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"30-/M4kLcVyISYwL5nFCGTaXBJBQDM"

{
  "data": {
    "executeJob": {
      "name": "LoadProducts"
    }
  }
}
```

#### 14.9.6 Getting a job by id in the production environment

- We need to execute `### Get job by id` from the `jobs.http` file:

> apps/jobs/src/app/job.http

```http
### Get job by id
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  job(id: 1) {
    id
    name
    size
    status
    started
    ended
    completed
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 08:52:09 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 155
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"9b-rX1WxLM5jQX7S6aeaASC+UAGHjE"

{
  "data": {
    "job": {
      "id": "1",
      "name": "LoadProducts",
      "size": 100000,
      "status": "IN_PROGRESS",
      "started": "2025-04-01T08:43:28.053Z",
      "ended": null,
      "completed": 63293
    }
  }
}
```

- We need to execute `### Get job by id` again from the `jobs.http` file when the job is completed to get to know how long it took to complete:

> apps/jobs/src/app/job.http

```http
### Get job by id
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  job(id: 1) {
    id
    name
    size
    status
    started
    ended
    completed
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 08:57:04 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 176
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"b0-AtlaECrapek4OJXcVntDzEqMcQg"

{
  "data": {
    "job": {
      "id": "1",
      "name": "LoadProducts",
      "size": 100000,
      "status": "COMPLETED",
      "started": "2025-04-01T08:43:28.053Z",
      "ended": "2025-04-01T08:57:01.446Z",
      "completed": 100000
    }
  }
}
```

- So, the job took 13 minutes and 33 seconds to complete.

#### 14.9.7 Scaling the job engine in the production environment

- We can see the current number of replicas of the job engine in the production environment by executing:

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS      AGE
auth-6557955857-j8wgw       1/1     Running   0             16h
executor-78b8864ff-nm4rs    1/1     Running   4 (16h ago)   16h
jobs-5fd88f9d7b-s6c5g       1/1     Running   0             16h
products-865ff79986-b4qgb   1/1     Running   0             16h
```

- We can see that the job engine has 1 replica.
- We need to scale the job engine in the production environment.
- We need to execute `kubectl scale deployment executor --replicas=10 -n jobber` to scale the job engine to 10 replicas.

```bash
kubectl scale deployment executor --replicas=10 -n jobber
deployment.apps/executor scaled
```

- We need to execute `kubectl get pods -n jobber` to get the pods:

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS      AGE
auth-6557955857-j8wgw       1/1     Running   0             16h
executor-78b8864ff-2lt57    1/1     Running   0             18s
executor-78b8864ff-2q69q    1/1     Running   0             18s
executor-78b8864ff-69tx8    1/1     Running   0             18s
executor-78b8864ff-9zrlx    1/1     Running   0             18s
executor-78b8864ff-cbr48    1/1     Running   0             18s
executor-78b8864ff-cjvxr    1/1     Running   0             18s
executor-78b8864ff-nm4rs    1/1     Running   4 (16h ago)   16h
executor-78b8864ff-pb2hz    1/1     Running   0             18s
executor-78b8864ff-rbq7j    1/1     Running   0             18s
executor-78b8864ff-zx9s6    1/1     Running   0             18s
jobs-5fd88f9d7b-s6c5g       1/1     Running   0             16h
products-865ff79986-b4qgb   1/1     Running   0             16h
```

- We can see that the job engine has 10 replicas.
- We need to execute again the `### Execute Load Products job with one filename` to see the job being executed using the 10 replicas.

> apps/jobs/src/app/job.http

```http
### Execute Load Products job with one filename
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

mutation {
  executeJob(executeJobInput: {name: "LoadProducts", data: {fileName: "file-1743496662577-722169074.json"}}) {
    name
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 09:07:48 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 48
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"30-/M4kLcVyISYwL5nFCGTaXBJBQDM"

{
  "data": {
    "executeJob": {
      "name": "LoadProducts"
    }
  }
}
```

- We need to check how the job is being executed using the 10 replicas.

> apps/jobs/src/app/job.http

```http
### Get job by id
POST {{url}}
Host: {{host}}
Content-Type: application/json
Cookie: {{login.response.headers.Set-Cookie}}
X-REQUEST-TYPE: GraphQL

query {
  job(id: 2) {
    id
    name
    size
    status
    started
    ended
    completed
  }
}
```

- We get the following response:

```json
HTTP/1.1 200 OK
Date: Tue, 01 Apr 2025 09:17:02 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 176
Connection: close
X-Powered-By: Express
cache-control: no-store
ETag: W/"b0-+seD03tSH8fcadpmrPHXrftckL4"

{
  "data": {
    "job": {
      "id": "2",
      "name": "LoadProducts",
      "size": 100000,
      "status": "COMPLETED",
      "started": "2025-04-01T09:07:43.389Z",
      "ended": "2025-04-01T09:13:43.978Z",
      "completed": 100000
    }
  }
}
```

- We can see that the job took 6 minutes and 1 second to complete.

#### 14.10 Setting up a custom domain and SSL certificate

##### 14.10.1 Creating a custom domain

- We need to create a custom domain.
- We can go to `Route 53 in AWS` and create a new domain.
- In our case, I'm going to use a subdomain called `jobber.peelmicro.com` from my domain `peelmicro.com`, that is already registered.

##### 14.10.2 Creating a certificate

- We need to create a certificate.
- We can go to `Certificate Manager in AWS` and create a new certificate.
- In our case, I'm going to use a subdomain called `jobber.peelmicro.com` from my domain `peelmicro.com`, that is already registered.

![Accessing Certificate Manager](images069.png)

- We need to access `Request a certificate`.

![Request a certificate](images070.png)

- We need to select `Request a public certificate` and click on `Next`.

- We need to select `Request a public certificate`.

![Request a public certificate](images071.png)

- We need to put the domain name `jobber.peelmicro.info` and click on `Request`.

![Request a certificate](images072.png)

- The certificate has been created successfully, but we need to verify the ownership of the domain.

![Verify ownership](images073.png)

- We need to select `DNS validation` and click on `Next`.

![DNS validation](images074.png)

![AWS Certificate Manager DNS validation](images075.png)

![How CNAME records for ACM work](images076.png)

![Example of a CNAME record](images077.png)

- So, considering this information from AWS, we need to create a CNAME record in our domain.

![Create a CNAME record](images078.png)

- We need to create a CNAME record with the following information:
- Domain: `jobber.peelmicro.info.`
- Type: `CNAME`
- CNAME Name: `_f3a6ba792e25873f5e34167076db036a.jobber.peelmicro.info`
- CNAME Value: `_5d23ed1dfa993fe90cf761a8ba378873.xlfgrmvvlj.acm-validations.aws`

- From our domain registrar, <https://account.squarespace.com/> , we need to create a CNAME record
- Click on `Add Record`

![Click on Nueva Entrada](images079.png)

- We need to create a CNAME record with the following information and then click on `Save`:

- HOST: `_f3a6ba792e25873f5e34167076db036a.jobber`
- TYPE: `CNAME`
- ALIAS DATA: `_5d23ed1dfa993fe90cf761a8ba378873.xlfgrmvvlj.acm-validations.aws`

![Create a CNAME record](images080.png)

- We can see the CNAME record in the `Records` section:

![CNAME record](images081.png)

- We need to wait for the certificate to be verified.
- After a few minutes, we can see it has been verified:

![Certificate verified](images082.png)

- Copy and paste the `Certificate ARN` in the `Certificate Manager` in AWS.
- "ARN": `arn:aws:acm:eu-north-1:072929378285:certificate/2e31309b-7a26-4455-994a-01c8b39f1524`

#### 14.10.3 Updating the `ingress.yaml` file to include the arn

- We need to update the `ingress.yaml` file to include the arn.

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
    alb.ingress.kubernetes.io/group.name: my-ingress-group
+   # alb.ingress.kubernetes.io/listen-ports: '[{ "HTTP": 80 }]'
+   alb.ingress.kubernetes.io/listen-ports: '[{ "HTTP": 80 }, { "HTTPS": 443 }]'
+   alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-north-1:072929378285:certificate/2e31309b-7a26-4455-994a-01c8b39f1524
+   alb.ingress.kubernetes.io/ssl-redirect: "443"
{{- end }}
spec:
{{- if .Values.ingress.alb }}
  ingressClassName: alb
{{- end }}
  rules:
    - host:
-     {{ if .Values.ingress.alb }} jobber-backend.com {{ else }} jobber-local.com {{ end }}
+     {{ if .Values.ingress.alb }}jobber.peelmicro.info{{ else }}jobber-local.com{{ end }}
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
LAST DEPLOYED: Tue Apr  1 18:15:56 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 10
TEST SUITE: None
```

- We need to rollout the `aws-load-balancer-controller` pods:

```bash
kubectl rollout restart deployment aws-load-balancer-controller -n kube-system
deployment.apps/aws-load-balancer-controller restarted
```

- We need to check the ingress:

```bash
kubectl get ingress -n jobber
NAME      CLASS   HOSTS                   ADDRESS                                                                PORTS   AGE
ingress   alb     jobber.peelmicro.info   k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com   80      51s
```

- We need to create a new CNAME record in our domain registrar:
- Click on `Add Record`

![Click on Add Record](images083.png)

- We need to create a CNAME record with the following information and then click on `Save`:

- HOST: `jobber`
- TYPE: `CNAME`
- ALIAS DATA: `k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com`

![Create a CNAME record](images084.png)

- We can see the CNAME record in the `Records` section:

![CNAME record](images085.png)

- We need to wait for the DNS to be updated.
- After a few minutes, we can see it has been updated:
- We can monitor DNS propagation by executing the following command:

```bash
dig jobber.peelmicro.info

; <<>> DiG 9.18.30-0ubuntu0.24.04.2-Ubuntu <<>> jobber.peelmicro.info
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14927
;; flags: qr rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;jobber.peelmicro.info.         IN      A

;; ANSWER SECTION:
jobber.peelmicro.info.  14400   IN      CNAME   k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com.
k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com. 60 IN A 51.21.40.225
k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com. 60 IN A 13.48.218.165
k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com. 60 IN A 13.50.254.21

;; Query time: 164 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; WHEN: Wed Apr 02 08:56:00 CEST 2025
;; MSG SIZE  rcvd: 180
```

- We can also check it using `curl`:

```bash
curl -v https://jobber.peelmicro.info/auth/graphql
* Host jobber.peelmicro.info:443 was resolved.
* IPv6: (none)
* IPv4: 13.48.218.165, 51.21.40.225, 13.50.254.21
*   Trying 13.48.218.165:443...
* Connected to jobber.peelmicro.info (13.48.218.165) port 443
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
*  CAfile: /etc/ssl/certs/ca-certificates.crt
*  CApath: /etc/ssl/certs
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
* TLSv1.2 (IN), TLS handshake, Server finished (14):
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS handshake, Finished (20):
* TLSv1.2 (IN), TLS handshake, Finished (20):
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256 / prime256v1 / rsaEncryption
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=jobber.peelmicro.info
*  start date: Apr  1 00:00:00 2025 GMT
*  expire date: Apr 30 23:59:59 2026 GMT
*  subjectAltName: host "jobber.peelmicro.info" matched cert's "jobber.peelmicro.info"
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M03
*  SSL certificate verify ok.
*   Certificate level 0: Public key type RSA (2048/112 Bits/secBits), signed using sha256WithRSAEncryption
*   Certificate level 1: Public key type RSA (2048/112 Bits/secBits), signed using sha256WithRSAEncryption
*   Certificate level 2: Public key type RSA (2048/112 Bits/secBits), signed using sha256WithRSAEncryption
* using HTTP/2
* [HTTP/2] [1] OPENED stream for https://jobber.peelmicro.info/auth/graphql
* [HTTP/2] [1] [:method: GET]
* [HTTP/2] [1] [:scheme: https]
* [HTTP/2] [1] [:authority: jobber.peelmicro.info]
* [HTTP/2] [1] [:path: /auth/graphql]
* [HTTP/2] [1] [user-agent: curl/8.5.0]
* [HTTP/2] [1] [accept: */*]
> GET /auth/graphql HTTP/2
> Host: jobber.peelmicro.info
> User-Agent: curl/8.5.0
> Accept: */*
>
< HTTP/2 400
< date: Wed, 02 Apr 2025 06:58:20 GMT
< content-type: application/json; charset=utf-8
< content-length: 148
< x-powered-by: Express
< cache-control: no-store
< etag: W/"94-npaMbIB5erTaplHAdDd5m/mgtR8"
<
{"errors":[{"message":"GraphQL operations must contain a non-empty `query` or a `persistedQuery` extension.","extensions":{"code":"BAD_REQUEST"}}]}
* Connection #0 to host jobber.peelmicro.info left intact
```

- We can also add `+trace` to the `dig` command to get more information:

```bash
dig jobber.peelmicro.info +trace

; <<>> DiG 9.18.30-0ubuntu0.24.04.2-Ubuntu <<>> jobber.peelmicro.info +trace
;; global options: +cmd
.                       6155    IN      NS      c.root-servers.net.
.                       6155    IN      NS      l.root-servers.net.
.                       6155    IN      NS      b.root-servers.net.
.                       6155    IN      NS      f.root-servers.net.
.                       6155    IN      NS      i.root-servers.net.
.                       6155    IN      NS      d.root-servers.net.
.                       6155    IN      NS      j.root-servers.net.
.                       6155    IN      NS      h.root-servers.net.
.                       6155    IN      NS      m.root-servers.net.
.                       6155    IN      NS      g.root-servers.net.
.                       6155    IN      NS      a.root-servers.net.
.                       6155    IN      NS      e.root-servers.net.
.                       6155    IN      NS      k.root-servers.net.
;; Received 811 bytes from 127.0.0.53#53(127.0.0.53) in 1 ms

info.                   172800  IN      NS      a0.info.afilias-nst.info.
info.                   172800  IN      NS      a2.info.afilias-nst.info.
info.                   172800  IN      NS      b0.info.afilias-nst.org.
info.                   172800  IN      NS      b2.info.afilias-nst.org.
info.                   172800  IN      NS      c0.info.afilias-nst.info.
info.                   172800  IN      NS      d0.info.afilias-nst.org.
info.                   86400   IN      DS      5104 8 2 1AF7548A8D3E2950C20303757DF9390C26CFA39E26C8B6A8F6C8B1E7 2DD8F744
info.                   86400   IN      RRSIG   DS 8 1 86400 20250415050000 20250402040000 53148 . G2QVfBl/pOocBwnvXtyX1atkaoN/BkmBRhwePdmTbSsE6oj5NDwc6GsZ gJPQb5cpPs7N5atr60eMx9diuQs+FvWj68syDCM+fGd1HB6les6FB0q1 J5xBJt1rlGCAcf0oePjTW0GpIujO2XlIOn5zMATy4PtP60F62HlYLNky cgFhepzz4DyG2zPK8Z3Vt1EIlb0dJITFpkhd007UeDEz+2mHTQQWn4D+ Oakc+1n2DL1vXa47p2Ay27DzFyfv8qoefy7FNS5nX2Z1PU36jWxLkYK+ +djNIMlCwX2W1nHRK2ltdf1BklzcrHPQeQ/9nJFv/qi+GhUfV85QIRQI iYWbuQ==
;; Received 829 bytes from 199.7.83.42#53(l.root-servers.net) in 14 ms

peelmicro.info.         3600    IN      NS      ns-cloud-d2.googledomains.com.
peelmicro.info.         3600    IN      NS      ns-cloud-d1.googledomains.com.
peelmicro.info.         3600    IN      NS      ns-cloud-d4.googledomains.com.
peelmicro.info.         3600    IN      NS      ns-cloud-d3.googledomains.com.
nts9719ejeced08jegq9ombmafneqsd7.info. 3600 IN NSEC3 1 1 0 73 NTSGCQ8BFTQMNBICKSE3JQEV1V3UTMRU NS SOA RRSIG DNSKEY NSEC3PARAM
nts9719ejeced08jegq9ombmafneqsd7.info. 3600 IN RRSIG NSEC3 8 2 3600 20250423065359 20250402055359 22704 info. thEgvbEDZUEUpD47nzVCK4NTtVl4Ug7k2AN1xB4SbZioeB6ZmZHE6anB Efju22MEvXHOMqrf4lI8lNgN9y6hHWBYTii33R1+dEi3Ylib/F6qn1h9 aiLFn6lMvSbfenbQMXdfUWdB8MNEqGN1SSiBWH+3HZX2fKNh9xihXEZ4 q1Q=
0njk896ieo5jceq4c0rktvc1k1a70uh5.info. 3600 IN NSEC3 1 1 0 73 0NJPEUH04UJOC0U5AUDQORDOQNLUCRLG NS DS RRSIG
0njk896ieo5jceq4c0rktvc1k1a70uh5.info. 3600 IN RRSIG NSEC3 8 2 3600 20250422153947 20250401143947 22704 info. yfN+hiGTzN0sx6i4Tu//pakzgzwimwT9P6f6KZiKhWQTSWjDKjIYIIb2 Jr0wLIdBZzFUsTBrtPHVV5l4XLP05Lvfcy9IjgoTQA6gy5bQWG+j7XQi Vd5N9shVAo11s+nqModXXY0jKNcfgJuH8lypq4ROzc0aq4uvjw1e62m/ Jbs=
;; Received 660 bytes from 199.249.113.1#53(a2.info.afilias-nst.info) in 37 ms

jobber.peelmicro.info.  14400   IN      CNAME   k8s-myingressgroup-9cf944356d-356065777.eu-north-1.elb.amazonaws.com.
;; Received 165 bytes from 216.239.32.109#53(ns-cloud-d1.googledomains.com) in 35 ms
```

#### 14.10.4 Updating the `values.yaml`, `values-aws.yaml` and `auth/deployment.yaml` files to include the `SECURE_COOKIE` variable

- We need to update the `values.yaml` to include the `secure: false` variable.

> charts/jobber/values.yaml

```diff
global:
  imagePullPolicy: Always

ingress:
  alb: false

pulsar:
  namespace: pulsar
  namespaceCreate: true
  # Disable VictoriaMetrics components completely
  victoria-metrics-k8s-stack:
    enabled: false
# Disable monitoring components
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
  primary:
    initdb:
      scripts:
        create-dbs.sql: |
          CREATE DATABASE auth;
          CREATE DATABASE products;
          CREATE DATABASE jobs;
jobs:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/jobs:latest
  port:
    http: 3001
    grpc: 5002

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
    expirationMs: "28800000"
+   secure: false

products:
  enabled: true
  replicas: 1
  image: 072929378285.dkr.ecr.eu-north-1.amazonaws.com/jobber/products:latest
  port:
    http: 3003
    grpc: 5001
```

- We need to update the `values-aws.yaml` to include the `secure: true` variable.

> charts/jobber/values-aws.yaml

```diff
ingress:
  alb: true

persistence:
  ebs: true

+auth:
+ jwt:
+   secure: true

pulsar:
  global:
    storageClass: "ebs-sc"

  zookeeper:
    persistence:
      storageClass: "ebs-sc"
    volumes:
      data:
        storageClassName: "ebs-sc"

  bookkeeper:
    volumes:
      journal:
        storageClassName: "ebs-sc"
      ledgers:
        storageClassName: "ebs-sc"

postgresql:
  primary:
    resources:
      limits:
        cpu: 1
    persistence:
      storageClass: "ebs-sc"
```

- We need to update the `auth/deployment.yaml` to include the `SECURE_COOKIE` variable.

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
            - name: DATABASE_URL
              value: postgresql://postgres:postgres@{{ .Release.Name }}-postgresql.postgresql.svc.cluster.local:5432/auth
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
+           {{- if .Values.auth.jwt.secure }}
+           - name: SECURE_COOKIE
+             value: "{{ .Values.auth.jwt.secure }}"
+           {{- end }}
            - name: JWT_SECRET
              value: {{ .Values.auth.jwt.secret }}
            - name: JWT_EXPIRATION_MS
              value: "{{ .Values.auth.jwt.expirationMs }}"
            - name: AUTH_GRPC_SERVICE_URL
              value: "0.0.0.0:{{ .Values.auth.port.grpc }}"
            - name: DATABASE_URL
              value: postgresql://postgres:postgres@{{ .Release.Name }}-postgresql.postgresql.svc.cluster.local:5432/auth
{{- end }}
```

- We need to upgrade the helm chart:

```bash
helm upgrade jobber ./charts/jobber -n jobber --values ./charts/jobber/values-aws.yaml
coalesce.go:237: warning: skipped value for pulsar.persistence: Not a table.
Release "jobber" has been upgraded. Happy Helming!
NAME: jobber
LAST DEPLOYED: Tue Apr  1 18:53:34 2025
NAMESPACE: jobber
STATUS: deployed
REVISION: 11
TEST SUITE: None
```

## 15 Debugging

- We can enable the `debugger` for our microservices so that you can attach breakpoints to your application code and actually pause the execution of our application when we send a request to our server, for example.
- And this makes it a lot easier to debug any issues you may be having.

### 15.1 Updating the `webpack.app.config.js` file to enable `source maps`

- We need to update the `webpack.app.config.js` file to enable `source maps`.

> apps/auth/webpack.app.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
+     sourceMap: true,
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
    }),
  ],
};
```

- We need to do the same for the `webpack.lib.config.js` file.

> apps/auth/webpack.lib.config.js

```diff
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  output: {
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      outputFileName: 'index.ts',
      main: './src/index.ts',
      tsConfig: './tsconfig.lib.json',
+     sourceMap: true,
      optimization: false,
      outputHashing: 'none',
    }),
  ],
};
```

- We need to build the application with the `source maps` enabled.

```bash
nx build auth --skipNxCache

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



   Hint: you can run the command with --verbose to see the full dependent project outputs

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


> nx run auth:generate-prisma

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 77ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want real-time updates to your database without manual polling? Discover how with Pulse: https://pris.ly/tip-0-pulse


> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 26.7 KiB [entry] [rendered]
webpack compiled successfully (993c309ddb7233b0)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 5 tasks it depends on (16s)
```

- If we got to `dist/apps/auth` we can see the `main.js.map` document.

![main.js.map](images086.png)

- We need to change in the `visual studio code` the `Run and Debug` settings to enable `source maps`.
- We need to click on `create a launch.json file` and then select `Node.js: Attach to Chrome`.

![Enable source maps](images087.png)

![Create a Node.js: Attach to Chrome launch.json file](images088.png)

- It will create a `launch.json` file in the `.vscode` folder.

> .vscode/launch.json

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${file}",
      "outFiles": ["${workspaceFolder}/**/*.js"]
    }
  ]
}
```

- We need to update the `launch.json` file to include some changes.

> .vscode/launch.json

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Auth Debug",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/auth",
      "port": 9229
    }
  ]
}
```

- We need to serve `auth`:

```bash
nx serve auth

 NX   Running target serve for project auth and 6 tasks it depends on:

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run auth:generate-prisma

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 100ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize

┌─────────────────────────────────────────────────────────┐
│  Update available 6.4.1 -> 6.5.0                        │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

> nx run grpc:generate-ts-proto

> npx protoc --plugin=protoc-gen-ts_proto=../../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/lib/types/proto --proto_path=./src/lib/proto src/lib/proto/*.proto --ts_proto_opt=nestJs=true --ts_proto_opt=exportCommonSymbols=false --ts_proto_opt=outputServices=grpc-js


> nx run nestjs:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 2.87 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 2.87 KiB [entry] [rendered]
webpack compiled successfully (bebb78a2fd045980)

> nx run grpc:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 15.4 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 15.4 KiB [entry] [rendered]
webpack compiled successfully (a515135d70edadd2)

> nx run graphql:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 4.8 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 4.8 KiB [entry] [rendered]
webpack compiled successfully (e56656fe3c6f06b9)

> nx run auth:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 26.7 KiB [entry] [rendered]
webpack compiled successfully (993c309ddb7233b0)

> nx run auth:serve:development


 NX   Running target build for project auth and 5 tasks it depends on:

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto  [existing outputs match the cache, left as is]


> nx run auth:generate-prisma  [existing outputs match the cache, left as is]

> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.4.1) to ./../../node_modules/@prisma-clients/auth in 100ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize

┌─────────────────────────────────────────────────────────┐
│  Update available 6.4.1 -> 6.5.0                        │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

> nx run nestjs:build  [existing outputs match the cache, left as is]


> nx run grpc:build  [existing outputs match the cache, left as is]


> nx run graphql:build  [existing outputs match the cache, left as is]


> nx run auth:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 26.7 KiB [entry] [rendered]
webpack compiled successfully (993c309ddb7233b0)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project auth and 5 tasks it depends on

Nx read the output from the cache instead of running the command for 5 out of 6 tasks.

Debugger listening on ws://localhost:9229/98f93717-d321-4da6-9710-4df9d0704dce
For help, see: https://nodejs.org/en/docs/inspector

[19:29:54.198] INFO (1353038): Starting Nest application... {"context":"NestFactory"}
[19:29:54.198] INFO (1353038): AppModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): PrismaModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): ConfigHostModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): JwtModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): UsersModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): GraphQLSchemaBuilderModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): GraphQLModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] INFO (1353038): AuthModule dependencies initialized {"context":"InstanceLoader"}
[19:29:54.198] WARN (1353038): Unsupported route path: "/auth/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[19:29:54.198] WARN (1353038): Unsupported route path: "/auth/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[19:29:54.198] INFO (1353038): AuthController {/auth}: {"context":"RoutesResolver"}
[19:29:54.198] INFO (1353038): Mapped {/auth/graphql, POST} route {"context":"GraphQLModule"}
[19:29:54.198] INFO (1353038): Nest application successfully started {"context":"NestApplication"}
[19:29:54.199] INFO (1353038): 🚀 Application is running on: http://localhost:3000/auth
[19:29:54.283] INFO (1353038): Nest microservice successfully started {"context":"NestMicroservice"}
```

- We need to run the debugger:

![Run the debugger](images089.png)

- We can see now the debugger has been attached:

![Debugger attached](images090.png)

- We can put breakpoints in the `users.resolver.ts` file:

![Breakpoints](images091.png)

- We can run the `users.http` file:

> apps/auth/src/app/users/users.http

```bash
@url = http://localhost:3000/auth/graphql

### Create a user

POST {{url}}
#Host: {{host}}
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation {
  upsertUser(upsertUserInput: {
    email: "my-email3@msn.com",
    password: "MyPassword3!"
  })
  {
    id
    email
    createdAt
    updatedAt
  }
}
```

- We can see the breakpoints have been hit:

![Breakpoints hit](images092.png)

- We need to do the same for the other services by updating the `launch.json` file.

> .vscode/launch.json

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Auth Debug",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/auth",
      "port": 9229
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Executor Debug",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/executor",
      "port": 9230
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Jobs Debug",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/jobs",
      "port": 9231
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Products Debug",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/products",
      "port": 9232
    }
  ]
}
```

- We need to update the `projects.json` file to include the port assigned for debugging each service:

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
      "dependsOn": ["generate-prisma", "^build"]
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
+       "port": 9229,
        "buildTarget": "auth:build",
        "runBuildTargetDependencies": true
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
      "dependsOn": ["generate-prisma"],
      "options": {
        "passWithNoTests": true
      }
    },
    "generate-prisma": {
      "command": "prisma generate",
      "options": {
        "cwd": "{projectRoot}",
        "input": ["prisma/schema.prisma"]
      },
      "cache": true
    },
    "migrate-prisma": {
      "command": "prisma migrate dev",
      "options": {
        "cwd": "{projectRoot}"
      }
    }
  }
}
```

> apps/executor/project.json

```diff
{
  "name": "executor",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/executor/src",
  "projectType": "application",
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
+       "port": 9230,
        "buildTarget": "executor:build",
        "runBuildTargetDependencies": false
      },
      "configurations": {
        "development": {
          "buildTarget": "executor:build:development"
        },
        "production": {
          "buildTarget": "executor:build:production"
        }
      }
    }
  },
  "tags": []
}
```

> apps/jobs/project.json

```diff
{
  "name": "jobs",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/jobs/src",
  "projectType": "application",
  "tags": [],
  "targets": {
    "build": {
      "dependsOn": ["generate-prisma", "^build"]
    },
    "test": {
      "dependsOn": ["generate-prisma"]
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "dependsOn": ["build"],
      "options": {
+       "port": 9231,
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
    "generate-prisma": {
      "command": "prisma generate",
      "options": {
        "cwd": "{projectRoot}",
        "input": ["prisma/schema.prisma"]
      },
      "cache": true
    },
    "migrate-prisma": {
      "command": "prisma migrate dev",
      "options": {
        "cwd": "{projectRoot}"
      }
    }
  }
}
```

> apps/products/project.json

```diff
{
  "name": "products",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/products/src",
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
+       "port": 9232,
        "buildTarget": "products:build",
        "runBuildTargetDependencies": false
      },
      "configurations": {
        "development": {
          "buildTarget": "products:build:development"
        },
        "production": {
          "buildTarget": "products:build:production"
        }
      }
    },
    "generate-drizzle": {
      "command": "drizzle-kit generate",
      "options": {
        "cwd": "{projectRoot}"
      }
    },
    "migrate-drizzle": {
      "command": "drizzle-kit migrate",
      "options": {
        "cwd": "{projectRoot}"
      }
    }
  }
}
```

- We need to build all the services:

```bash
nx build auth executor jobs productsnx run-many -t build --skipNxCache

   ✔  nx run grpc:generate-ts-proto (3s)
   ✔  nx run pulsar:build (3s)
   ✔  nx run nestjs:build (3s)
   ✔  nx run jobs:generate-prisma (1s)
   ✔  nx run auth:generate-prisma (1s)
   ✔  nx run grpc:build (5s)
   ✔  nx run prisma:build (4s)
   ✔  nx run executor:build (6s)
   ✔  nx run graphql:build (6s)
   ✔  nx run products:build (6s)
   ✔  nx run auth:build (5s)
   ✔  nx run jobs:build (5s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 9 projects and 3 tasks they depend on (19s)
```

- We need to serve all the services:

```bash
yarn serve:all
```

- We need to start the debugger for the services with want to debug:

![Start the debugger](images093.png)

## 16 Stop the AWS services

### 16.1 Check the current costs

We can see the current costs of the AWS services for just one day:

![AWS costs](images094.png)

![AWS detailed costs](images095.png)

### 16.2 Scaling the executor service to just 1 instance

We can scale the executor service to just 1 instance by running the following command:

```bash
kubectl scale deployment executor --replicas=1 -n jobber
deployment.apps/executor scaled
```

- We need to ensure that only 1 instance is running:

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS      AGE
auth-67cb9c98-bjhz4         1/1     Running   0             14h
executor-78b8864ff-nm4rs    1/1     Running   4 (39h ago)   39h
jobs-5fd88f9d7b-s6c5g       1/1     Running   0             39h
products-865ff79986-b4qgb   1/1     Running   0             39h
```

### 16.3 Stopping the Elastic Compute Cloud (EC2) instances

- List the running instances to find their IDs:

```bash
aws ec2 describe-instances --query "Reservations[*].Instances[*].InstanceId" --output text
i-0b8019bfb73fe0bf1
i-05c3df34196ee6533
```

- Stop the instances using its ID:

```bash
aws ec2 stop-instances --instance-ids i-0b8019bfb73fe0bf1
{
    "StoppingInstances": [
        {
            "InstanceId": "i-0b8019bfb73fe0bf1",
            "CurrentState": {
                "Code": 64,
                "Name": "stopping"
            },
            "PreviousState": {
                "Code": 16,
                "Name": "running"
            }
        }
    ]
}
```

- Verify that the instance is stopped:

```bash
aws ec2 describe-instances --instance-ids i-0b8019bfb73fe0bf1 --query 'Reservations[0].Instances[0].State.Name' --output text
stopped
```

- Verify that the instance is stopped:

```bash
aws ec2 stop-instances --instance-ids i-05c3df34196ee6533aws ec2 stop-instances --instance-ids i-05c3df34196ee6533
{
    "StoppingInstances": [
        {
            "InstanceId": "i-05c3df34196ee6533",
            "CurrentState": {
                "Code": 64,
                "Name": "stopping"
            },
            "PreviousState": {
                "Code": 16,
                "Name": "running"
            }
        }
    ]
}
```

- Verify that the instance is stopped:

```bash
aws ec2 describe-instances --instance-ids i-05c3df34196ee6533 --query 'Reservations[0].Instances[0].State.Name' --output text
stopped
```

> Note: Stopping an EC2 instance will halt charges for instance hours, but costs for attached resources like Elastic IPs or EBS volumes may still apply.

- We can start them again by executing: `aws ec2 start-instances`

### 16.4 Managing Elastic Container Service for Kubernetes (EKS)

- We can see the current clusters:

```bash
aws eks list-clusters
{
    "clusters": [
        "jobber"
    ]
}
```

- Or by executing:

```bash
aws eks list-clusters --query 'clusters[]' --output table
--------------
|ListClusters|
+------------+
|  jobber    |
+------------+
```

- We need to see what namespaces are available:

```bash
kubectl get namespaces
NAME              STATUS   AGE
default           Active   43h
jobber            Active   39h
kube-node-lease   Active   43h
kube-public       Active   43h
kube-system       Active   43h
postgresql        Active   40h
pulsar            Active   39h
```

- We should delete all namespaces except the system ones before deleting the cluster. Here's what to do:
- Safe to delete:
  - jobber
  - postgresql
  - pulsar
- DON'T delete these system namespaces:

  - kube-system
  - kube-public
  - kube-node-lease
  - default

- We can delete the namespaces that are safe to delete by executing:

```bash
kubectl delete namespace jobber postgresql pulsar
namespace "jobber" deleted
namespace "postgresql" deleted
namespace "pulsar" deleted
```

- We need to get the nodegroups:

```bash
aws eks list-nodegroups --cluster-name jobber
{
    "nodegroups": [
        "ng-fa2d9068"
    ]
}
```

- We can delete the nodegroup by executing:

```bash
aws eks delete-nodegroup --cluster-name jobber --nodegroup-name ng-fa2d9068
{
    "nodegroup": {
        "nodegroupName": "ng-fa2d9068",
        "nodegroupArn": "arn:aws:eks:eu-north-1:072929378285:nodegroup/jobber/ng-fa2d9068/fecaf619-4c89-f89f-dd67-76dd217605d3",
        "clusterName": "jobber",
        "version": "1.32",
        "releaseVersion": "1.32.1-20250317",
        "createdAt": "2025-03-31T14:34:56.441000+02:00",
        "modifiedAt": "2025-04-02T10:15:46.537000+02:00",
        "status": "DELETING",
        "capacityType": "ON_DEMAND",
        "scalingConfig": {
            "minSize": 2,
            "maxSize": 2,
            "desiredSize": 2
        },
        "instanceTypes": [
            "m5.large"
        ],
        "subnets": [
            "subnet-0e096700420b9035a",
            "subnet-0007eb0d55b6beb0c",
            "subnet-0c6589b7016d9a9e7"
        ],
        "amiType": "AL2_x86_64",
        "nodeRole": "arn:aws:iam::072929378285:role/eksctl-jobber-nodegroup-n
g-fa2d906-NodeInstanceRole-J9bgz66OUQlU",
        "labels": {
            "alpha.eksctl.io/cluster-name": "jobber",
            "alpha.eksctl.io/nodegroup-name": "ng-fa2d9068"
        },
        "resources": {
            "autoScalingGroups": [
                {
                    "name": "eks-ng-fa2d9068-fecaf619-4c89-f89f-dd67-76dd2176
05d3"
                }
            ]
        },
        "health": {
            "issues": []
        },
        "updateConfig": {
            "maxUnavailable": 1
        },
        "launchTemplate": {
            "name": "eksctl-jobber-nodegroup-ng-fa2d9068",
            "version": "1",
            "id": "lt-0ce6f63012401a1f0"
        },
        "tags": {
            "aws:cloudformation:stack-name": "eksctl-jobber-nodegroup-ng-fa2d
9068",
            "alpha.eksctl.io/cluster-name": "jobber",
            "alpha.eksctl.io/nodegroup-name": "ng-fa2d9068",
            "aws:cloudformation:stack-id": "arn:aws:cloudformation:eu-north-1
:072929378285:stack/eksctl-jobber-nodegroup-ng-fa2d9068/7bd08b60-0e2c-11f0-b5
4e-06c8497fa2e9",
            "eksctl.cluster.k8s.io/v1alpha1/cluster-name": "jobber",
            "aws:cloudformation:logical-id": "ManagedNodeGroup",
            "alpha.eksctl.io/nodegroup-type": "managed",
            "alpha.eksctl.io/eksctl-version": "0.206.0"
        }
    }
}
```

- We can check the status of the nodegroup by executing:

```bash
aws eks describe-nodegroup --cluster-name jobber --nodegroup-name ng-fa2d9068
{
    "nodegroup": {
        "nodegroupName": "ng-fa2d9068",
        "nodegroupArn": "arn:aws:eks:eu-north-1:072929378285:nodegroup/jobber/ng-fa2d9068/fecaf619-4c89-f89f-dd67-76dd217605d3",
        "clusterName": "jobber",
        "version": "1.32",
        "releaseVersion": "1.32.1-20250317",
        "createdAt": "2025-03-31T14:34:56.441000+02:00",
        "modifiedAt": "2025-04-02T10:15:46.537000+02:00",
        "status": "DELETING",
        "capacityType": "ON_DEMAND",
        "scalingConfig": {
            "minSize": 2,
            "maxSize": 2,
            "desiredSize": 2
        },
        "instanceTypes": [
            "m5.large"
        ],
        "subnets": [
            "subnet-0e096700420b9035a",
            "subnet-0007eb0d55b6beb0c",
            "subnet-0c6589b7016d9a9e7"
        ],
        "amiType": "AL2_x86_64",
        "nodeRole": "arn:aws:iam::072929378285:role/eksctl-jobber-nodegroup-n
g-fa2d906-NodeInstanceRole-J9bgz66OUQlU",
        "labels": {
            "alpha.eksctl.io/cluster-name": "jobber",
            "alpha.eksctl.io/nodegroup-name": "ng-fa2d9068"
        },
        "resources": {
            "autoScalingGroups": [
                {
                    "name": "eks-ng-fa2d9068-fecaf619-4c89-f89f-dd67-76dd2176
05d3"
                }
            ]
        },
        "health": {
            "issues": []
        },
        "updateConfig": {
            "maxUnavailable": 1
        },
        "launchTemplate": {
            "name": "eksctl-jobber-nodegroup-ng-fa2d9068",
            "version": "1",
            "id": "lt-0ce6f63012401a1f0"
        },
        "tags": {
            "aws:cloudformation:stack-name": "eksctl-jobber-nodegroup-ng-fa2d
9068",
            "alpha.eksctl.io/cluster-name": "jobber",
            "alpha.eksctl.io/nodegroup-name": "ng-fa2d9068",
            "aws:cloudformation:stack-id": "arn:aws:cloudformation:eu-north-1
:072929378285:stack/eksctl-jobber-nodegroup-ng-fa2d9068/7bd08b60-0e2c-11f0-b5
4e-06c8497fa2e9",
            "eksctl.cluster.k8s.io/v1alpha1/cluster-name": "jobber",
            "aws:cloudformation:logical-id": "ManagedNodeGroup",
            "alpha.eksctl.io/nodegroup-type": "managed",
            "alpha.eksctl.io/eksctl-version": "0.206.0"
        }
    }
}
```

- We cannot delete the cluster until the nodegroup is deleted. So, executing the following command should show none:

```bash
aws eks list-nodegroups --cluster-name jobber
{
    "nodegroups": []
}
```

- We can delete the cluster by executing:

```bash
aws eks delete-cluster --name jobber
{
    "cluster": {
        "name": "jobber",
        "arn": "arn:aws:eks:eu-north-1:072929378285:cluster/jobber",
        "createdAt": "2025-03-31T14:24:38.671000+02:00",
        "version": "1.32",
        "endpoint": "https://88A5A66176B4BC811F2357B4C1CF0EB2.gr7.eu-north-1.eks.amazonaws.com",
        "roleArn": "arn:aws:iam::072929378285:role/eksctl-jobber-cluster-ServiceRole-ek5cr33W8crA",
        "resourcesVpcConfig": {
            "subnetIds": [
                "subnet-0c6589b7016d9a9e7",
                "subnet-0e096700420b9035a",
                "subnet-0007eb0d55b6beb0c",
                "subnet-0b56a3582da13d69c",
                "subnet-0cf5501aafdd54d07",
                "subnet-06f0b07fc8b44203e"
            ],
            "securityGroupIds": [
                "sg-09272c1d81c0c3ee5"
            ],
            "clusterSecurityGroupId": "sg-00c2b7ad569e8a5c4",
            "vpcId": "vpc-010680def416ce229",
            "endpointPublicAccess": true,
            "endpointPrivateAccess": false,
            "publicAccessCidrs": [
                "0.0.0.0/0"
            ]
        },
        "kubernetesNetworkConfig": {
            "serviceIpv4Cidr": "10.100.0.0/16",
            "ipFamily": "ipv4",
            "elasticLoadBalancing": {
                "enabled": false
            }
        },
        "logging": {
            "clusterLogging": [
                {
                    "types": [
                        "api",
                        "audit",
                        "authenticator",
                        "controllerManager",
                        "scheduler"
                    ],
                    "enabled": false
                }
            ]
        },
        "identity": {
            "oidc": {
                "issuer": "https://oidc.eks.eu-north-1.amazonaws.com/id/88A5A
66176B4BC811F2357B4C1CF0EB2"
            }
        },
        "status": "DELETING",
        "certificateAuthority": {
            "data": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCVENDQWUyZ0F3
SUJBZ0lJRXE1MDJjWkgza1F3RFFZSktvWklodmNOQVFFTEJRQXdGVEVUTUJFR0ExVUUKQXhNS2EzV
mlaWEp1WlhSbGN6QWVGdzB5TlRBek16RXhNakkwTURoYUZ3MHpOVEF6TWpreE1qSTVNRGhhTUJVeA
pFekFSQmdOVkJBTVRDbXQxWW1WeWJtVjBaWE13Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR
3QXdnZ0VLCkFvSUJBUURJWjdNWlVQSmJYN3d4YVZHS1hCemN3WFZBK1FCZWhNa0RPRjRuQlhBWDN2
Ykp1cVRLWmt0Vm5maG4KN21NNUNBNXlYaGZWL1k1dGl1aGpqR0gzOTliUmlWbVh5VDh1OW1kOHMwb
lZWK05aVnJRMStya1dhcW5Ja1VIQwpXcFB2M2k5WkZnb0I4VTRjQXRjVXBjVGlYMkI4V3JEZjNBbX
ludzhZWCtsWVJUWnJheUZSc3ZVejl0VnVTZjBUClljaGk0aWl1U0ZPUE5Oc2d5cERoUjJtS0NHaGx
GcFhFdkRuZTJDa0Ira01pTWNyTkNYOTRyS1d3eDRac2xiOHcKeWx5NEM2cmNRR2doN0dsd0VBQ1lK
SlNXbEZOdjllcEUxUUFkMFN6UUlHZDdjN2Zsak1YbTRRTmJtdmZWNW4rdwo4b2xDa2FjM3VyT1BnK
2pRVXY1T0Uxc1VrR1JyQWdNQkFBR2pXVEJYTUE0R0ExVWREd0VCL3dRRUF3SUNwREFQCkJnTlZIUk
1CQWY4RUJUQURBUUgvTUIwR0ExVWREZ1FXQkJSZjhvVG5PcUV5NGV6SnI3Q2hCNndwUFpVNHJqQVY
KQmdOVkhSRUVEakFNZ2dwcmRXSmxjbTVsZEdWek1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQld4
NmxLK2dWZwpBK0tvb2QwL2hnTEF5STkvWVZkc0E2VEVpc1pzMktqZ2JCdmNzdTZCQkZwM3dmNnVVR
040enFvRHZoM24wQko0CmE5L2hDKy9sQ1pPZ1VLL1FGSjZ2T1RBY2U3S1dTUzd5QzZLeURKaDNTa1
pSNm1wT0lSeDQxOFl0b0VUUVBtY1UKTE1sUFk3Yi9ZbjFML0dHczNtakZvZUR5ckxvM2xOOHhBY3Z
XNEk0TmtQSlNqZVB6ZllLT2pVY2t1MTdYampOUwo5VG5EZjBjc1JycUlTc2tvcTl5cW9TYW1MQWZa
cmpFY2ZoZjhNbTVpMVdyLzFCeUJHaVZEVWlLSEd6di9xUFp6CkljTWswZy9IWitndTlRVU5JOUEvM
VlQQ3JnZDVLY0xWNkswVEdvK0tMQllGRE1OYm9LOFlxa2tydC9NbXhmdmEKOG5aaVp6ZEFwR1A3Ci
0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
        },
        "platformVersion": "eks.5",
        "tags": {
            "aws:cloudformation:stack-name": "eksctl-jobber-cluster",
            "alpha.eksctl.io/cluster-name": "jobber",
            "aws:cloudformation:stack-id": "arn:aws:cloudformation:eu-north-1
:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec8
1",
            "eksctl.cluster.k8s.io/v1alpha1/cluster-name": "jobber",
            "alpha.eksctl.io/cluster-oidc-enabled": "true",
            "aws:cloudformation:logical-id": "ControlPlane",
            "alpha.eksctl.io/eksctl-version": "0.206.0",
            "Name": "eksctl-jobber-cluster/ControlPlane"
        },
        "accessConfig": {
            "authenticationMode": "API_AND_CONFIG_MAP"
        },
        "upgradePolicy": {
            "supportType": "EXTENDED"
        }
    }
}
```

- We can see the cluster has been deleted by executing and ensuring no clusters are returned:

```bash
aws eks list-clusters
{
    "clusters": []
}
```

### 16.5 Deleting the Virtual Private Cloud (VPC)

- We need to know the VPC IDs:

```bash
 aws ec2 describe-vpcs
{
    "Vpcs": [
        {
            "OwnerId": "072929378285",
            "InstanceTenancy": "default",
            "CidrBlockAssociationSet": [
                {
                    "AssociationId": "vpc-cidr-assoc-09a47dfc556bceeb7",
                    "CidrBlock": "192.168.0.0/16",
                    "CidrBlockState": {
                        "State": "associated"
                    }
                }
            ],
            "IsDefault": false,
            "Tags": [
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "VPC"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/VPC"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:
stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                }
            ],
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "VpcId": "vpc-010680def416ce229",
            "State": "available",
            "CidrBlock": "192.168.0.0/16",
            "DhcpOptionsId": "dopt-034eb9a537c66bdea"
        },
        {
            "OwnerId": "072929378285",
            "InstanceTenancy": "default",
            "CidrBlockAssociationSet": [
                {
                    "AssociationId": "vpc-cidr-assoc-09e7e1e91db21fa0a",
                    "CidrBlock": "172.31.0.0/16",
                    "CidrBlockState": {
                        "State": "associated"
                    }
                }
            ],
            "IsDefault": true,
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "VpcId": "vpc-0f6ab15fcc616541f",
            "State": "available",
            "CidrBlock": "172.31.0.0/16",
            "DhcpOptionsId": "dopt-034eb9a537c66bdea"
        }
    ]
}
```

- We can see we have 2 VPCs:

1. vpc-010680def416ce229 (192.168.0.0/16)
   - This is the EKS cluster VPC (created by eksctl)
   - Not the default VPC
   - Named "eksctl-jobber-cluster/VPC"
   - This is the one we can delete after the EKS cluster is gone
2. vpc-0f6ab15fcc616541f (172.31.0.0/16)
   - This is the default VPC (IsDefault": true)
   - Don't delete this one as it's the default VPC for your account

- We need to check what is there inside the VPC:

1. NAT Gateways

```bash
aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=vpc-010680def416ce229
{
    "NatGateways": [
        {
            "CreateTime": "2025-03-31T12:24:33+00:00",
            "NatGatewayAddresses": [
                {
                    "AllocationId": "eipalloc-028e3e43c104b85b7",
                    "NetworkInterfaceId": "eni-0cec225a297e8dfaf",
                    "PrivateIp": "192.168.20.146",
                    "PublicIp": "51.20.146.176",
                    "AssociationId": "eipassoc-04bfb61748d3a3870",
                    "IsPrimary": true,
                    "Status": "succeeded"
                }
            ],
            "NatGatewayId": "nat-012137850a87da93a",
            "State": "available",
            "SubnetId": "subnet-0007eb0d55b6beb0c",
            "VpcId": "vpc-010680def416ce229",
            "Tags": [
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:
stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "NATGateway"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/NATGateway"
                }
            ],
            "ConnectivityType": "public"
        }
    ]
}
```

- We can execute the following command to delete the NAT Gateway:

```bash
aws ec2 delete-nat-gateway --nat-gateway-id nat-012137850a87da93a
{
    "NatGatewayId": "nat-012137850a87da93a"
}
```

2. Internet Gateways

```bash
aws ec2 describe-internet-gateways --filters Name=attachment.vpc-id,Values=vpc-010680def416ce229
{
    "InternetGateways": [
        {
            "Attachments": [
                {
                    "State": "available",
                    "VpcId": "vpc-010680def416ce229"
                }
            ],
            "InternetGatewayId": "igw-0d27fd22632ddbde1",
            "OwnerId": "072929378285",
            "Tags": [
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "InternetGateway"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/InternetGateway"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                }
            ]
        }
    ]
}
```

- We can execute the following command to delete the Internet Gateway:

```bash
aws ec2 detach-internet-gateway --internet-gateway-id igw-0d27fd22632ddbde1 --vpc-id vpc-010680def416ce229
aws ec2 delete-internet-gateway --internet-gateway-id igw-0d27fd22632ddbde1
```

3. Subnets

```bash
 aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-010680def416ce229
{
    "Subnets": [
        {
            "AvailabilityZoneId": "eun1-az3",
            "MapCustomerOwnedIpOnLaunch": false,
            "OwnerId": "072929378285",
            "AssignIpv6AddressOnCreation": false,
            "Ipv6CidrBlockAssociationSet": [],
            "Tags": [
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "SubnetPrivateEUNORTH1C"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "kubernetes.io/role/internal-elb",
                    "Value": "1"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/SubnetPrivateEUNORTH1C"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                }
            ],
            "SubnetArn": "arn:aws:ec2:eu-north-1:072929378285:subnet/subnet-06f0b07fc8b44203e",
            "EnableDns64": false,
            "Ipv6Native": false,
            "PrivateDnsNameOptionsOnLaunch": {
                "HostnameType": "ip-name",
                "EnableResourceNameDnsARecord": false,
                "EnableResourceNameDnsAAAARecord": false
            },
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "SubnetId": "subnet-06f0b07fc8b44203e",
            "State": "available",
            "VpcId": "vpc-010680def416ce229",
            "CidrBlock": "192.168.160.0/19",
            "AvailableIpAddressCount": 8187,
            "AvailabilityZone": "eu-north-1c",
            "DefaultForAz": false,
            "MapPublicIpOnLaunch": false
        },
        {
            "AvailabilityZoneId": "eun1-az3",
            "MapCustomerOwnedIpOnLaunch": false,
            "OwnerId": "072929378285",
            "AssignIpv6AddressOnCreation": false,
            "Ipv6CidrBlockAssociationSet": [],
            "Tags": [
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "SubnetPublicEUNORTH1C"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "kubernetes.io/role/elb",
                    "Value": "1"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/SubnetPublicEUNORTH1C"
                }
            ],
            "SubnetArn": "arn:aws:ec2:eu-north-1:072929378285:subnet/subnet-0e096700420b9035a",
            "EnableDns64": false,
            "Ipv6Native": false,
            "PrivateDnsNameOptionsOnLaunch": {
                "HostnameType": "ip-name",
                "EnableResourceNameDnsARecord": false,
                "EnableResourceNameDnsAAAARecord": false
            },
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "SubnetId": "subnet-0e096700420b9035a",
            "State": "available",
            "VpcId": "vpc-010680def416ce229",
            "CidrBlock": "192.168.64.0/19",
            "AvailableIpAddressCount": 8187,
            "AvailabilityZone": "eu-north-1c",
            "DefaultForAz": false,
            "MapPublicIpOnLaunch": true
        },
        {
            "AvailabilityZoneId": "eun1-az1",
            "MapCustomerOwnedIpOnLaunch": false,
            "OwnerId": "072929378285",
            "AssignIpv6AddressOnCreation": false,
            "Ipv6CidrBlockAssociationSet": [],
            "Tags": [
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/SubnetPublicEUNORTH1A"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "SubnetPublicEUNORTH1A"
                },
                {
                    "Key": "kubernetes.io/role/elb",
                    "Value": "1"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                }
            ],
            "SubnetArn": "arn:aws:ec2:eu-north-1:072929378285:subnet/subnet-0007eb0d55b6beb0c",
            "EnableDns64": false,
            "Ipv6Native": false,
            "PrivateDnsNameOptionsOnLaunch": {
                "HostnameType": "ip-name",
                "EnableResourceNameDnsARecord": false,
                "EnableResourceNameDnsAAAARecord": false
            },
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "SubnetId": "subnet-0007eb0d55b6beb0c",
            "State": "available",
            "VpcId": "vpc-010680def416ce229",
            "CidrBlock": "192.168.0.0/19",
            "AvailableIpAddressCount": 8186,
            "AvailabilityZone": "eu-north-1a",
            "DefaultForAz": false,
            "MapPublicIpOnLaunch": true
        },
        {
            "AvailabilityZoneId": "eun1-az2",
            "MapCustomerOwnedIpOnLaunch": false,
            "OwnerId": "072929378285",
            "AssignIpv6AddressOnCreation": false,
            "Ipv6CidrBlockAssociationSet": [],
            "Tags": [
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/SubnetPrivateEUNORTH1B"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "kubernetes.io/role/internal-elb",
                    "Value": "1"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "SubnetPrivateEUNORTH1B"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                }
            ],
            "SubnetArn": "arn:aws:ec2:eu-north-1:072929378285:subnet/subnet-0cf5501aafdd54d07",
            "EnableDns64": false,
            "Ipv6Native": false,
            "PrivateDnsNameOptionsOnLaunch": {
                "HostnameType": "ip-name",
                "EnableResourceNameDnsARecord": false,
                "EnableResourceNameDnsAAAARecord": false
            },
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "SubnetId": "subnet-0cf5501aafdd54d07",
            "State": "available",
            "VpcId": "vpc-010680def416ce229",
            "CidrBlock": "192.168.128.0/19",
            "AvailableIpAddressCount": 8187,
            "AvailabilityZone": "eu-north-1b",
            "DefaultForAz": false,
            "MapPublicIpOnLaunch": false
        },
        {
            "AvailabilityZoneId": "eun1-az1",
            "MapCustomerOwnedIpOnLaunch": false,
            "OwnerId": "072929378285",
            "AssignIpv6AddressOnCreation": false,
            "Ipv6CidrBlockAssociationSet": [],
            "Tags": [
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "SubnetPrivateEUNORTH1A"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "kubernetes.io/role/internal-elb",
                    "Value": "1"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/SubnetPrivateEUNORTH1A"
                }
            ],
            "SubnetArn": "arn:aws:ec2:eu-north-1:072929378285:subnet/subnet-0b56a3582da13d69c",
            "EnableDns64": false,
            "Ipv6Native": false,
            "PrivateDnsNameOptionsOnLaunch": {
                "HostnameType": "ip-name",
                "EnableResourceNameDnsARecord": false,
                "EnableResourceNameDnsAAAARecord": false
            },
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "SubnetId": "subnet-0b56a3582da13d69c",
            "State": "available",
            "VpcId": "vpc-010680def416ce229",
            "CidrBlock": "192.168.96.0/19",
            "AvailableIpAddressCount": 8187,
            "AvailabilityZone": "eu-north-1a",
            "DefaultForAz": false,
            "MapPublicIpOnLaunch": false
        },
        {
            "AvailabilityZoneId": "eun1-az2",
            "MapCustomerOwnedIpOnLaunch": false,
            "OwnerId": "072929378285",
            "AssignIpv6AddressOnCreation": false,
            "Ipv6CidrBlockAssociationSet": [],
            "Tags": [
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/SubnetPublicEUNORTH1B"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "kubernetes.io/role/elb",
                    "Value": "1"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "SubnetPublicEUNORTH1B"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                }
            ],
            "SubnetArn": "arn:aws:ec2:eu-north-1:072929378285:subnet/subnet-0
c6589b7016d9a9e7",
            "EnableDns64": false,
            "Ipv6Native": false,
            "PrivateDnsNameOptionsOnLaunch": {
                "HostnameType": "ip-name",
                "EnableResourceNameDnsARecord": false,
                "EnableResourceNameDnsAAAARecord": false
            },
            "BlockPublicAccessStates": {
                "InternetGatewayBlockMode": "off"
            },
            "SubnetId": "subnet-0c6589b7016d9a9e7",
            "State": "available",
            "VpcId": "vpc-010680def416ce229",
            "CidrBlock": "192.168.32.0/19",
            "AvailableIpAddressCount": 8187,
            "AvailabilityZone": "eu-north-1b",
            "DefaultForAz": false,
            "MapPublicIpOnLaunch": true
        }
    ]
}
```

- We can execute the following command to delete the subnets:

```bash
aws ec2 delete-subnet --subnet-id subnet-06f0b07fc8b44203e  # Private EUNORTH1C
aws ec2 delete-subnet --subnet-id subnet-0e096700420b9035a  # Public EUNORTH1C
aws ec2 delete-subnet --subnet-id subnet-0007eb0d55b6beb0c  # Public EUNORTH1A
aws ec2 delete-subnet --subnet-id subnet-0cf5501aafdd54d07  # Private EUNORTH1B
aws ec2 delete-subnet --subnet-id subnet-0b56a3582da13d69c  # Private EUNORTH1A
aws ec2 delete-subnet --subnet-id subnet-0c6589b7016d9a9e7  # Public EUNORTH1B
```

4. Security Groups

```bash
aws ec2 describe-security-groups --filters Name=vpc-id,Values=vpc-010680def416ce229
{
    "SecurityGroups": [
        {
            "GroupId": "sg-03ed4db68fd912882",
            "IpPermissionsEgress": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [],
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ],
            "Tags": [
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/ClusterSharedNodeSecurityGroup"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "ClusterSharedNodeSecurityGroup"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                }
            ],
            "VpcId": "vpc-010680def416ce229",
            "SecurityGroupArn": "arn:aws:ec2:eu-north-1:072929378285:security-group/sg-03ed4db68fd912882",
            "OwnerId": "072929378285",
            "GroupName": "eksctl-jobber-cluster-ClusterSharedNodeSecurityGroup-EfYniojaVXgw",
            "Description": "Communication between all nodes in the cluster",
            "IpPermissions": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [
                        {
                            "Description": "Allow nodes to communicate with each other (all ports)",
                            "UserId": "072929378285",
                            "GroupId": "sg-03ed4db68fd912882"
                        },
                        {
                            "Description": "Allow managed and unmanaged nodes to communicate with each other (all ports)",
                            "UserId": "072929378285",
                            "GroupId": "sg-00c2b7ad569e8a5c4"
                        }
                    ],
                    "IpRanges": [],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ]
        },
        {
            "GroupId": "sg-04c31c66910478f95",
            "IpPermissionsEgress": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [],
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ],
            "VpcId": "vpc-010680def416ce229",
            "SecurityGroupArn": "arn:aws:ec2:eu-north-1:072929378285:security-group/sg-04c31c66910478f95",
            "OwnerId": "072929378285",
            "GroupName": "default",
            "Description": "default VPC security group",
            "IpPermissions": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [
                        {
                            "UserId": "072929378285",
                            "GroupId": "sg-04c31c66910478f95"
                        }
                    ],
                    "IpRanges": [],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ]
        },
        {
            "GroupId": "sg-09272c1d81c0c3ee5",
            "IpPermissionsEgress": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [],
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ],
            "Tags": [
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/ControlPlaneSecurityGroup"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "ControlPlaneSecurityGroup"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                }
            ],
            "VpcId": "vpc-010680def416ce229",
            "SecurityGroupArn": "arn:aws:ec2:eu-north-1:072929378285:security-group/sg-09272c1d81c0c3ee5",
            "OwnerId": "072929378285",
            "GroupName": "eksctl-jobber-cluster-ControlPlaneSecurityGroup-XwcnmEumt7FN",
            "Description": "Communication between the control plane and worker nodegroups",
            "IpPermissions": []
        },
        {
            "GroupId": "sg-00c2b7ad569e8a5c4",
            "IpPermissionsEgress": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [],
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ],
            "Tags": [
                {
                    "Key": "kubernetes.io/cluster/jobber",
                    "Value": "owned"
                },
                {
                    "Key": "aws:eks:cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "Name",
                    "Value": "eks-cluster-sg-jobber-1154749518"
                }
            ],
            "VpcId": "vpc-010680def416ce229",
            "SecurityGroupArn": "arn:aws:ec2:eu-north-1:072929378285:security-group/sg-00c2b7ad569e8a5c4",
            "OwnerId": "072929378285",
            "GroupName": "eks-cluster-sg-jobber-1154749518",
            "Description": "EKS created security group applied to ENI that is attached to EKS Control Plane master nodes, as well as any managed workloads.",
            "IpPermissions": [
                {
                    "IpProtocol": "-1",
                    "UserIdGroupPairs": [
                        {
                            "Description": "Allow unmanaged nodes to communicate with control plane (all ports)",
                            "UserId": "072929378285",
                            "GroupId": "sg-03ed4db68fd912882"
                        }
                    ],
                    "IpRanges": [],
                    "Ipv6Ranges": [],
                    "PrefixListIds": []
                }
            ]
        }
    ]
}
```

- We can execute the following command to delete the security groups:

```bash
aws ec2 delete-security-group --group-id sg-03ed4db68fd912882  # ClusterSharedNodeSecurityGroup
aws ec2 delete-security-group --group-id sg-09272c1d81c0c3ee5  # ControlPlaneSecurityGroup
aws ec2 delete-security-group --group-id sg-00c2b7ad569e8a5c4  # eks-cluster-sg

An error occurred (DependencyViolation) when calling the DeleteSecurityGroup operation: resource sg-03ed4db68fd912882 has a dependent object
{
    "Return": true,
    "GroupId": "sg-09272c1d81c0c3ee5"
}

An error occurred (DependencyViolation) when calling the DeleteSecurityGroup operation: resource sg-00c2b7ad569e8a5c4 has a dependent object
```

- That means that the security group is still in use by a resource. We need to delete the resource that is using the security group.
- We need to wait until the `nat-012137850a87da93a` NAT Gateway is deleted.

```bash
 aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=vpc-010680def416ce229
{
    "NatGateways": [
        {
            "CreateTime": "2025-03-31T12:24:33+00:00",
            "DeleteTime": "2025-04-02T08:44:51+00:00",
            "NatGatewayAddresses": [
                {
                    "AllocationId": "eipalloc-028e3e43c104b85b7",
                    "NetworkInterfaceId": "eni-0cec225a297e8dfaf",
                    "PrivateIp": "192.168.20.146",
                    "PublicIp": "51.20.146.176",
                    "AssociationId": "eipassoc-04bfb61748d3a3870",
                    "IsPrimary": true,
                    "Status": "succeeded"
                }
            ],
            "NatGatewayId": "nat-012137850a87da93a",
            "State": "deleted",
            "SubnetId": "subnet-0007eb0d55b6beb0c",
            "VpcId": "vpc-010680def416ce229",
            "Tags": [
                {
                    "Key": "aws:cloudformation:stack-name",
                    "Value": "eksctl-jobber-cluster"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "aws:cloudformation:stack-id",
                    "Value": "arn:aws:cloudformation:eu-north-1:072929378285:
stack/eksctl-jobber-cluster/0cfff910-0e2b-11f0-b86b-06f7f7f0ec81"
                },
                {
                    "Key": "eksctl.cluster.k8s.io/v1alpha1/cluster-name",
                    "Value": "jobber"
                },
                {
                    "Key": "alpha.eksctl.io/cluster-oidc-enabled",
                    "Value": "false"
                },
                {
                    "Key": "aws:cloudformation:logical-id",
                    "Value": "NATGateway"
                },
                {
                    "Key": "alpha.eksctl.io/eksctl-version",
                    "Value": "0.206.0"
                },
                {
                    "Key": "Name",
                    "Value": "eksctl-jobber-cluster/NATGateway"
                }
            ],
            "ConnectivityType": "public"
        }
    ]
}
```

- We need to remove the secuity groups first:

```bash
aws ec2 revoke-security-group-ingress --group-id sg-03ed4db68fd912882 --protocol -1 --source-group sg-03ed4db68fd912882
aws ec2 revoke-security-group-ingress --group-id sg-03ed4db68fd912882 --protocol -1 --source-group sg-00c2b7ad569e8a5c4
{
    "Return": true,
    "RevokedSecurityGroupRules": [
        {
            "SecurityGroupRuleId": "sgr-04350db4236aac194",
            "GroupId": "sg-03ed4db68fd912882",
            "IsEgress": false,
            "IpProtocol": "-1",
            "FromPort": -1,
            "ToPort": -1,
            "ReferencedGroupId": "sg-03ed4db68fd912882",
            "Description": "Allow nodes to communicate with each other (all ports)"
        }
    ]
}
{
    "Return": true,
    "RevokedSecurityGroupRules": [
        {
            "SecurityGroupRuleId": "sgr-039078ef4d374f4fb",
            "GroupId": "sg-03ed4db68fd912882",
            "IsEgress": false,
            "IpProtocol": "-1",
            "FromPort": -1,
            "ToPort": -1,
            "ReferencedGroupId": "sg-00c2b7ad569e8a5c4",
            "Description": "Allow managed and unmanaged nodes to communicate with each other (all ports)"
        }
    ]
}
```

- We can try to remove the security group egress:

```bash
aws ec2 revoke-security-group-egress --group-id sg-03ed4db68fd912882 --protocol -1 --cidr 0.0.0.0/0
{
    "Return": true,
    "RevokedSecurityGroupRules": [
        {
            "SecurityGroupRuleId": "sgr-02cb0df903ad9614b",
            "GroupId": "sg-03ed4db68fd912882",
            "IsEgress": true,
            "IpProtocol": "-1",
            "FromPort": -1,
            "ToPort": -1,
            "CidrIpv4": "0.0.0.0/0"
        }
    ]
}
```

- We can try to remove the security group:

```bash
aws ec2 delete-security-group --group-id sg-03ed4db68fd912882  # ClusterSharedNodeSecurityGroup
{
    "Return": true,
    "GroupId": "sg-03ed4db68fd912882"
}
```

- We need to remove other sequrity groups:

```bash
aws ec2 delete-security-group --group-id sg-00c2b7ad569e8a5c4
{
    "Return": true,
    "GroupId": "sg-00c2b7ad569e8a5c4"
}
```

- We need to delete route tables:

```bash
 # Delete all route tables except the main one (rtb-07f3679153671170f)
aws ec2 delete-route-table --route-table-id rtb-0765f831b1cc4b157
aws ec2 delete-route-table --route-table-id rtb-0cfc91fb6dbe721cd
aws ec2 delete-route-table --route-table-id rtb-044d3394014eaf4c1
aws ec2 delete-route-table --route-table-id rtb-0967883054284f01b
```

- We need to delete the VPC:

```bash
aws ec2 delete-vpc --vpc-id vpc-010680def416ce229
```

> Note: It would be better to delete the cluster by using `eksctl delete cluster --name jobber --region eu-north-1`.
