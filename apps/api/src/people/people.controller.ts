/**
 * Personnes : organigramme, rôles, arrivée et départ.
 * MAAYOUD
 */
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGrantSchema, type RoleGrantInput } from '@temper/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { PeopleService } from './people.service.js';

@ApiTags('people')
@Controller('people')
export class PeopleController {
  constructor(private readonly people: PeopleService) {}

  @Post('roles')
  @Requires('create', 'RoleAssignment')
  grant(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(RoleGrantSchema)) body: RoleGrantInput) {
    return this.people.grant(p, body);
  }

  @Get('roles/review')
  @Requires('read', 'RoleAssignment')
  review(@CurrentPrincipal() p: Principal) {
    return this.people.review(p);
  }

  @Post('employees/:id/onboarding')
  @Requires('create', 'Onboarding')
  @HttpCode(201)
  onboarding(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.people.startOnboarding(p, id);
  }

  @Post('offboarding/run')
  @Requires('update', 'Employee')
  @HttpCode(200)
  offboarding(@CurrentPrincipal() p: Principal) {
    return this.people.runOffboarding(p, new Date());
  }
}

@ApiTags('organisation')
@Controller('organisation')
export class OrganisationController {
  constructor(private readonly people: PeopleService) {}

  @Get('chart')
  @Requires('read', 'Employee')
  chart(@CurrentPrincipal() p: Principal) {
    return this.people.chart(p);
  }
}
