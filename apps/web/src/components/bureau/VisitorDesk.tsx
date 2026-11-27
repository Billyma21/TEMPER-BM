'use client';

/**
 * Accueil des visiteurs. La liste vient de l API. Une liste vide reste vide.
 * MAAYOUD
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { useToast } from '@/components/ui/Toast';
import { ApiError, api } from '@/lib/api';

interface VisitorRow {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  purpose: string;
  status: string;
}

export function VisitorDesk() {
  const t = useTranslations('desk');
  const toast = useToast();
  const qc = useQueryClient();
  const [briefing, setBriefing] = useState(true);
  const [hygiene, setHygiene] = useState(false);
  const list = useQuery({
    queryKey: ['visitors'],
    queryFn: () => api<{ items: VisitorRow[] }>('/acces/visitors?pageSize=50'),
  });
  const rows = list.data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('visitors')}</h1>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={briefing} onChange={(event) => setBriefing(event.target.checked)} />
        {t('briefing')}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hygiene} onChange={(event) => setHygiene(event.target.checked)} />
        {t('hygiene')}
      </label>
      {rows.length === 0 ? (
        <Empty title={t('visitorsEmpty')} />
      ) : (
        <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
          {rows.map((visitor) => (
            <li key={visitor.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <div className="font-medium">
                  {visitor.firstName} {visitor.lastName}
                </div>
                <div className="text-cacao-800">{visitor.purpose}</div>
              </div>
              {visitor.status === 'EXPECTED' && (
                <Button
                  disabled={!briefing}
                  onClick={() => {
                    void api(`/access/visitors/${visitor.id}/arrive`, {
                      method: 'POST',
                      body: JSON.stringify({ safetyBriefing: true, hygieneDeclared: hygiene }),
                    })
                      .then(() => qc.invalidateQueries({ queryKey: ['visitors'] }))
                      .catch((error: unknown) => toast(error instanceof ApiError ? error.message : t('visitors')));
                  }}
                >
                  {t('arrive')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
