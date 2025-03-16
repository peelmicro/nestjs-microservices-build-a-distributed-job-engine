FROM node:22-slim AS builder

WORKDIR /workspace

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/executor ./apps/executor
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar

RUN npm install --legacy-peer-deps

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build executor

FROM node:22-slim AS runner

WORKDIR /app

COPY --from=builder /workspace/package*.json ./

COPY --from=builder /workspace/apps/executor/package.json ./apps/executor/
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/

COPY --from=builder /workspace/node_modules ./node_modules

COPY --from=builder /workspace/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/apps/executor/main"]
