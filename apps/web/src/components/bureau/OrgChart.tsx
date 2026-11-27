'use client';

/**
 * Organigramme et revue trimestrielle. Les noms viennent de l API, jamais d une liste locale.
 * MAAYOUD
 */
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/ui/Empty';
import { api } from '@/lib/api';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  managerId: string | null;
  status: string;
}

interface ReviewItem {
  id: string;
  role: string;
  email: string;
  since: string;
}

export function OrgChart() {
  const t = useTranslations('desk');
  const chart = useQuery({ queryKey: ['org-chart'], queryFn: () => api<{ people: Person[] }>('/organisation/chart') });
  const review = useQuery({ queryKey: ['role-review'], queryFn: () => api<{ items: ReviewItem[] }>('/people/roles/review'), retry: false });
  const people = (chart.data?.people ?? []).filter((person) => person.status !== 'LEFT');
  const byManager = new Map<string | null, Person[]>();
  const ids = new Set(people.map((person) => person.id));
  for (const person of people) {
    const manager = person.managerId && ids.has(person.managerId) ? person.managerId : null;
    byManager.set(manager, [...(byManager.get(manager) ?? []), person]);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">{t('chart')}</h1>
      {people.length === 0 ? <Empty title={t('chartEmpty')} /> : <Tree nodes={byManager.get(null) ?? []} byManager={byManager} />}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{t('review')}</h2>
        {(review.data?.items ?? []).length === 0 ? (
          <Empty title={t('reviewEmpty')} />
        ) : (
          <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
            {review.data?.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span>{item.email}</span>
                <span className="text-cacao-800">{item.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tree({ nodes, byManager }: { nodes: Person[]; byManager: Map<string | null, Person[]> }) {
  if (!nodes.length) return null;
  return (
    <ul className="space-y-2 border-l border-black/10 pl-4">
      {nodes.map((person) => (
        <li key={person.id}>
          <Link href={`/rh/employes/${person.id}`} className="inline-flex flex-col rounded-xl bg-white px-3 py-2 text-sm shadow-sm hover:ring-2 hover:ring-lavande-300">
            <span className="font-medium">
              {person.firstName} {person.lastName}
            </span>
            {person.jobTitle && <span className="text-xs text-cacao-800">{person.jobTitle}</span>}
          </Link>
          <div className="mt-2">
            <Tree nodes={byManager.get(person.id) ?? []} byManager={byManager} />
          </div>
        </li>
      ))}
    </ul>
  );
}
