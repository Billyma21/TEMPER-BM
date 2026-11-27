/**
 * Module racine. Les domaines métier exposent le gabarit CRUD ; le pointage et le monde restent dédiés.
 * MAAYOUD
 */
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditInterceptor } from './audit/audit.interceptor.js';
import { AuditService } from './audit/audit.service.js';
import { AccessGuard } from './auth/access.guard.js';
import { AuthController, DevicesController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { RequestIdMiddleware } from './common/request-id.middleware.js';
import { CrudService } from './crud/crud.service.js';
import { HealthController } from './health/health.controller.js';
import { domainControllers } from './modules/all-controllers.js';
import { AccessService } from './permissions/access.service.js';
import { PrismaModule } from './prisma/prisma.service.js';
import { RealtimeGateway } from './realtime/realtime.gateway.js';
import { RedisService } from './redis/redis.service.js';
import { TimeController } from './time/time.controller.js';
import { TimeService } from './time/time.service.js';
import { WorldController } from './world/world.controller.js';
import { WorldService } from './world/world.service.js';

const requestBudget = process.env.NODE_ENV === 'test' ? 20_000 : 300;

@Module({
  imports: [PrismaModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: requestBudget }])],
  controllers: [HealthController, AuthController, DevicesController, TimeController, WorldController, ...domainControllers],
  providers: [
    RedisService,
    AccessService,
    AuthService,
    AuditService,
    RealtimeGateway,
    TimeService,
    WorldService,
    CrudService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AccessGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
