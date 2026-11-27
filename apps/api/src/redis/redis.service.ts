/**
 * Redis optionnel : une panne de cache ne doit pas empêcher l API de répondre.
 * Délais courts, pas de file d attente hors ligne.
 * MAAYOUD
 */
import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(env().REDIS_URL, {
      connectTimeout: 400,
      commandTimeout: 400,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => (times > 1 ? null : 100),
    });
    this.client.on('error', () => undefined);
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch {
      /* le calcul direct des droits reste valable */
    }
  }

  async incr(key: string): Promise<void> {
    try {
      await this.client.incr(key);
    } catch {
      /* invalidation perdue : le TTL borne la fenêtre */
    }
  }

  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}
