import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from 'types/proto/auth';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());
  const port = app.get(ConfigService).getOrThrow('PORT');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto', 'auth.proto'),
    },
  });
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
