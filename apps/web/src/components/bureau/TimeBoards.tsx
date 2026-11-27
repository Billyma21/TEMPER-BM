'use client';

/**
 * Planning de la semaine et anomalies du jour. Les lignes viennent de l API.
 * MAAYOUD
 */
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/ui/Empty';
import { api } from '@/lib/api';

function mondayIso() {
  const now = new Date();
  const day = now.getUTCDay() || 7;
  now.setUTCDate(now.getUTCDate() - day + 1);
  return now.toISOString().slice(0, 10);
}

function hour(iso: string) {
  return new Intl.DateTimeFormat('fr-BE', { timeZone: 'Europe/Brussels', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}

export function WeekBoard() {
  const t = useTranslations('time');
  const from = mondayIso();
  const week = useQuery({
    queryKey: ['week', from],
    queryFn: () => api<{ items: Array<{ id: string; date: string; name: string; start: string; end: string }> }>(`/time/schedules/week?from=${from}`),
  });
  const items = week.data?.items ?? [];
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('planning')}</h1>
      {items.length === 0 ? (
        <Empty title={t('emptyWeek')} />
      ) : (
        <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.name} <span className="text-cacao-800">{item.date}</span>
              </span>
              <span className="tabular-nums text-cacao-800">
                {hour(item.start)} {hour(item.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DayBoard() {
  const t = useTranslations('time');
  const date = new Date().toISOString().slice(0, 10);
  const anomalies = useQuery({
    queryKey: ['anomalies', date],
    queryFn: () => api<{ items: Array<{ id: string; anomalies: string[]; lateMinutes: number }> }>(`/time/anomalies?date=${date}`),
  });
  const items = anomalies.data?.items ?? [];
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('day')}</h1>
      <h2 className="text-sm font-semibold">{t('anomalies')}</h2>
      {items.length === 0 ? (
        <Empty title={t('noAnomaly')} />
      ) : (
        <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
          {items.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              {item.anomalies.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
