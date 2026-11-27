'use client';

/**
 * Mon espace : la journée de chacun, quel que soit son rôle.
 * MAAYOUD
 */
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Clock, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { QuestCard } from '@/components/ui/QuestCard';
import { type TodayResponse, type WorldSnapshot, api } from '@/lib/api';
import { useSession } from '@/lib/session';

const SELF_SERVICE_LINKS: Record<string, { label: string; href: string }> = {
  LeaveRequest: { label: 'Mes congés', href: '/moi/conges' },
  EmployeePayroll: { label: 'Mes fiches de paie', href: '/moi/paie' },
  Training: { label: 'Mes formations', href: '/moi/formations' },
  Schedule: { label: 'Mon planning', href: '/moi/planning' },
  TimeEntry: { label: 'Mes pointages', href: '/moi/pointages' },
  ToolLoan: { label: 'Mes outils empruntés', href: '/moi/outils' },
  ExpenseReport: { label: 'Mes notes de frais', href: '/moi/frais' },
  Incident: { label: 'Signaler un incident', href: '/moi/signaler' },
  DataRequest: { label: 'Mes données personnelles', href: '/moi/donnees' },
};

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });
const dur = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;

export default function HomePage() {
  const { me } = useSession();
  const today = useQuery({ queryKey: ['today'], queryFn: () => api<TodayResponse | null>('/time/me/today') });
  const world = useQuery({ queryKey: ['world'], queryFn: () => api<WorldSnapshot>('/world/snapshot') });
  const firstName = me.user.employee?.preferredName ?? me.user.employee?.firstName ?? '';

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Bonjour {firstName}, <span className="serif-accent text-lavande-600">belle journée</span>
        </h1>
        <p className="text-sm text-cacao-700/60">Votre journée, vos quêtes et ce qui demande votre attention.</p>
      </div>

      {world.data && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {world.data.kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-[11px] font-medium text-cacao-700/60">{k.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <header className="mb-4 flex items-center gap-2">
            <Clock className="size-4 text-lavande-600" />
            <h2 className="text-sm font-semibold">Ma journée</h2>
          </header>
          {today.data ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <div className="text-[11px] text-cacao-700/60">Poste prévu</div>
                  <div className="text-lg font-semibold">
                    {today.data.schedule ? `${hhmm(today.data.schedule.plannedStart)} - ${hhmm(today.data.schedule.plannedEnd)}` : 'Aucun poste planifié'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-cacao-700/60">Temps de travail</div>
                  <div className="text-lg font-semibold tabular-nums">{dur(today.data.day.workedMinutes)}</div>
                </div>
                <div className="ml-auto flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[13px] text-cacao-700">
                  <Fingerprint className="size-4" /> Pointage à la borne avec votre badge
                </div>
              </div>
              <ol className="flex flex-wrap gap-2">
                {today.data.entries.map((e) => (
                  <li key={e.id} className="rounded-full bg-lavande-100 px-3 py-1 text-xs font-medium text-lavande-600">
                    {e.kind === 'IN' ? 'Entrée' : e.kind === 'OUT' ? 'Sortie' : e.kind === 'BREAK_START' ? 'Pause' : 'Reprise'} {hhmm(e.at)}
                  </li>
                ))}
              </ol>
              {today.data.day.anomalies.length > 0 && (
                <p className="flex items-center gap-2 text-sm text-warn">
                  <AlertTriangle className="size-4" /> Anomalie à régulariser : {today.data.day.anomalies.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-cacao-700/60">Pas de dossier de temps lié à ce compte.</p>
          )}
        </section>

        {world.data?.me && <QuestCard firstName={firstName} quests={world.data.quests} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">À surveiller dans mon périmètre</h2>
          {world.data?.alerts.length ? (
            <ul className="divide-y divide-black/5">
              {world.data.alerts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className={a.severity === 'CRITICAL' ? 'size-2 rounded-full bg-danger' : 'size-2 rounded-full bg-warn'} />
                  <span className="flex-1">{a.label}</span>
                  {a.route && (
                    <Link href={a.route} className="flex items-center gap-1 text-xs font-medium text-lavande-600">
                      Ouvrir <ArrowRight className="size-3" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cacao-700/60">Rien à signaler.</p>
          )}
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Libre-service</h2>
          <ul className="grid gap-1.5">
            {me.selfService
              .filter((s) => s in SELF_SERVICE_LINKS)
              .map((s) => (
                <li key={s}>
                  <Link href={SELF_SERVICE_LINKS[s]!.href} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface">
                    {SELF_SERVICE_LINKS[s]!.label} <ArrowRight className="size-3.5 text-cacao-700/40" />
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
