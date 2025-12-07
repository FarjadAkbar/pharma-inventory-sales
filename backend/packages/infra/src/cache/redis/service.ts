import { Injectable } from '@nestjs/common';
import { RedisClientType, SetOptions } from 'redis';

import { ErrorType, ILoggerAdapter } from '../../logger';
import { ApiInternalServerException } from '@pharma/utils/exception';

import { ICacheAdapter } from '../adapter';
import { CacheKeyArgument, CacheKeyValue } from '../types';
import { RedisCacheKeyArgument, RedisCacheValueArgument } from './types';

@Injectable()
export class RedisService implements Partial<ICacheAdapter<RedisClientType>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client!: any;

  constructor(
    private readonly logger: ILoggerAdapter,
    client: RedisClientType
  ) {
    this.client = client;
  }

  async ping(): Promise<string> {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 100));
      const ping = this.client.ping();
      const result = await Promise.race([ping, timeout]);

      return result as string;
    } catch (error) {
      if (typeof error === 'string') {
        error = new ApiInternalServerException(error);
      }
      (error as { context: string }).context = `${RedisService.name}/ping`;
      this.logger.error(error as ErrorType);
      return 'DOWN';
    }
  }

  async connect(): Promise<RedisClientType> {
    try {
      await this.client.connect();
      this.logger.log('🎯 redis connected!\n');
      return this.client;
    } catch (error) {
      throw new ApiInternalServerException((error as { message: string }).message, {
        context: `${RedisService.name}/connect`
      });
    }
  }

  async set<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TValue extends RedisCacheValueArgument = RedisCacheValueArgument,
    TConf extends object = object
  >(key: TKey, value: TValue, config?: TConf): Promise<void> {
    await this.client.set(key as unknown as string, value as unknown as string, config as unknown as SetOptions);
  }

  async get<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<string | null> {
    const getResult = await this.client.get(key as unknown as string);

    return (getResult ?? null) as string | null;
  }

  async del<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<void> {
    await this.client.del(key as unknown as string);
  }

  async setMulti(redisList: CacheKeyValue[]): Promise<void> {
    const multi = this.client.multi();

    for (const model of redisList) {
      multi.rPush(model.key as unknown as string, model.value as unknown as string);
    }

    await multi.exec();
  }

  async pExpire<PCache extends RedisCacheKeyArgument = RedisCacheKeyArgument>(
    key: PCache,
    milliseconds: number
  ): Promise<void> {
    await this.client.pExpire(key as unknown as string, milliseconds);
  }

  async hGet<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TArs extends RedisCacheKeyArgument = RedisCacheKeyArgument
  >(key: TKey, field: TArs): Promise<unknown | unknown[]> {
    return await this.client.hGet(key as unknown as string, field as unknown as string);
  }

  async hSet<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TField extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TValue extends RedisCacheValueArgument = RedisCacheValueArgument
  >(key: TKey, field: TField, value: TValue): Promise<number> {
    return await this.client.hSet(
      key as unknown as string,
      field as unknown as string,
      value as unknown as string
    );
  }

  async hGetAll<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(
    key: TKey
  ): Promise<unknown | unknown[]> {
    return await this.client.hGetAll(key as unknown as string);
  }
}
