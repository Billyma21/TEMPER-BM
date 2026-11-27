import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../permissions/decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@ApiTags('sante')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    const cache = (await this.redis.ping()) ? 'ok' : 'down';
    try {
      await this.prisma.db.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'ok', cache, at: new Date().toISOString() };
    } catch {
      throw new ServiceUnavailableException({ code: 'INTERNAL', status: 'degraded', db: 'down', cache });
    }
  }
}
