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
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 38915
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;jobber.peelmicro.info.         IN      A

;; ANSWER SECTION:
jobber.peelmicro.info.  14400   IN      CNAME   k8s-myingressgroup-9cf944356d-574987922.eu-north-1.elb.amazonaws.com.

;; AUTHORITY SECTION:
eu-north-1.elb.amazonaws.com. 60 IN     SOA     ns-1529.awsdns-63.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 60

;; Query time: 159 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; WHEN: Tue Apr 01 18:32:40 CEST 2025
;; MSG SIZE  rcvd: 214
```

- We can also check it using `curl`:

```bash
curl -v https://jobber.peelmicro.info/auth/graphql
* Could not resolve host: jobber.peelmicro.info
* Closing connection
curl: (6) Could not resolve host: jobber.peelmicro.info
```

- We can also add `+trace` to the `dig` command to get more information:

```bash
dig jobber.peelmicro.info +trace

; <<>> DiG 9.18.30-0ubuntu0.24.04.2-Ubuntu <<>> jobber.peelmicro.info +trace
;; global options: +cmd
.                       56339   IN      NS      m.root-servers.net.
.                       56339   IN      NS      a.root-servers.net.
.                       56339   IN      NS      b.root-servers.net.
.                       56339   IN      NS      c.root-servers.net.
.                       56339   IN      NS      d.root-servers.net.
.                       56339   IN      NS      e.root-servers.net.
.                       56339   IN      NS      f.root-servers.net.
.                       56339   IN      NS      g.root-servers.net.
.                       56339   IN      NS      h.root-servers.net.
.                       56339   IN      NS      i.root-servers.net.
.                       56339   IN      NS      j.root-servers.net.
.                       56339   IN      NS      k.root-servers.net.
.                       56339   IN      NS      l.root-servers.net.
;; Received 811 bytes from 127.0.0.53#53(127.0.0.53) in 10 ms

info.                   172800  IN      NS      a0.info.afilias-nst.info.
info.                   172800  IN      NS      a2.info.afilias-nst.info.
info.                   172800  IN      NS      b0.info.afilias-nst.org.
info.                   172800  IN      NS      b2.info.afilias-nst.org.
info.                   172800  IN      NS      c0.info.afilias-nst.info.
info.                   172800  IN      NS      d0.info.afilias-nst.org.
info.                   86400   IN      DS      5104 8 2 1AF7548A8D3E2950C20303757DF9390C26CFA39E26C8B6A8F6C8B1E7 2DD8F744
info.                   86400   IN      RRSIG   DS 8 1 86400 20250414050000 20250401040000 53148 . VlmmrIaERl6uxcFc/K2mkGa+F4K6v6zrYHrkRMUKVrYbSd3jEVCHux6A clpCjdikEKhbnuXIMca10bKbeuUfcFqM0PF3Pu1oRI7UWD+jtEXjRmTR Bi+tIZCxQ7+W2tm6liq9WD7Zbl5+grCBtLBjfBLS2uhorviAbm1SFeQb B1E4y/NcPSEwWQkCZs7+3KfXpEtRqupyNE/2ruUx/RhosgJo+D0YqpcA j3x+FtVC4pTZAGvedtLLCB/MF3ObuYb/B2khyNBO1mwPbNlVzAelQXbM mr7VgVNPaF8w+IMQNowLKcQXCmI+krYrPyHguE80SE2scYCKPyItP5lv zZAiSg==
;; Received 788 bytes from 199.7.91.13#53(d.root-servers.net) in 37 ms

;; communications error to 2001:500:41::1#53: timed out
;; communications error to 2001:500:41::1#53: timed out
;; communications error to 2001:500:41::1#53: timed out
peelmicro.info.         3600    IN      NS      ns-cloud-d1.googledomains.com.
peelmicro.info.         3600    IN      NS      ns-cloud-d2.googledomains.com.
peelmicro.info.         3600    IN      NS      ns-cloud-d3.googledomains.com.
peelmicro.info.         3600    IN      NS      ns-cloud-d4.googledomains.com.
nts9719ejeced08jegq9ombmafneqsd7.info. 3600 IN NSEC3 1 1 0 73 NTSGCQ8BFTQMNBICKSE3JQEV1V3UTMRU NS SOA RRSIG DNSKEY NSEC3PARAM
0njk896ieo5jceq4c0rktvc1k1a70uh5.info. 3600 IN NSEC3 1 1 0 73 0NJPEUH04UJOC0U5AUDQORDOQNLUCRLG NS DS RRSIG
nts9719ejeced08jegq9ombmafneqsd7.info. 3600 IN RRSIG NSEC3 8 2 3600 20250422162851 20250401152851 22704 info. shbDW1YFU/0Jbt9AvzmMsgTtDsMNqz6GMYGbqljaVnLUGZF5at/RqoUi Fiyx3MSDqN8NfkJ+cTaQtkBiHBMkJYieWs3PoW7QPVCg5qlEXJNysm+c bumxRpt4zhPgMXPfQBZfhBWnvQKjj4npSyrOlaBW+iB+OeQBbGM+ZXq5 RQI=
0njk896ieo5jceq4c0rktvc1k1a70uh5.info. 3600 IN RRSIG NSEC3 8 2 3600 20250422153947 20250401143947 22704 info. yfN+hiGTzN0sx6i4Tu//pakzgzwimwT9P6f6KZiKhWQTSWjDKjIYIIb2 Jr0wLIdBZzFUsTBrtPHVV5l4XLP05Lvfcy9IjgoTQA6gy5bQWG+j7XQi Vd5N9shVAo11s+nqModXXY0jKNcfgJuH8lypq4ROzc0aq4uvjw1e62m/ Jbs=
;; Received 660 bytes from 199.249.113.1#53(a2.info.afilias-nst.info) in 34 ms

jobber.peelmicro.info.  14400   IN      CNAME   k8s-myingressgroup-9cf944356d-574987922.eu-north-1.elb.amazonaws.com.
;; Received 165 bytes from 216.239.32.109#53(ns-cloud-d1.googledomains.com) in 33 ms
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
