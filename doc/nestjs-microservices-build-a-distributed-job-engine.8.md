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

## 12 Adding the `Products` service

### 12.1. Adding the `products.json` file

- We will add the `products.json` file to new `data` folder in the `root` folder.

- We will add the `Products` service to the `jobber` namespace.

> data/products.json

```json
[
  {
    "name": "Yoga Mat",
    "category": "Sports & Outdoors",
    "price": 110.53,
    "stock": 220,
    "rating": 4.0,
    "description": "Non-slip yoga mat with extra cushioning for comfort during workouts."
  },
  {
    "name": "Stainless Steel Water Bottle",
    "category": "Home & Kitchen",
    "price": 125.0,
    "stock": 234,
    "rating": 3.4,
    "description": "Keeps beverages hot or cold for hours, perfect for outdoor activities."
  },
  .
  .
  .
  {
    "name": "Smart Watch",
    "category": "Electronics",
    "price": 150.88,
    "stock": 258,
    "rating": 3.5,
    "description": "Track your fitness, receive notifications, and more with this sleek smartwatch."
  },
  {
    "name": "Stainless Steel Water Bottle",
    "category": "Home & Kitchen",
    "price": 247.84,
    "stock": 147,
    "rating": 4.7,
    "description": "Keeps beverages hot or cold for hours, perfect for outdoor activities."
  }
]
```

### 12.2. Adding the `Upload` module inside the `jobs` service

#### 12.2.1. Adding the `@types/multer` npm package to the `jobs` service

- We will add the `@types/multer` npm package to the `jobs` service.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine/apps/jobs$ npm i --save-dev @types/multer --legacy-peer-deps

added 1 package, and audited 1391 packages in 3s

228 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 12.2.2. Creating `UPLOAD_FILE_PATH` constant

- We will create a new constant called `UPLOAD_FILE_PATH` in the `uploads.controller.ts` file.

> apps/jobs/src/app/uploads/upload.ts

```ts
import path = require('path');

export const UPLOAD_FILE_PATH = path.join(process.cwd(), 'apps/jobs/uploads');
```

#### 12.2.3. Creating the `UploadsController` controller

- We will create a new controller called `UploadsController` in the `uploads.controller.ts` file.

> apps/jobs/src/app/uploads/uploads.controller.ts

```ts
import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UPLOAD_FILE_PATH } from './upload';

@Controller('uploads')
export class UploadsController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_FILE_PATH,
        filename: (_req: any, file: { fieldname: any }, callback: (arg0: null, arg1: string) => void) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${file.fieldname}-${uniqueSuffix}.json`;
          callback(null, filename);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/json') {
          return callback(new BadRequestException('Only JSON files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
    };
  }
}
```

#### 12.2.4. Creating the `UploadsModule` module

- We will create a new module called `UploadsModule` in the `uploads.module.ts` file.

> apps/jobs/src/app/uploads/uploads.module.ts

```ts
import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';

