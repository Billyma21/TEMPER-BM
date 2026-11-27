/**
 * Recettes versionnées, ordres figés, tablette de ligne, généalogie, TRS et quêtes.
 * La formulation ne sort pas de la recette. La cadence n est pas une quête.
 * MAAYOUD
 */
import { HttpException, Injectable } from '@nestjs/common';
import { approvalSteps } from '@temper/permissions';
import type { ConsumeLotInput, LineDowntimeInput, OrderLaunchInput, OrderStartInput, OutputLotInput, QuestDrawInput, QuestProgressInput, RecipeVersionInput } from '@temper/shared';
import { assertCan, whereOrForbid, type Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { utcDay } from '../time/calendar.js';

const BANNED_EVENTS = new Set(['output_speed', 'kg_per_hour', 'production_speed', 'silence_incident']);

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  async newVersion(p: Principal, recipeId: string, input: RecipeVersionInput) {
    const db = this.prisma.db;
    const source = await db.recipe.findUnique({ where: { id: recipeId }, include: { lines: true, steps: true } });
    if (!source) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'create', 'Recipe', { code: source.code });
    const latest = await db.recipe.aggregate({ where: { code: source.code }, _max: { version: true } });
    const version = (latest._max.version ?? source.version) + 1;
    const created = await db.recipe.create({
      data: {
        code: source.code,
        name: source.name,
        productId: source.productId,
        version,
        status: 'IN_REVIEW',
        yieldKg: source.yieldKg,
        durationMinutes: source.durationMinutes,
        notes: input.notes,
        supersedesId: source.id,
        createdById: p.id,
        lines: {
          create: source.lines.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            uom: line.uom,
            lossPercent: line.lossPercent,
            phase: line.phase,
            sortOrder: line.sortOrder,
          })),
        },
        steps: {
          create: source.steps.map((step) => ({
            sequence: step.sequence,
            operation: step.operation,
            machineType: step.machineType,
            durationMinutes: step.durationMinutes,
            targetParams: step.targetParams ?? {},
            isCcp: step.isCcp,
            ccpCode: step.ccpCode,
            instructions: step.instructions,
          })),
        },
      },
    });
    const request = await db.approvalRequest.create({
      data: {
        policy: 'RECIPE_VERSION',
        subjectType: 'Recipe',
        subjectId: created.id,
        requesterUserId: p.id,
        requesterEmployeeId: p.employee?.id,
        steps: approvalSteps('RECIPE_VERSION'),
      },
    });
    return { id: created.id, version, requestId: request.id };
  }

  async launch(p: Principal, input: OrderLaunchInput) {
    const db = this.prisma.db;
    const recipe = await db.recipe.findUnique({ where: { id: input.recipeId }, include: { lines: true, steps: true } });
    if (!recipe || recipe.status !== 'APPROVED') throw new HttpException({ code: 'CONFLICT', field: 'recipe' }, 409);
    const line = await db.productionLine.findUnique({ where: { id: input.lineId } });
    if (!line) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    const row = {
      siteId: line.siteId,
      teamId: input.teamId,
      lineId: line.id,
      recipeId: recipe.id,
      kind: 'STANDARD' as const,
    };
    assertCan(p, 'create', 'ProductionOrder', row);
    const order = await db.productionOrder.create({
      data: {
        ...row,
        number: `OF-S6-${Date.now()}`,
        productId: input.productId ?? recipe.productId,
        recipeVersion: recipe.version,
        plannedQtyKg: input.plannedQtyKg,
        plannedStart: new Date(input.plannedStart),
        plannedEnd: new Date(input.plannedEnd),
        createdById: p.id,
        steps: {
          create: recipe.steps.map((step) => ({
            siteId: line.siteId,
            teamId: input.teamId,
            sequence: step.sequence,
            operation: step.operation,
            status: 'TODO',
          })),
        },
      },
    });
    const reserved = await this.reserve(recipe, line.siteId, Number(input.plannedQtyKg), Number(recipe.yieldKg));
    return { id: order.id, number: order.number, recipeVersion: recipe.version, reserved };
  }

  async sheet(p: Principal, id: string) {
    const order = await this.order(id);
    assertCan(p, 'read', 'ProductionOrder', order);
    const steps = await this.prisma.db.productionStep.findMany({ where: { orderId: id }, orderBy: { sequence: 'asc' } });
    return {
      id: order.id,
      number: order.number,
      status: order.status,
      recipeVersion: order.recipeVersion,
      changeoverRequired: await this.changeoverRequired(order),
      steps: steps.map((step) => ({
        sequence: step.sequence,
        operation: step.operation,
        status: step.status,
        measuredParams: step.measuredParams,
      })),
    };
  }

  async start(p: Principal, id: string, input: OrderStartInput) {
    const order = await this.order(id);
    if (order.status !== 'PLANNED' && order.status !== 'RELEASED') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    assertCan(p, 'update', 'ProductionOrder', order);
    const needed = await this.changeoverRequired(order);
    if (needed && !input.changeover) throw new HttpException({ code: 'CONFLICT', field: 'changeover', reason: 'ALLERGEN_CHANGEOVER' }, 409);
    if (needed && input.changeover) {
      await this.prisma.db.downtime.create({
        data: {
          siteId: order.siteId,
          teamId: order.teamId,
          lineId: order.lineId,
          orderId: order.id,
          category: 'CHANGEOVER',
          startedAt: new Date(),
          endedAt: new Date(),
          reason: 'ALLERGEN_CHANGEOVER',
          declaredByEmployeeId: p.employee?.id,
        },
      });
    }
    const updated = await this.prisma.db.productionOrder.update({
      where: { id },
      data: { status: 'IN_PROGRESS', actualStart: new Date() },
    });
    return { id: updated.id, status: updated.status };
  }

  async consume(p: Principal, id: string, input: ConsumeLotInput) {
    const order = await this.order(id);
    if (order.status !== 'IN_PROGRESS') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    const step = await this.prisma.db.productionStep.findFirst({ where: { orderId: id }, orderBy: { sequence: 'asc' } });
    if (!step) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'execute', 'ProductionStep', step);
    const batch = await this.prisma.db.batch.findUnique({ where: { code: input.batchCode } });
    if (!batch) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    if (batch.status !== 'RELEASED') throw new HttpException({ code: 'CONFLICT', field: 'batch', reason: 'LOT_NOT_RELEASED' }, 409);
    if (Number(batch.quantity) < input.quantity) throw new HttpException({ code: 'CONFLICT', field: 'quantity' }, 409);
    await this.prisma.db.$transaction(async (tx) => {
      await tx.batch.update({ where: { id: batch.id }, data: { quantity: { decrement: input.quantity } } });
      const lots = await tx.stockLot.findMany({ where: { batchId: batch.id, quantity: { gt: 0 } }, orderBy: { bestBefore: 'asc' } });
      let left = input.quantity;
      for (const lot of lots) {
        if (left <= 0) break;
        const take = Math.min(left, Number(lot.quantity));
        await tx.stockLot.update({ where: { id: lot.id }, data: { quantity: { decrement: take } } });
        left -= take;
      }
      await tx.stockMovement.create({
        data: {
          siteId: order.siteId,
          itemId: batch.itemId,
          batchId: batch.id,
          quantity: input.quantity,
          uom: batch.uom,
          type: 'PRODUCTION_CONSUMPTION',
          referenceType: 'ProductionOrder',
          referenceId: order.id,
          createdByEmployeeId: p.employee?.id,
        },
      });
    });
    return { orderId: order.id, batchId: batch.id, quantity: input.quantity };
  }

  async output(p: Principal, id: string, input: OutputLotInput) {
    const order = await this.order(id);
    if (order.status !== 'IN_PROGRESS') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    const step = await this.prisma.db.productionStep.findFirst({ where: { orderId: id }, orderBy: { sequence: 'asc' } });
    if (!step) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'execute', 'ProductionStep', step);
    const product = order.productId ? await this.prisma.db.product.findUnique({ where: { id: order.productId }, select: { itemId: true } }) : null;
    const recipe = await this.prisma.db.recipe.findUnique({ where: { id: order.recipeId }, select: { product: { select: { itemId: true } } } });
    const itemId = product?.itemId ?? recipe?.product?.itemId;
    if (!itemId) throw new HttpException({ code: 'CONFLICT', field: 'product' }, 409);
    const scrap = input.scrapKg ?? 0;
    const created = await this.prisma.db.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: {
          code: `S6${Date.now().toString().slice(-10)}`,
          siteId: order.siteId,
          itemId,
          orderId: order.id,
          kind: 'FINISHED_GOOD',
          quantity: input.quantityKg,
          uom: 'KG',
          producedAt: new Date(),
          status: 'QUARANTINE',
        },
      });
      const movements = await tx.stockMovement.findMany({
        where: { referenceType: 'ProductionOrder', referenceId: order.id, type: 'PRODUCTION_CONSUMPTION', batchId: { not: null } },
        select: { batchId: true, quantity: true },
      });
      const parents = new Map<string, number>();
      for (const movement of movements) {
        if (!movement.batchId) continue;
        parents.set(movement.batchId, (parents.get(movement.batchId) ?? 0) + Number(movement.quantity));
      }
      for (const [parentBatchId, quantity] of parents) {
        await tx.batchGenealogy.create({
          data: { parentBatchId, childBatchId: batch.id, quantity, orderId: order.id },
        });
      }
      await tx.productionOrder.update({
        where: { id: order.id },
        data: { producedQtyKg: { increment: input.quantityKg }, scrapQtyKg: { increment: scrap } },
      });
      await tx.stockMovement.create({
        data: {
          siteId: order.siteId,
          itemId,
          batchId: batch.id,
          quantity: input.quantityKg,
          uom: 'KG',
          type: 'PRODUCTION_OUTPUT',
          referenceType: 'ProductionOrder',
          referenceId: order.id,
          createdByEmployeeId: p.employee?.id,
        },
      });
      return batch;
    });
    return { id: created.id, code: created.code, status: created.status };
  }

  async downtime(p: Principal, id: string, input: LineDowntimeInput) {
    const order = await this.order(id);
    assertCan(p, 'create', 'Downtime', { siteId: order.siteId, teamId: order.teamId, lineId: order.lineId, orderId: order.id });
    const row = await this.prisma.db.downtime.create({
      data: {
        siteId: order.siteId,
        teamId: order.teamId,
        lineId: order.lineId,
        orderId: order.id,
        category: input.category,
        reason: input.reason,
        startedAt: new Date(),
        declaredByEmployeeId: p.employee?.id,
      },
    });
    return { id: row.id, category: row.category };
  }

  async downstream(p: Principal, id: string) {
    const root = await this.prisma.db.batch.findUnique({ where: { id } });
    if (!root) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'read', 'Batch', root);
    const batches: Array<{ id: string; code: string; status: string }> = [];
    const orders = new Set<string>();
    const seen = new Set<string>([id]);
    let frontier = [id];
    for (let depth = 0; depth < 8 && frontier.length; depth += 1) {
      const links = await this.prisma.db.batchGenealogy.findMany({
        where: { parentBatchId: { in: frontier } },
        include: { child: { select: { id: true, code: true, status: true, orderId: true } } },
      });
      frontier = [];
      for (const link of links) {
        if (seen.has(link.child.id)) continue;
        seen.add(link.child.id);
        batches.push({ id: link.child.id, code: link.child.code, status: link.child.status });
        if (link.child.orderId) orders.add(link.child.orderId);
        frontier.push(link.child.id);
      }
    }
    const orderRows = orders.size
      ? await this.prisma.db.productionOrder.findMany({ where: { id: { in: [...orders] } }, select: { id: true, number: true } })
      : [];
    return { batches, orders: orderRows, customers: [] as Array<{ id: string; name: string }> };
  }

  async trs(p: Principal, lineId: string, date?: string) {
    const line = await this.prisma.db.productionLine.findUnique({ where: { id: lineId } });
    if (!line) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'read', 'ProductionLine', line);
    const day = utcDay(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10));
    const next = new Date(day.getTime() + 86_400_000);
    const downs = await this.prisma.db.downtime.findMany({ where: { lineId, startedAt: { gte: day, lt: next } } });
    let downMinutes = 0;
    for (const row of downs) {
      const end = row.endedAt ?? new Date();
      downMinutes += Math.max(0, Math.round((end.getTime() - row.startedAt.getTime()) / 60_000));
    }
    const plannedMinutes = 480;
    const runMinutes = Math.max(0, plannedMinutes - downMinutes);
    const made = await this.prisma.db.productionOrder.findMany({
      where: { lineId, actualStart: { gte: day, lt: next } },
      select: { producedQtyKg: true, scrapQtyKg: true },
    });
    const good = made.reduce((sum, row) => sum + Number(row.producedQtyKg), 0);
    const scrap = made.reduce((sum, row) => sum + Number(row.scrapQtyKg), 0);
    const availability = runMinutes / plannedMinutes;
    const expected = (Number(line.nominalRateKgH) * runMinutes) / 60;
    const performance = expected <= 0 ? 0 : Math.min(1, good / expected);
    const quality = good + scrap <= 0 ? 1 : good / (good + scrap);
    const oee = Math.min(1, availability) * performance * quality;
    const snapshot = await this.prisma.db.oeeSnapshot.upsert({
      where: { lineId_date_shift: { lineId, date: day, shift: 'JOUR' } },
      create: {
        siteId: line.siteId,
        lineId,
        date: day,
        shift: 'JOUR',
        plannedMinutes,
        runMinutes,
        goodQtyKg: good,
        totalQtyKg: good + scrap,
        availability,
        performance,
        quality,
        oee,
      },
      update: { plannedMinutes, runMinutes, goodQtyKg: good, totalQtyKg: good + scrap, availability, performance, quality, oee, computedAt: new Date() },
    });
    return { lineId, date: day.toISOString().slice(0, 10), oee: Number(snapshot.oee), availability: Number(snapshot.availability) };
  }

  /** Quête du jour : hygiène ou signalement. Jamais la cadence, jamais le silence. */
  async drawQuest(p: Principal, input: QuestDrawInput) {
    const employee = await this.prisma.db.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'create', 'Quest', { employeeId: employee.id, teamId: employee.teamId });
    const today = utcDay(new Date().toISOString().slice(0, 10));
    const existing = await this.prisma.db.quest.findFirst({ where: { employeeId: employee.id, date: today } });
    if (existing) return { id: existing.id, title: existing.title, status: existing.status, progress: existing.progress, target: existing.target };
    let template = await this.prisma.db.questTemplate.findUnique({ where: { code: 'HYGIENE_POSTE' } });
    if (!template) {
      template = await this.prisma.db.questTemplate.create({
        data: {
          companyId: employee.companyId,
          code: 'HYGIENE_POSTE',
          title: 'Contrôle hygiène du poste',
          description: 'Vérifier le poste avant de produire.',
          roleKeys: ['OPERATEUR'],
          cadence: 'DAILY',
          objective: { event: 'hygiene_check', count: 1 },
          xpReward: 10,
        },
      });
    }
    const objective = template.objective as { event?: string; count?: number };
    if (objective.event && BANNED_EVENTS.has(objective.event)) throw new HttpException({ code: 'CONFLICT', field: 'event', reason: 'ETHICS' }, 409);
    const quest = await this.prisma.db.quest.create({
      data: {
        templateId: template.id,
        employeeId: employee.id,
        teamId: employee.teamId,
        date: today,
        title: template.title,
        target: objective.count ?? 1,
      },
    });
    return { id: quest.id, title: quest.title, status: quest.status, progress: quest.progress, target: quest.target };
  }

  async progressQuest(p: Principal, id: string, input: QuestProgressInput) {
    if (BANNED_EVENTS.has(input.event)) throw new HttpException({ code: 'CONFLICT', field: 'event', reason: 'ETHICS' }, 409);
    const quest = await this.prisma.db.quest.findUnique({ where: { id }, include: { template: true } });
    if (!quest) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    assertCan(p, 'update', 'Quest', quest);
    if (quest.status !== 'ACTIVE') throw new HttpException({ code: 'CONFLICT', field: 'status' }, 409);
    const objective = (quest.template?.objective ?? {}) as { event?: string };
    if (objective.event && objective.event !== input.event) throw new HttpException({ code: 'CONFLICT', field: 'event' }, 409);
    const progress = quest.progress + 1;
    const done = progress >= quest.target;
    const xp = done ? (quest.template?.xpReward ?? 0) : 0;
    const updated = await this.prisma.db.quest.update({
      where: { id },
      data: { progress, status: done ? 'COMPLETED' : 'ACTIVE', xpAwarded: xp, completedAt: done ? new Date() : null },
    });
    if (xp > 0) {
      await this.prisma.db.employee.update({ where: { id: quest.employeeId }, data: { xp: { increment: xp } } });
      await this.prisma.db.xpEvent.create({ data: { employeeId: quest.employeeId, amount: xp, source: 'QUEST', sourceId: quest.id, reason: quest.title } });
    }
    return { id: updated.id, status: updated.status, progress: updated.progress, xpAwarded: updated.xpAwarded };
  }

  private async order(id: string) {
    const order = await this.prisma.db.productionOrder.findUnique({ where: { id } });
    if (!order) throw new HttpException({ code: 'NOT_FOUND' }, 404);
    return order;
  }

  private async changeoverRequired(order: { id: string; lineId: string | null; productId: string | null }) {
    if (!order.lineId || !order.productId) return false;
    const previous = await this.prisma.db.productionOrder.findFirst({
      where: { lineId: order.lineId, id: { not: order.id }, status: { not: 'CANCELLED' }, productId: { not: null } },
      orderBy: { plannedStart: 'desc' },
    });
    if (!previous?.productId) return false;
    const current = await this.allergenKey(order.productId);
    const before = await this.allergenKey(previous.productId);
    if (current === before) return false;
    const done = await this.prisma.db.downtime.findFirst({ where: { orderId: order.id, category: 'CHANGEOVER', reason: 'ALLERGEN_CHANGEOVER' } });
    return !done;
  }

  private async allergenKey(productId: string) {
    const rows = await this.prisma.db.productAllergen.findMany({ where: { productId }, include: { allergen: { select: { code: true } } } });
    return rows.map((row) => `${row.allergen.code}:${row.presence}`).sort().join('|');
  }

  private async reserve(recipe: { lines: Array<{ itemId: string; quantity: unknown; lossPercent: unknown }>; yieldKg: unknown }, siteId: string, plannedQtyKg: number, yieldKg: number) {
    const factor = yieldKg > 0 ? plannedQtyKg / yieldKg : 1;
    let reserved = 0;
    for (const line of recipe.lines) {
      const need = Number(line.quantity) * factor * (1 + Number(line.lossPercent) / 100);
      const lots = await this.prisma.db.stockLot.findMany({
        where: { siteId, itemId: line.itemId, status: 'AVAILABLE', quantity: { gt: 0 } },
        include: { batch: { select: { status: true } } },
        orderBy: { bestBefore: 'asc' },
      });
      let left = need;
      for (const lot of lots) {
        if (left <= 0) break;
        if (lot.batch && lot.batch.status !== 'RELEASED') continue;
        const free = Math.max(0, Number(lot.quantity) - Number(lot.reservedQty));
        const take = Math.min(left, free);
        if (take <= 0) continue;
        await this.prisma.db.stockLot.update({ where: { id: lot.id }, data: { reservedQty: { increment: take } } });
        reserved += 1;
        left -= take;
      }
    }
    return reserved;
  }
}
