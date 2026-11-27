import { Global, Injectable, Module, type OnModuleDestroy } from '@nestjs/common';
import { createPrismaClient, type Db } from '@temper/db';
import { env } from '../config/env.js';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly db: Db = createPrismaClient({ url: env().DATABASE_URL });

  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
