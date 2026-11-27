/**
 * Fabrique de contrôleurs : une ressource, six routes, les droits déclarés sur chacune.
 * MAAYOUD
 */
import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, StreamableFile, type Type } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SUBJECTS, type ModuleKey, type SubjectName } from '@temper/permissions';
import type { Request, Response } from 'express';
import { CurrentPrincipal, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { CrudService } from './crud.service.js';
import { normalizeQuery } from './query.js';
import { pluralKebab, resourcePath } from './routes.js';
import { RESOURCE_META } from './resource-meta.js';

function createResourceController(subject: SubjectName): Type {
  const path = resourcePath(subject);
  const label = SUBJECTS[subject].label;
  const fileName = pluralKebab(subject);

  @ApiTags(SUBJECTS[subject].module)
  @ApiCookieAuth('temper_session')
  @Controller(path)
  class ResourceController {
    constructor(private readonly crud: CrudService) {}

    @Get()
    @Requires('read', subject)
    @ApiOperation({ summary: `Lister : ${label}` })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'pageSize', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @ApiQuery({ name: 'dir', required: false, enum: ['asc', 'desc'] })
    @ApiQuery({ name: 'q', required: false, description: 'Recherche textuelle (pg_trgm)' })
    @ApiOkResponse({ description: '{ items, total, page, pageSize }' })
    list(@CurrentPrincipal() principal: Principal, @Query() query: Record<string, unknown>) {
      return this.crud.list(principal, subject, normalizeQuery(query));
    }

    @Get('export')
    @Requires('export', subject)
    @ApiOperation({ summary: `Exporter en CSV : ${label}` })
    async exportCsv(
      @CurrentPrincipal() principal: Principal,
      @Query() query: Record<string, unknown>,
      @Res({ passthrough: true }) res: Response,
    ) {
      const file = await this.crud.exportCsv(principal, subject, normalizeQuery(query));
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      res.setHeader('X-Export-Truncated', file.truncated ? '1' : '0');
      return new StreamableFile(Buffer.from(file.csv, 'utf8'));
    }

    @Get('meta')
    @Requires('read', subject)
    @ApiOperation({ summary: `Champs : ${label}` })
    meta(@CurrentPrincipal() principal: Principal) {
      return this.crud.describe(principal, subject);
    }

    @Post()
    @Requires('create', subject)
    @ApiOperation({ summary: `Créer : ${label}` })
    create(@CurrentPrincipal() principal: Principal, @Body() body: unknown, @Req() req: Request & { requestId?: string }) {
      return this.crud.create(principal, subject, body, req.requestId);
    }

    @Get(':id')
    @Requires('read', subject)
    @ApiOperation({ summary: `Détail : ${label}` })
    get(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
      return this.crud.get(principal, subject, id);
    }

    @Get(':id/audit')
    @Requires('read', subject)
    @ApiOperation({ summary: `Historique d audit : ${label}` })
    audit(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
      return this.crud.history(principal, subject, id);
    }

    @Patch(':id')
    @Requires('update', subject)
    @ApiOperation({ summary: `Modifier : ${label}` })
    update(
      @CurrentPrincipal() principal: Principal,
      @Param('id') id: string,
      @Body() body: unknown,
      @Req() req: Request & { requestId?: string },
    ) {
      return this.crud.update(principal, subject, id, body, req.requestId);
    }
  }

  Object.defineProperty(ResourceController, 'name', { value: `${subject}Controller` });
  return ResourceController;
}

export function controllersFor(moduleKey: ModuleKey): Type[] {
  return Object.values(RESOURCE_META)
    .filter((meta) => meta.module === moduleKey)
    .map((meta) => createResourceController(meta.subject));
}
