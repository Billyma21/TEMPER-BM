'use client';

/**
 * Tablette de ligne et traçabilité aval. Aucune formulation, aucune ligne inventée.
 * MAAYOUD
 */
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/ui/Empty';

export function LineTablet() {
  const t = useTranslations('production');
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('tablet')}</h1>
      <Empty title={t('emptyTablet')} />
    </div>
  );
}

export function TraceBoard() {
  const t = useTranslations('production');
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('trace')}</h1>
      <Empty title={t('emptyTrace')} />
    </div>
  );
}
