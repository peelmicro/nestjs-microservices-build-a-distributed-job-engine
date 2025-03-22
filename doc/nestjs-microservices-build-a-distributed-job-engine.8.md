# NestJS Microservices: Build a Distributed Job Engine Udemy Course (Part 8)

## 11. Setting up the Kubernetes (cont.)

### 11.3. Horizontal Scaling

#### 11.3.1. Executing the `Fibonacci` job

- Having the `minukube services` running for both `auth-http` and `jobs` services, we can execute the `scripts/fibonacci.mjs` script to see the `Fibonacci` job working.
- auth-http-url: <http://127.0.0.1:38297/graphql>
- jobs-url: <http://127.0.0.1:36565/graphql>
- iterations: 5000

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ node ./scripts/fibonacci.mjs http://127.0.0.1:38297/graphql http://127.0.0.1:36565/graphql 5000
Command line arguments: [
  '/home/juanpabloperez/.nvm/versions/node/v22.13.0/bin/node',
  '/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/scripts/fibonacci.mjs',
  'http://127.0.0.1:38297/graphql',
  'http://127.0.0.1:36565/graphql',
  '5000'
]
loginData { data: { login: { id: '1' } } }
cookies Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MjY0NjI5OSwiZXhwIjoxNzQyNjc1MDk5fQ.dnrqnph-swPc19GtUNbHuzgTnKqug-Tykc8M9YBlKJE; Path=/; Expires=Tue, 11 Jun 2080 08:49:58 GMT; HttpOnly
Executing Fibonacci with n = 5000
{ data: { executeJob: { name: 'Fibonacci' } } }
```

- We can access the `pulsar-broker` service to see the messages being produced by the `jobs` service.

```bash
kubectl get po -n pulsar
NAME                        READY   STATUS    RESTARTS        AGE
jobber-pulsar-bookie-0      1/1     Running   1 (7h27m ago)   28h
jobber-pulsar-broker-0      1/1     Running   1 (7h27m ago)   28h
jobber-pulsar-toolset-0     1/1     Running   1 (17h ago)     28h
jobber-pulsar-zookeeper-0   1/1     Running   1 (17h ago)     28h
kubectl exec --stdin --tty jobber-pulsar-broker-0 -n pulsar -- sh
Defaulted container "jobber-pulsar-broker" out of: jobber-pulsar-broker, wait-zookeeper-ready (init), wait-bookkeeper-ready (init)
/pulsar $ cd bin
/pulsar/bin $ ./pulsar-admin topics stats persistent://public/default/Fibonacci
{
  "msgRateIn" : 43.30004709457455,
  "msgThroughputIn" : 2941.219865635433,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "bytesInCounter" : 373452,
  "msgInCounter" : 5501,
  "systemTopicBytesInCounter" : 0,
  "bytesOutCounter" : 101648,
  "msgOutCounter" : 1500,
  "bytesOutInternalCounter" : 0,
  "averageMsgSize" : 67.9264819091609,
  "msgChunkPublished" : false,
  "storageSize" : 373388,
  "backlogSize" : 308599,
  "backlogQuotaLimitSize" : -1,
  "backlogQuotaLimitTime" : -1,
  "oldestBacklogMessageAgeSeconds" : -1,
  "publishRateLimitedTimes" : 0,
  "earliestMsgPublishTimeInBacklogs" : 0,
  "offloadedStorageSize" : 0,
  "lastOffloadLedgerId" : 0,
  "lastOffloadSuccessTimeStamp" : 0,
  "lastOffloadFailureTimeStamp" : 0,
  "ongoingTxnCount" : 0,
  "abortedTxnCount" : 0,
  "committedTxnCount" : 0,
  "publishers" : [ {
    "accessMode" : "Shared",
    "msgRateIn" : 43.30004709457455,
    "msgThroughputIn" : 2941.219865635433,
    "averageMsgSize" : 67.9264819091609,
    "chunkedMessageRate" : 0.0,
    "producerId" : 0,
    "supportsPartialProducer" : false,
    "producerName" : "jobber-pulsar-1-0",
    "address" : "/10.244.0.71:52934",
    "connectedSince" : "2025-03-22T11:34:48.619186238Z",
    "clientVersion" : "Pulsar-CPP-v3.7.0",
    "metadata" : { }
  } ],
  "waitingPublishers" : 0,
  "subscriptions" : {
    "jobber" : {
      "msgRateOut" : 0.0,
      "msgThroughputOut" : 0.0,
      "bytesOutCounter" : 101648,
      "msgOutCounter" : 1500,
      "msgRateRedeliver" : 0.0,
      "messageAckRate" : 3.450003479271009,
      "chunkedMessageRate" : 0.0,
      "msgBacklog" : 4533,
      "backlogSize" : 308599,
      "earliestMsgPublishTimeInBacklog" : 0,
      "msgBacklogNoDelayed" : 4533,
      "blockedSubscriptionOnUnackedMsgs" : false,
      "msgDelayed" : 0,
      "msgInReplay" : 0,
      "unackedMessages" : 532,
      "type" : "Shared",
      "msgRateExpired" : 0.0,
      "totalMsgExpired" : 0,
      "lastExpireTimestamp" : 0,
      "lastConsumedFlowTimestamp" : 1742645513743,
      "lastConsumedTimestamp" : 1742646313263,
      "lastAckedTimestamp" : 1742646448165,
      "lastMarkDeleteAdvancedTimestamp" : 1742646448165,
      "consumers" : [ {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 101648,
        "msgOutCounter" : 1500,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 3.450003479271009,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "19c7932e56",
        "availablePermits" : 0,
        "unackedMessages" : 532,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.63:43002",
        "connectedSince" : "2025-03-22T04:46:19.286092492Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742646448165,
        "lastConsumedTimestamp" : 1742646313263,
        "lastConsumedFlowTimestamp" : 1742645513743,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:27:28.165Z",
        "lastConsumedTime" : "2025-03-22T12:25:13.263Z"
      } ],
      "isDurable" : true,
      "isReplicated" : false,
      "allowOutOfOrderDelivery" : false,
      "consumersAfterMarkDeletePosition" : { },
      "drainingHashesCount" : 0,
      "drainingHashesClearedTotal" : 0,
      "drainingHashesUnackedMessages" : 0,
      "nonContiguousDeletedMessagesRanges" : 0,
      "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
      "delayedMessageIndexSizeInBytes" : 0,
      "subscriptionProperties" : { },
      "filterProcessedMsgCount" : 0,
      "filterAcceptedMsgCount" : 0,
      "filterRejectedMsgCount" : 0,
      "filterRescheduledMsgCount" : 0,
      "replicated" : false,
      "durable" : true
    }
  },
  "replication" : { },
  "deduplicationStatus" : "Disabled",
  "nonContiguousDeletedMessagesRanges" : 0,
  "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
  "delayedMessageIndexSizeInBytes" : 0,
  "compaction" : {
    "lastCompactionRemovedEventCount" : 0,
    "lastCompactionSucceedTimestamp" : 0,
    "lastCompactionFailedTimestamp" : 0,
    "lastCompactionDurationTimeInMills" : 0
  },
  "ownerBroker" : "jobber-pulsar-broker-0.jobber-pulsar-broker.pulsar.svc.cluster.local:8080"
}
```

- The important values are:
  - `msgRateIn`: "messageAckRate" : 3.450003479271009 --> 3.45 messages per second
  - "msgBacklog" : 4533, --> 4533 messages in the backlog

```bash
bin/pulsar-admin topics list public/default/
```

#### 11.3.2. Scaling the `executor` service

- We can scale the `executor` service by changing the number of replicas in the `executor-deployment.yaml` file.

```bash
kubectl scale deployment executor --replicas 5 -n jobber
deployment.apps/executor scaled
```

- We can see the new replicas by running the following command:

```bash
kubectl get po -n jobber
NAME                        READY   STATUS    RESTARTS        AGE
auth-8f7597b7-hflqz         1/1     Running   0               7h3m
executor-56d7cb958f-dh2wm   1/1     Running   0               48s
executor-56d7cb958f-lcnpg   1/1     Running   0               48s
executor-56d7cb958f-vr6qp   1/1     Running   2 (7h47m ago)   28h
executor-56d7cb958f-x4dmg   1/1     Running   0               48s
executor-56d7cb958f-x89lv   1/1     Running   0               48s
jobs-5994748d4d-7cgm2       1/1     Running   0               66m
```

- We can access the `pulsar-broker` service to see the number of consumers running.

```bash
kubectl exec --stdin --tty jobber-pulsar-broker-0 -n pulsar -- sh
Defaulted container "jobber-pulsar-broker" out of: jobber-pulsar-broker, wait-zookeeper-ready (init), wait-bookkeeper-ready (init)
/pulsar $ cd bin
/pulsar/bin $ ./pulsar-admin topics stats persistent://public/default/Fibonacci
{
  "msgRateIn" : 0.0,
  "msgThroughputIn" : 0.0,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "bytesInCounter" : 373452,
  "msgInCounter" : 5501,
  "systemTopicBytesInCounter" : 0,
  "bytesOutCounter" : 373452,
  "msgOutCounter" : 5501,
  "bytesOutInternalCounter" : 0,
  "averageMsgSize" : 0.0,
  "msgChunkPublished" : false,
  "storageSize" : 373388,
  "backlogSize" : 0,
  "backlogQuotaLimitSize" : -1,
  "backlogQuotaLimitTime" : -1,
  "oldestBacklogMessageAgeSeconds" : 0,
  "publishRateLimitedTimes" : 0,
  "earliestMsgPublishTimeInBacklogs" : 0,
  "offloadedStorageSize" : 0,
  "lastOffloadLedgerId" : 0,
  "lastOffloadSuccessTimeStamp" : 0,
  "lastOffloadFailureTimeStamp" : 0,
  "ongoingTxnCount" : 0,
  "abortedTxnCount" : 0,
  "committedTxnCount" : 0,
  "publishers" : [ {
    "accessMode" : "Shared",
    "msgRateIn" : 0.0,
    "msgThroughputIn" : 0.0,
    "averageMsgSize" : 0.0,
    "chunkedMessageRate" : 0.0,
    "producerId" : 0,
    "supportsPartialProducer" : false,
    "producerName" : "jobber-pulsar-1-0",
    "address" : "/10.244.0.71:52934",
    "connectedSince" : "2025-03-22T11:34:48.619186238Z",
    "clientVersion" : "Pulsar-CPP-v3.7.0",
    "metadata" : { }
  } ],
  "waitingPublishers" : 0,
  "subscriptions" : {
    "jobber" : {
      "msgRateOut" : 0.0,
      "msgThroughputOut" : 0.0,
      "bytesOutCounter" : 373452,
      "msgOutCounter" : 5501,
      "msgRateRedeliver" : 0.0,
      "messageAckRate" : 0.0,
      "chunkedMessageRate" : 0.0,
      "msgBacklog" : 0,
      "backlogSize" : 0,
      "earliestMsgPublishTimeInBacklog" : 0,
      "msgBacklogNoDelayed" : 0,
      "blockedSubscriptionOnUnackedMsgs" : false,
      "msgDelayed" : 0,
      "msgInReplay" : 0,
      "unackedMessages" : 0,
      "type" : "Shared",
      "msgRateExpired" : 0.0,
      "totalMsgExpired" : 0,
      "lastExpireTimestamp" : 0,
      "lastConsumedFlowTimestamp" : 1742647127065,
      "lastConsumedTimestamp" : 1742646770306,
      "lastAckedTimestamp" : 1742647127144,
      "lastMarkDeleteAdvancedTimestamp" : 1742647127144,
      "consumers" : [ {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 203570,
        "msgOutCounter" : 3000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "19c7932e56",
        "availablePermits" : 1000,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.63:43002",
        "connectedSince" : "2025-03-22T04:46:19.286092492Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647111751,
        "lastConsumedTimestamp" : 1742646762455,
        "lastConsumedFlowTimestamp" : 1742647111714,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:38:31.751Z",
        "lastConsumedTime" : "2025-03-22T12:32:42.455Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 67939,
        "msgOutCounter" : 1000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "4be990952f",
        "availablePermits" : 1000,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.74:54586",
        "connectedSince" : "2025-03-22T12:32:49.448891439Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647118934,
        "lastConsumedTimestamp" : 1742646769694,
        "lastConsumedFlowTimestamp" : 1742647118913,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:38:38.934Z",
        "lastConsumedTime" : "2025-03-22T12:32:49.694Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 67918,
        "msgOutCounter" : 1000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "959a929d82",
        "availablePermits" : 1000,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.72:43408",
        "connectedSince" : "2025-03-22T12:32:49.453293929Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647127144,
        "lastConsumedTimestamp" : 1742646769704,
        "lastConsumedFlowTimestamp" : 1742647127065,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:38:47.144Z",
        "lastConsumedTime" : "2025-03-22T12:32:49.704Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 34025,
        "msgOutCounter" : 501,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "a8789ddde1",
        "availablePermits" : 999,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.73:52672",
        "connectedSince" : "2025-03-22T12:32:50.254567939Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742646963505,
        "lastConsumedTimestamp" : 1742646770306,
        "lastConsumedFlowTimestamp" : 1742646963443,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:36:03.505Z",
        "lastConsumedTime" : "2025-03-22T12:32:50.306Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 0,
        "msgOutCounter" : 0,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 0.0,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "c2d0bb129e",
        "availablePermits" : 1000,
        "unackedMessages" : 0,
        "avgMessagesPerEntry" : 0,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.75:51836",
        "connectedSince" : "2025-03-22T12:32:50.887614294Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 0,
        "lastConsumedTimestamp" : 0,
        "lastConsumedFlowTimestamp" : 1742646770888,
        "metadata" : { },
        "lastAckedTime" : "1970-01-01T00:00:00Z",
        "lastConsumedTime" : "1970-01-01T00:00:00Z"
      } ],
      "isDurable" : true,
      "isReplicated" : false,
      "allowOutOfOrderDelivery" : false,
      "consumersAfterMarkDeletePosition" : { },
      "drainingHashesCount" : 0,
      "drainingHashesClearedTotal" : 0,
      "drainingHashesUnackedMessages" : 0,
      "nonContiguousDeletedMessagesRanges" : 0,
      "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
      "delayedMessageIndexSizeInBytes" : 0,
      "subscriptionProperties" : { },
      "filterProcessedMsgCount" : 0,
      "filterAcceptedMsgCount" : 0,
      "filterRejectedMsgCount" : 0,
      "filterRescheduledMsgCount" : 0,
      "durable" : true,
      "replicated" : false
    }
  },
  "replication" : { },
  "deduplicationStatus" : "Disabled",
  "nonContiguousDeletedMessagesRanges" : 0,
  "nonContiguousDeletedMessagesRangesSerializedSize" : 0,
  "delayedMessageIndexSizeInBytes" : 0,
  "compaction" : {
    "lastCompactionRemovedEventCount" : 0,
    "lastCompactionSucceedTimestamp" : 0,
    "lastCompactionFailedTimestamp" : 0,
    "lastCompactionDurationTimeInMills" : 0
  },
  "ownerBroker" : "jobber-pulsar-broker-0.jobber-pulsar-broker.pulsar.svc.cluster.local:8080"
}
/pulsar/bin $
```

- We can see the number of consumers by running the following command by checking the `"consumers" : [` that has 5 elements
- We can run the `Fibonacci` job again with 5000 iterations and see the messages being consumed by the `executor` service.

```bash
node ./scripts/fibonacci.mjs http://127.0.0.1:38297/graphql http://127.0.0.1:36565/graphql 5000
Command line arguments: [
  '/home/juanpabloperez/.nvm/versions/node/v22.13.0/bin/node',
  '/home/juanpabloperez/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/scripts/fibonacci.mjs',
  'http://127.0.0.1:38297/graphql',
  'http://127.0.0.1:36565/graphql',
  '5000'
]
loginData { data: { login: { id: '1' } } }
cookies Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MjY0NzUwNywiZXhwIjoxNzQyNjc2MzA3fQ.Zg2W15gnbG-TUfXl5uTBX91ss5mtFGmP7sFjP8EhO40; Path=/; Expires=Tue, 11 Jun 2080 09:30:14 GMT; HttpOnly
Executing Fibonacci with n = 5000
{ data: { executeJob: { name: 'Fibonacci' } } }
```

- We can access the `pulsar-broker` service to see the stadistics of the `Fibonacci` topic.

```bash
kubectl exec --stdin --tty jobber-pulsar-broker-0 -n pulsar -- sh
Defaulted container "jobber-pulsar-broker" out of: jobber-pulsar-broker, wait-zookeeper-ready (init), wait-bookkeeper-ready (init)
/pulsar $ cd bin
/pulsar/bin $ ./pulsar-admin topics stats persistent://public/default/Fibonacci
{
  "msgRateIn" : 0.0,
  "msgThroughputIn" : 0.0,
  "msgRateOut" : 0.0,
  "msgThroughputOut" : 0.0,
  "bytesInCounter" : 713103,
  "msgInCounter" : 10501,
  "systemTopicBytesInCounter" : 0,
  "bytesOutCounter" : 713103,
  "msgOutCounter" : 10501,
  "bytesOutInternalCounter" : 0,
  "averageMsgSize" : 0.0,
  "msgChunkPublished" : false,
  "storageSize" : 713039,
  "backlogSize" : 184610,
  "backlogQuotaLimitSize" : -1,
  "backlogQuotaLimitTime" : -1,
  "oldestBacklogMessageAgeSeconds" : -1,
  "publishRateLimitedTimes" : 0,
  "earliestMsgPublishTimeInBacklogs" : 0,
  "offloadedStorageSize" : 0,
  "lastOffloadLedgerId" : 0,
  "lastOffloadSuccessTimeStamp" : 0,
  "lastOffloadFailureTimeStamp" : 0,
  "ongoingTxnCount" : 0,
  "abortedTxnCount" : 0,
  "committedTxnCount" : 0,
  "publishers" : [ {
    "accessMode" : "Shared",
    "msgRateIn" : 0.0,
    "msgThroughputIn" : 0.0,
    "averageMsgSize" : 0.0,
    "chunkedMessageRate" : 0.0,
    "producerId" : 0,
    "supportsPartialProducer" : false,
    "producerName" : "jobber-pulsar-1-0",
    "address" : "/10.244.0.71:52934",
    "connectedSince" : "2025-03-22T11:34:48.619186238Z",
    "clientVersion" : "Pulsar-CPP-v3.7.0",
    "metadata" : { }
  } ],
  "waitingPublishers" : 0,
  "subscriptions" : {
    "jobber" : {
      "msgRateOut" : 0.0,
      "msgThroughputOut" : 0.0,
      "bytesOutCounter" : 713103,
      "msgOutCounter" : 10501,
      "msgRateRedeliver" : 0.0,
      "messageAckRate" : 13.666670469020513,
      "chunkedMessageRate" : 0.0,
      "msgBacklog" : 2550,
      "backlogSize" : 184610,
      "earliestMsgPublishTimeInBacklog" : 0,
      "msgBacklogNoDelayed" : 2550,
      "blockedSubscriptionOnUnackedMsgs" : false,
      "msgDelayed" : 0,
      "msgInReplay" : 0,
      "unackedMessages" : 2550,
      "type" : "Shared",
      "msgRateExpired" : 0.0,
      "totalMsgExpired" : 0,
      "lastExpireTimestamp" : 0,
      "lastConsumedFlowTimestamp" : 1742647692737,
      "lastConsumedTimestamp" : 1742647691226,
      "lastAckedTimestamp" : 1742647692764,
      "lastMarkDeleteAdvancedTimestamp" : 1742647692246,
      "consumers" : [ {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 271503,
        "msgOutCounter" : 4000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 2.70000086962528,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "19c7932e56",
        "availablePermits" : 0,
        "unackedMessages" : 510,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.63:43002",
        "connectedSince" : "2025-03-22T04:46:19.286092492Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647692663,
        "lastConsumedTimestamp" : 1742647573464,
        "lastConsumedFlowTimestamp" : 1742647111714,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:48:12.663Z",
        "lastConsumedTime" : "2025-03-22T12:46:13.464Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 135885,
        "msgOutCounter" : 2000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 2.6166672962368183,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "4be990952f",
        "availablePermits" : 0,
        "unackedMessages" : 523,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.74:54586",
        "connectedSince" : "2025-03-22T12:32:49.448891439Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647692246,
        "lastConsumedTimestamp" : 1742647573477,
        "lastConsumedFlowTimestamp" : 1742647118913,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:48:12.246Z",
        "lastConsumedTime" : "2025-03-22T12:46:13.477Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 135850,
        "msgOutCounter" : 2000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 2.8833341243760504,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "959a929d82",
        "availablePermits" : 500,
        "unackedMessages" : 500,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.72:43408",
        "connectedSince" : "2025-03-22T12:32:49.453293929Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647692764,
        "lastConsumedTimestamp" : 1742647573491,
        "lastConsumedFlowTimestamp" : 1742647692737,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:48:12.764Z",
        "lastConsumedTime" : "2025-03-22T12:46:13.491Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 101941,
        "msgOutCounter" : 1501,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 2.7833340904929837,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "a8789ddde1",
        "availablePermits" : 499,
        "unackedMessages" : 500,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.73:52672",
        "connectedSince" : "2025-03-22T12:32:50.254567939Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647692386,
        "lastConsumedTimestamp" : 1742647691226,
        "lastConsumedFlowTimestamp" : 1742647691224,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:48:12.386Z",
        "lastConsumedTime" : "2025-03-22T12:48:11.226Z"
      }, {
        "msgRateOut" : 0.0,
        "msgThroughputOut" : 0.0,
        "bytesOutCounter" : 67924,
        "msgOutCounter" : 1000,
        "msgRateRedeliver" : 0.0,
        "messageAckRate" : 2.6833340882893792,
        "chunkedMessageRate" : 0.0,
        "consumerName" : "c2d0bb129e",
        "availablePermits" : 0,
        "unackedMessages" : 517,
        "avgMessagesPerEntry" : 1,
        "blockedConsumerOnUnackedMsgs" : false,
        "drainingHashesCount" : 0,
        "drainingHashesClearedTotal" : 0,
        "drainingHashesUnackedMessages" : 0,
        "address" : "/10.244.0.75:51836",
        "connectedSince" : "2025-03-22T12:32:50.887614294Z",
        "clientVersion" : "Pulsar-CPP-v3.7.0",
        "lastAckedTimestamp" : 1742647692396,
        "lastConsumedTimestamp" : 1742647573451,
        "lastConsumedFlowTimestamp" : 1742646770888,
        "metadata" : { },
        "lastAckedTime" : "2025-03-22T12:48:12.396Z",
        "lastConsumedTime" : "2025-03-22T12:46:13.451Z"
      } ],
      "isDurable" : true,
      "isReplicated" : false,
      "allowOutOfOrderDelivery" : false,
      "consumersAfterMarkDeletePosition" : { },
      "drainingHashesCount" : 0,
      "drainingHashesClearedTotal" : 0,
      "drainingHashesUnackedMessages" : 0,
      "nonContiguousDeletedMessagesRanges" : 30,
      "nonContiguousDeletedMessagesRangesSerializedSize" : 269,
      "delayedMessageIndexSizeInBytes" : 0,
      "subscriptionProperties" : { },
      "filterProcessedMsgCount" : 0,
      "filterAcceptedMsgCount" : 0,
      "filterRejectedMsgCount" : 0,
      "filterRescheduledMsgCount" : 0,
      "replicated" : false,
      "durable" : true
    }
  },
  "replication" : { },
  "deduplicationStatus" : "Disabled",
  "nonContiguousDeletedMessagesRanges" : 30,
  "nonContiguousDeletedMessagesRangesSerializedSize" : 269,
  "delayedMessageIndexSizeInBytes" : 0,
  "compaction" : {
    "lastCompactionRemovedEventCount" : 0,
    "lastCompactionSucceedTimestamp" : 0,
    "lastCompactionFailedTimestamp" : 0,
    "lastCompactionDurationTimeInMills" : 0
  },
  "ownerBroker" : "jobber-pulsar-broker-0.jobber-pulsar-broker.pulsar.svc.cluster.local:8080"
}
```

- We can see the values again:
- "messageAckRate" : 13.666670469020513, --> 13.6 messages per second
- `msgRateIn`:
  - 1 - "messageAckRate" : "messageAckRate" : 2.70000086962528 --> 2.7 messages per second
  - 2 - "messageAckRate" : "messageAckRate" : 2.6166672962368183, --> 2.6 messages per second
  - 3 - "messageAckRate" : "messageAckRate" : 2.8833341243760504, --> 2.8 messages per second
  - 4 - "messageAckRate" : "messageAckRate" : 2.7833340904929837, --> 2.7 messages per second
  - 5 - "messageAckRate" : "messageAckRate" : 2.6833340882893792, --> 2.6 messages per second
- "msgBacklog" : 2550, --> 2550 messages in the backlog
- So, it has been increased from 3.45 to 13.6 messages per second.