import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
})
export class UploadsModule {}
```

#### 12.2.5. Adding the `UploadsModule` to the `AppModule`

- We will add the `UploadsModule` to the `AppModule` in the `app.module.ts` file.

> apps/jobs/src/app/app.module.ts

```diff
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { LoggerModule } from '@jobber/nestjs';
import { GqlLoggingPlugin } from '@jobber/graphql';
+import { UploadsModule } from './uploads/uploads.module';
@Module({
  imports: [
    LoggerModule,
+   UploadsModule,
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

#### 12.2.6. We need to ensure we can serve the `jobs` service

- We need to ensure we can serve the `jobs` service.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve jobs

 NX   Running target serve for project jobs and 6 tasks it depends on:

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto

> npx protoc --plugin=protoc-gen-ts_proto=../../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/lib/types/proto ./src/lib/proto/*.proto --ts_proto_opt=nestJs=true --ts_proto_opt=exportCommonSymbols=false


> nx run nestjs:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 2.58 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 2.58 KiB [entry] [rendered]
webpack compiled successfully (09c76bbd450379d5)

> nx run pulsar:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 5.63 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 5.63 KiB [entry] [rendered]
webpack compiled successfully (c7530fb194af6872)

> nx run grpc:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 3.26 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 3.26 KiB [entry] [rendered]
webpack compiled successfully (554c08c23f9c5797)

> nx run graphql:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 4.8 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 4.8 KiB [entry] [rendered]
webpack compiled successfully (0bb1536f0fbd912e)

> nx run jobs:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 17.8 KiB [entry] [rendered]
webpack compiled successfully (9689e11a65093401)

> nx run jobs:serve:development


 NX   Running target build for project jobs and 5 tasks it depends on:

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run grpc:generate-ts-proto  [existing outputs match the cache, left as is]


> nx run nestjs:build  [existing outputs match the cache, left as is]


> nx run pulsar:build  [existing outputs match the cache, left as is]


> nx run grpc:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 3.26 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 3.26 KiB [entry] [rendered]
webpack compiled successfully (554c08c23f9c5797)

> nx run graphql:build

> webpack-cli build --node-env=production

chunk (runtime: index) index.js (index) 4.8 KiB [entry] [rendered]
chunk (runtime: main) main.js (main) 4.8 KiB [entry] [rendered]
webpack compiled successfully (0bb1536f0fbd912e)

> nx run jobs:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 17.8 KiB [entry] [rendered]
webpack compiled successfully (9689e11a65093401)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project jobs and 5 tasks it depends on

Nx read the output from the cache instead of running the command for 3 out of 6 tasks.

Debugger listening on ws://localhost:9229/e9bf3f93-27e0-42cb-917b-5235d4a0e822
For help, see: https://nodejs.org/en/docs/inspector

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
[15:54:47.779] INFO (654083): Starting Nest application... {"context":"NestFactory"}
[15:54:47.779] INFO (654083): AppModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.779] INFO (654083): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.779] INFO (654083): ConfigHostModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.779] INFO (654083): DiscoveryModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.779] INFO (654083): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.779] INFO (654083): ConfigModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): UploadsModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): PulsarModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): ClientsModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): GraphQLSchemaBuilderModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): JobsModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): LoggerModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] INFO (654083): GraphQLModule dependencies initialized {"context":"InstanceLoader"}
[15:54:47.780] WARN (654083): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:54:47.780] WARN (654083): Unsupported route path: "/api/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert... {"context":"LegacyRouteConverter"}
[15:54:47.780] INFO (654083): UploadsController {/api/uploads}: {"context":"RoutesResolver"}
[15:54:47.780] INFO (654083): Mapped {/api/uploads/upload, POST} route {"context":"RouterExplorer"}
[15:54:47.780] INFO (654083): Mapped {/graphql, POST} route {"context":"GraphQLModule"}
[15:54:47.780] INFO (654083): Nest application successfully started {"context":"NestApplication"}
[15:54:47.780] INFO (654083): 🚀 Application is running on: http://localhost:3001/api
```

- We can see the `jobs` service is running on port `3001`.

````bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ curl http://localhost:3001/api/uploads/upload

#### 12.2.7. Updating  the `jobs.http` document to include the "### Upload file" request

- We will update the `jobs.http` document to include the "### Upload file" request.

> doc/jobs.http

```http
.
@urlRest = http://localhost:3001/api
.
### Upload file
POST {{urlRest}}/uploads/upload
Content-Type: multipart/form-data ; boundary=MfnBoundry

--MfnBoundry
Content-Disposition: form-data; name="file"; filename="products.json"
Content-Type: application/json

< ./data/products.json

--MfnBoundry--
````

- We are going to test the `### Upload file` request.

> response

```json
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 87
ETag: W/"57-H+aQ0VZIqBYGYpzvan0rSnVYrVw"
Date: Sat, 22 Mar 2025 16:06:14 GMT
Connection: close

{
  "message": "File uploaded successfully",
  "filename": "file-1742659574274-319632607.json"
}
```

#### 12.2.8. Ensuring the file is uploaded

- We need to ensure the file is uploaded to the `uploads` folder.

> apps/jobs/uploads/file-1742659574274-319632607.json

```json
[
  {
    "name": "Yoga Mat",
    "category": "Sports & Outdoors",
    "price": 110.53,
    "stock": 220,
    "rating": 4.0,
    "description": "Non-slip yoga mat with extra cushioning for comfort during workouts."
  },
  {
    "name": "Stainless Steel Water Bottle",
    "category": "Home & Kitchen",
    "price": 125.0,
    "stock": 234,
    "rating": 3.4,
    "description": "Keeps beverages hot or cold for hours, perfect for outdoor activities."
  },
  {
    "name": "Smart Watch",
    "category": "Electronics",
    "price": 150.88,
    "stock": 258,
    "rating": 3.5,
    "description": "Track your fitness, receive notifications, and more with this sleek smartwatch."
  },
  {
    "name": "Stainless Steel Water Bottle",
    "category": "Home & Kitchen",
    "price": 247.84,
    "stock": 147,
    "rating": 4.7,
    "description": "Keeps beverages hot or cold for hours, perfect for outdoor activities."
  }
]
```

### 12.3. Adding the new `Products` service

#### 12.3.1. Adding the `Products` service to the `jobber` namespace

- We will add the `Products` service to the `jobber` namespace by using `nx CLI`.

```bash
nx generate app products
✔ Which generator would you like to use? · @nx/nest:application

 NX  Generating @nx/nest:application

✔ Which linter would you like to use? · eslint
✔ Which unit test runner would you like to use? · none
CREATE apps/products/src/assets/.gitkeep
CREATE apps/products/src/main.ts
CREATE apps/products/tsconfig.app.json
CREATE apps/products/tsconfig.json
CREATE apps/products/webpack.config.js
CREATE apps/products/project.json
CREATE apps/products/eslint.config.mjs
CREATE apps/products-e2e/project.json
UPDATE nx.json
CREATE apps/products-e2e/jest.config.ts
CREATE apps/products-e2e/src/products/products.spec.ts
CREATE apps/products-e2e/src/support/global-setup.ts
CREATE apps/products-e2e/src/support/global-teardown.ts
CREATE apps/products-e2e/src/support/test-setup.ts
CREATE apps/products-e2e/tsconfig.json
CREATE apps/products-e2e/tsconfig.spec.json
CREATE apps/products-e2e/eslint.config.mjs
CREATE apps/products/src/app/app.controller.spec.ts
CREATE apps/products/src/app/app.controller.ts
CREATE apps/products/src/app/app.module.ts
CREATE apps/products/src/app/app.service.spec.ts
CREATE apps/products/src/app/app.service.ts

 NX   👀 View Details of products-e2e

Run "nx show project products-e2e" to view details about this project.


 NX   👀 View Details of products

Run "nx show project products" to view details about this project.
```

- We are going to remove the `products-e2e` and the `*.spec.ts` files.

```bash
rm -rf apps/products-e2e
rm -rf apps/products/*.spec.ts
```

- We are going to ensure the `products` service is running.

```bash
juanpabloperez@jpp-PROX15-AMD:~/Training/microservices/nestjs-microservices-build-a-distributed-job-engine$ nx serve products

 NX   Running target serve for project products and 1 task it depends on:

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run products:build

> webpack-cli build node-env=production

chunk (runtime: main) main.js (main) 2.71 KiB [entry] [rendered]
webpack compiled successfully (a2a21e41fc30e038)

> nx run products:serve:development


> nx run products:build:development

> webpack-cli build node-env=development

chunk (runtime: main) main.js (main) 2.71 KiB [entry] [rendered]
webpack compiled successfully (a2a21e41fc30e038)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project products


Starting inspector on localhost:9229 failed: address already in use

[Nest] 724321  - 22/03/2025, 16:25:36     LOG [NestFactory] Starting Nest application...
[Nest] 724321  - 22/03/2025, 16:25:36     LOG [InstanceLoader] AppModule dependencies initialized +9ms
[Nest] 724321  - 22/03/2025, 16:25:36     LOG [RoutesResolver] AppController {/api}: +5ms
[Nest] 724321  - 22/03/2025, 16:25:36     LOG [RouterExplorer] Mapped {/api, GET} route +3ms
[Nest] 724321  - 22/03/2025, 16:25:36     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 724321  - 22/03/2025, 16:25:36     LOG 🚀 Application is running on: http://localhost:3000/api
```
