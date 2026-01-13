import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 60 * 1000,
  ) {
    const cachedData = await this.cache.get<T>(key);
    if (cachedData) return cachedData;

    const newData = await fetcher();

    if (newData) await this.cache.set(key, newData, ttl);

    return newData;
  }

  async del(key: string) {
    return this.cache.del(key);
  }
}
