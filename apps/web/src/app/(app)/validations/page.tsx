'use client';

/**
 * Boîte unique : ce que je dois décider, et mes propres demandes.
 * MAAYOUD
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { Field, TextInput } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { ApiError, api } from '@/lib/api';

interface InboxItem {
  id: string;
  label: string;
  subjectType: string;
  currentStep: number;
  stepsCount: number;
  createdAt: string;
  delegated: boolean;
  amount: string | null;
}

interface MineItem {
  id: string;
  label: string;
  status: string;
  createdAt: string;
}

export default function ValidationsPage() {
  const t = useTranslations('approvals');
  const toast = useToast();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const inbox = useQuery({
    queryKey: ['inbox'],
    queryFn: () => api<{ toDecide: InboxItem[]; mine: MineItem[] }>('/approvals/inbox'),
  });

  async function decide(id: string, decision: 'APPROVED' | 'REJECTED') {
    try {
      await api(`/approvals/${id}/decide`, { method: 'POST', body: JSON.stringify({ decision, comment: comment || undefined }) });
      setComment('');
      await qc.invalidateQueries({ queryKey: ['inbox'] });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      toast(error instanceof ApiError ? (error.body?.message ?? error.message) : (error as Error).message);
    }
  }

  const toDecide = inbox.data?.toDecide ?? [];
  const mine = inbox.data?.mine ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-cacao-700/60">{t('intro')}</p>
      </header>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{t('incoming')}</h2>
        {toDecide.length === 0 ? (
          <Empty title={t('empty')} />
        ) : (
          <ul className="space-y-3">
            {toDecide.map((item) => (
              <li key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-xs text-cacao-700/60">
                      {item.subjectType}
                      {item.amount ? ` · ${item.amount} EUR` : ''}
                      {item.delegated ? ` · ${t('delegated')}` : ''}
                    </p>
                    <p className="text-xs text-cacao-700/60">{t('step', { current: item.currentStep + 1, total: Math.max(item.stepsCount, 1) })}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <Field label={t('comment')}>
                    <TextInput value={comment} onChange={(event) => setComment(event.target.value)} />
                  </Field>
                  <Button onClick={() => void decide(item.id, 'APPROVED')}>{t('approve')}</Button>
                  <Button variant="danger" onClick={() => void decide(item.id, 'REJECTED')}>
                    {t('reject')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{t('mine')}</h2>
        {mine.length === 0 ? (
          <Empty title={t('empty')} />
        ) : (
          <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
            {mine.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span>{item.label}</span>
                <span className="text-xs text-cacao-700/60">{item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
