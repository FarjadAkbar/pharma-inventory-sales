import { RedisClientType } from 'redis';
import { DataSource } from 'typeorm';

import { ICacheAdapter } from '@/infra/cache';

import { DatabaseConnectionOutput, DatabaseMemoryOutput, HealthStatus, Load, MemotyOutput } from './types';

export abstract class IHealthAdapter {
  abstract postgres: DataSource;
  abstract redis: ICacheAdapter<RedisClientType>;
  abstract getRedisStatus(): Promise<HealthStatus>;
  abstract getPostgresStatus(): Promise<HealthStatus>;
  abstract getMemoryUsageInMB(): MemotyOutput;
  abstract getLoadAvarage(time: number, numCpus: number): Load;
  abstract getActiveConnections(): Promise<unknown>;
  abstract getLatency(host?: string): Promise<unknown>;
  abstract getPostgresConnections(): Promise<DatabaseConnectionOutput>;
  abstract getPostgresMemory(): Promise<DatabaseMemoryOutput>;
  abstract getCPUCore(): Promise<{ cpus: { load: number }[] }>;
}
