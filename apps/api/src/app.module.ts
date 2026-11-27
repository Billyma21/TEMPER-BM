/**
 * Module racine. Les domaines métier exposent le gabarit CRUD ; le pointage et le monde restent dédiés.
 * MAAYOUD
 */
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AccessDeskController } from './access/access.controller.js';
import { AccessDeskService } from './access/access.service.js';
import { AuditInterceptor } from './audit/audit.interceptor.js';
import { AuditService } from './audit/audit.service.js';
import { ApprovalsController } from './approvals/approvals.controller.js';
import { ApprovalsService } from './approvals/approvals.service.js';
import { AccessGuard } from './auth/access.guard.js';
import { AccountController } from './auth/account.controller.js';
import { AccountService } from './auth/account.service.js';
import { AuthController, DevicesController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { RequestIdMiddleware } from './common/request-id.middleware.js';
import { CrudService } from './crud/crud.service.js';
import { HealthController } from './health/health.controller.js';
import { domainControllers } from './modules/all-controllers.js';
import { AccessService } from './permissions/access.service.js';
import { OrganisationController, PeopleController } from './people/people.controller.js';
import { PeopleService } from './people/people.service.js';
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
  controllers: [HealthController, AuthController, AccountController, ApprovalsController, DevicesController, TimeController, WorldController, AccessDeskController, PeopleController, OrganisationController, ...domainControllers],
  providers: [
    RedisService,
    AccessService,
    AuthService,
    AccountService,
    ApprovalsService,
    AuditService,
    RealtimeGateway,
    TimeService,
    WorldService,
    CrudService,
    AccessDeskService,
    PeopleService,
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
