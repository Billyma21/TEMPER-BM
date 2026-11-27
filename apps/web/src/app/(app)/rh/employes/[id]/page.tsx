'use client';

/**
 * Fiche employé : chaque onglet relit l API. Les champs hors droits ne sont pas demandés.
 * MAAYOUD
 */
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/ui/Empty';
import { api } from '@/lib/api';

const TABS = ['identity', 'job', 'contracts', 'trainings', 'documents', 'equipment', 'badges'] as const;

export default function EmployeeFilePage() {
  const t = useTranslations('desk');
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<(typeof TABS)[number]>('identity');
  const employee = useQuery({ queryKey: ['employee', id], queryFn: () => api<Record<string, unknown>>(`/rh/employees/${id}`) });
  const contracts = useQuery({ queryKey: ['contracts', id], queryFn: () => api<{ items: Array<{ id: string; type: string; status: string }> }>(`/rh/contracts?employeeId=${id}&pageSize=20`), enabled: tab === 'contracts' });
  const trainings = useQuery({ queryKey: ['trainings', id], queryFn: () => api<{ items: Array<{ id: string; title: string; type: string; validUntil: string | null }> }>(`/rh/trainings?employeeId=${id}&pageSize=20`), enabled: tab === 'trainings' });
  const documents = useQuery({ queryKey: ['documents', id], queryFn: () => api<{ items: Array<{ id: string; title?: string; kind?: string }> }>(`/rh/employee-documents?employeeId=${id}&pageSize=20`), enabled: tab === 'documents' });
  const equipment = useQuery({ queryKey: ['ppe', id], queryFn: () => api<{ items: Array<{ id: string; type?: string; name?: string }> }>(`/outils/ppes?employeeId=${id}&pageSize=20`), enabled: tab === 'equipment' });
  const badges = useQuery({ queryKey: ['badges', id], queryFn: () => api<{ items: Array<{ id: string; status: string; kind: string; uidLast4: string }> }>(`/acces/badges?holderEmployeeId=${id}&pageSize=20`), enabled: tab === 'badges' });
  const row = employee.data;
  const named = row && typeof row.firstName === 'string' ? row : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <Link href="/organisation/organigramme" className="text-sm font-medium text-lavande-600">
        {t('chart')}
      </Link>
      <h1 className="text-2xl font-semibold">{named ? `${named.firstName} ${String(named.lastName ?? '')}` : t('identity')}</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-3 py-1 text-sm ${tab === item ? 'bg-cacao-900 text-white' : 'bg-white text-cacao-900'}`}>
            {t(item)}
          </button>
        ))}
      </div>
      {tab === 'identity' && named && (
        <dl className="grid gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <Row label="E-mail" value={named.workEmail} />
          <Row label="Téléphone" value={named.workPhone} />
          <Row label="Statut" value={named.status} />
        </dl>
      )}
      {tab === 'job' && named && (
        <dl className="grid gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <Row label={t('job')} value={named.jobTitle} />
          <Row label="Type" value={named.employmentType} />
        </dl>
      )}
      {tab === 'contracts' && <Lines rows={contracts.data?.items ?? []} label={(item) => `${item.type} · ${item.status}`} />}
      {tab === 'trainings' && <Lines rows={trainings.data?.items ?? []} label={(item) => item.title} />}
      {tab === 'documents' && <Lines rows={documents.data?.items ?? []} label={(item) => item.title ?? item.kind ?? item.id} />}
      {tab === 'equipment' && <Lines rows={equipment.data?.items ?? []} label={(item) => item.name ?? item.type ?? item.id} />}
      {tab === 'badges' && <Lines rows={badges.data?.items ?? []} label={(item) => `${item.kind} · ${item.status} · ${item.uidLast4}`} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-cacao-800">{label}</dt>
      <dd>{value == null || value === '' ? '-' : String(value)}</dd>
    </div>
  );
}

function Lines<T extends { id: string }>({ rows, label }: { rows: T[]; label: (row: T) => string }) {
  const t = useTranslations('table');
  if (!rows.length) return <Empty title={t('empty')} />;
  return (
    <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
      {rows.map((row) => (
        <li key={row.id} className="py-3 text-sm">
          {label(row)}
        </li>
      ))}
    </ul>
  );
}
