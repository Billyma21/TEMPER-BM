/**
 * Actes de fabrication : version de recette, lancement, tablette, traçabilité, TRS, quêtes.
 * MAAYOUD
 */
import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConsumeLotSchema,
  LineDowntimeSchema,
  OrderLaunchSchema,
  OrderStartSchema,
  OutputLotSchema,
  QuestDrawSchema,
  QuestProgressSchema,
  RecipeVersionSchema,
  type ConsumeLotInput,
  type LineDowntimeInput,
  type OrderLaunchInput,
  type OrderStartInput,
  type OutputLotInput,
  type QuestDrawInput,
  type QuestProgressInput,
  type RecipeVersionInput,
} from '@temper/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { CurrentPrincipal, Requires } from '../permissions/decorators.js';
import type { Principal } from '../permissions/principal.js';
import { ProductionService } from './production.service.js';

@ApiTags('production')
@Controller('production')
export class ProductionController {
  constructor(private readonly production: ProductionService) {}

  @Post('recipes/:id/versions')
  @Requires('create', 'Recipe')
  version(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(RecipeVersionSchema)) body: RecipeVersionInput) {
    return this.production.newVersion(p, id, body);
  }

  @Post('orders')
  @Requires('create', 'ProductionOrder')
  launch(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(OrderLaunchSchema)) body: OrderLaunchInput) {
    return this.production.launch(p, body);
  }

  @Get('orders/:id/sheet')
  @Requires('read', 'ProductionOrder')
  sheet(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.production.sheet(p, id);
  }

  @Post('orders/:id/start')
  @Requires('update', 'ProductionOrder')
  @HttpCode(200)
  start(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(OrderStartSchema)) body: OrderStartInput) {
    return this.production.start(p, id, body);
  }

  @Post('orders/:id/consume')
  @Requires('execute', 'ProductionStep')
  @HttpCode(200)
  consume(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(ConsumeLotSchema)) body: ConsumeLotInput) {
    return this.production.consume(p, id, body);
  }

  @Post('orders/:id/output')
  @Requires('execute', 'ProductionStep')
  @HttpCode(200)
  output(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(OutputLotSchema)) body: OutputLotInput) {
    return this.production.output(p, id, body);
  }

  @Post('orders/:id/downtime')
  @Requires('create', 'Downtime')
  downtime(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(LineDowntimeSchema)) body: LineDowntimeInput) {
    return this.production.downtime(p, id, body);
  }

  @Get('batches/:id/downstream')
  @Requires('read', 'Batch')
  downstream(@CurrentPrincipal() p: Principal, @Param('id') id: string) {
    return this.production.downstream(p, id);
  }

  @Get('lines/:id/trs')
  @Requires('read', 'ProductionLine')
  trs(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Query('date') date?: string) {
    return this.production.trs(p, id, date);
  }

  @Post('quests/draw')
  @Requires('create', 'Quest')
  draw(@CurrentPrincipal() p: Principal, @Body(new ZodPipe(QuestDrawSchema)) body: QuestDrawInput) {
    return this.production.drawQuest(p, body);
  }

  @Post('quests/:id/progress')
  @Requires('update', 'Quest')
  @HttpCode(200)
  progress(@CurrentPrincipal() p: Principal, @Param('id') id: string, @Body(new ZodPipe(QuestProgressSchema)) body: QuestProgressInput) {
    return this.production.progressQuest(p, id, body);
  }
}
