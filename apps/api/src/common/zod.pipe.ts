import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/** Validation stricte des entrées avec les schémas partagés (@temper/shared). */
export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const res = this.schema.safeParse(value);
    if (!res.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        issues: res.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    return res.data;
  }
}
