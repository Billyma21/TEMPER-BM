import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { WorldService } from './world.service.js';

@ApiTags('monde')
@Controller('world')
export class WorldController {
  constructor(private readonly world: WorldService) {}

  @Requires('read', 'World')
  @Get('snapshot')
  snapshot(@CurrentPrincipal() p: Principal, @Query('siteId') siteId?: string) {
    return this.world.snapshot(p, siteId);
  }
}
