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
