import { Module } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { DataSource } from 'typeorm';

import { ICacheAdapter } from '@/infra/cache';
import { RedisCacheModule } from '@/infra/cache/redis';
import { PostgresDatabaseModule } from '@/infra/database/postgres';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';

import { IHealthAdapter } from './health.adapter';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [LoggerModule, PostgresDatabaseModule, RedisCacheModule],
  controllers: [HealthController],
  providers: [
    {
      provide: IHealthAdapter,
      useFactory: async (
        dataSource: DataSource,
        cache: ICacheAdapter<RedisClientType>,
        logger: ILoggerAdapter
      ) => {
        const service = new HealthService(logger);
        service.postgres = dataSource;
        service.redis = cache;
        return service;
      },
      inject: [
        getDataSourceToken(),
        ICacheAdapter<RedisClientType>,
        ILoggerAdapter
      ]
    }
  ],
  exports: [IHealthAdapter]
})
export class HealthModule {}
