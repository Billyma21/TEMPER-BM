'use client';

/**
 * Relevés et jours fériés. Les lignes viennent de l API.
 * MAAYOUD
 */
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/ui/Empty';
import { api } from '@/lib/api';

export function TimesheetBoard() {
  const t = useTranslations('time');
  const sheets = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => api<{ items: Array<{ id: string; name: string; periodStart: string; periodEnd: string; status: string }> }>('/time/timesheets'),
  });
  const items = sheets.data?.items ?? [];
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('sheets')}</h1>
      {items.length === 0 ? (
        <Empty title={t('emptySheets')} />
      ) : (
        <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.name} <span className="text-cacao-800">{item.periodStart}</span>
              </span>
              <span className="text-cacao-800">{item.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HolidayBoard() {
  const t = useTranslations('time');
  const year = new Date().getFullYear();
  const holidays = useQuery({
    queryKey: ['holidays', year],
    queryFn: () => api<{ items: Array<{ id: string; date: string; label: string }> }>(`/time/holidays?year=${year}`),
  });
  const items = holidays.data?.items ?? [];
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('holidays')}</h1>
      {items.length === 0 ? (
        <Empty title={t('emptyHolidays')} />
      ) : (
        <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span>{item.label}</span>
              <span className="tabular-nums text-cacao-800">{item.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
