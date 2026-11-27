'use client';

import type { WorldSnapshot } from '@temper/shared';
import { clsx } from 'clsx';
import { AlertTriangle, ArrowRight, Eye, EyeOff, Flame, Lock, X } from 'lucide-react';
import Link from 'next/link';
import { QuestCard } from '@/components/ui/QuestCard';
import { LEAD_ROOMS, MACHINE_STATUS } from './palette';
import { useWorldUi } from './store';

export function Hud({ data }: { data: WorldSnapshot }) {
  const showLabels = useWorldUi((s) => s.showLabels);
  const toggleLabels = useWorldUi((s) => s.toggleLabels);
  const me = data.me;
  const pct = me ? Math.round(((512 - me.xpToNext) / 512) * 100) : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-between p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto space-y-2">
          <div className="rounded-2xl bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur">
            <div className="text-[11px] font-medium text-cacao-800">Tout le site, en un coup d oeil</div>
            <div className="text-sm font-semibold">{data.site.name}</div>
          </div>
          {data.gate?.evacuation && (
            <div className="rounded-2xl border-2 border-danger bg-white px-4 py-2 text-sm font-semibold text-cacao-900">
              Évacuation : rejoignez le point de rassemblement du parking nord.
            </div>
          )}
          <div className="flex max-w-[60vw] flex-wrap gap-1.5">
            {data.kpis.map((k) => (
              <span key={k.label} className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur">
                <b className="tabular-nums">{k.value}</b> <span className="text-cacao-700/60">{k.label.toLowerCase()}</span>
              </span>
            ))}
          </div>
          <button type="button" onClick={toggleLabels} className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium shadow-sm">
            {showLabels ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />} {showLabels ? 'Masquer' : 'Afficher'} les étiquettes
          </button>
        </div>
        {me && (
          <div className="pointer-events-auto w-60 rounded-2xl bg-white/95 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-ok font-bold text-white">{me.firstName.slice(0, 1)}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{me.firstName}</div>
                <div className="text-[11px] text-cacao-700/60">
                  Niveau {me.level} · {me.xp.toLocaleString('fr-BE')} XP
                </div>
              </div>
              <span className="rounded-full bg-lavande-100 px-2 py-0.5 text-[11px] font-semibold text-lavande-600">Niv. {me.level}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-ok" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-cacao-700/60">
              <span>{me.xpToNext} XP avant le niveau {me.level + 1}</span>
              <span className="flex items-center gap-0.5">
                <Flame className="size-3 text-warn" /> {me.streakDays} j
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="pointer-events-auto hidden w-80 sm:block">{me && <QuestCard firstName={me.firstName} quests={data.quests} compact />}</div>
        <Selection data={data} />
        <div className="pointer-events-auto hidden w-72 space-y-2 md:block">
          {data.alerts.slice(0, 4).map((a) => (
            <Link key={a.id} href={a.route ?? '#'} className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-[12px] shadow-sm">
              <AlertTriangle className={clsx('size-4 shrink-0', a.severity === 'CRITICAL' ? 'text-danger' : 'text-warn')} />
              <span className="flex-1">{a.label}</span>
            </Link>
          ))}
          <div className="flex flex-wrap gap-2 rounded-xl bg-white/80 px-3 py-2 text-[10px]">
            {Object.entries(MACHINE_STATUS)
              .slice(0, 5)
              .map(([k, v]) => (
                <span key={k} className="flex items-center gap-1">
                  <span className="size-2 rounded-full" style={{ background: v.color }} /> {v.label}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Selection({ data }: { data: WorldSnapshot }) {
  const sel = useWorldUi((s) => s.selection);
  const select = useWorldUi((s) => s.select);
  if (!sel) return <div className="flex-1" />;

  let title = '';
  let body: React.ReactNode = null;
  let route: string | null = null;

  if (sel.kind === 'building') {
    const b = data.buildings.find((x) => x.id === sel.id);
    if (!b) return null;
    title = b.name;
    route = b.locked ? null : b.route;
    body = b.locked ? (
      <p className="flex items-center gap-1.5 text-[13px] text-cacao-700/70">
        <Lock className="size-3.5" /> Zone hors de vos fonctions : la porte reste fermée.
      </p>
    ) : (
      <p className="text-[13px] text-cacao-700/70">{b.occupancy} personne(s) présente(s).</p>
    );
  } else if (sel.kind === 'machine') {
    const m = data.machines.find((x) => x.id === sel.id);
    if (!m) return null;
    title = `${m.name} (${m.code})`;
    route = '/production';
    body = (
      <p className="flex items-center gap-1.5 text-[13px]">
        <span className="size-2 rounded-full" style={{ background: MACHINE_STATUS[m.status].color }} /> {MACHINE_STATUS[m.status].label} · ligne {m.lineCode}
      </p>
    );
  } else if (sel.kind === 'lot') {
    const l = data.city?.find((x) => x.customerId === sel.id);
    if (!l) return null;
    title = l.name;
    route = '/ventes';
    body = l.orderNumber ? (
      <div className="text-[13px]">
        Commande {l.orderNumber} · {l.delivered ? 'livrée' : `${l.progress} %`}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
          <div className="h-full rounded-full bg-or-500" style={{ width: `${l.progress}%` }} />
        </div>
      </div>
    ) : (
      <p className="text-[13px] text-cacao-700/70">Aucune commande en cours visible pour vous.</p>
    );
  } else if (sel.kind === 'room') {
    const r = LEAD_ROOMS.find((x) => x.stage === sel.id);
    const n = data.leads?.filter((l) => l.stage === sel.id).length ?? 0;
    title = `Prospects ${r?.label ?? ''}`;
    route = '/ventes';
    body = <p className="text-[13px] text-cacao-700/70">{n} prospect(s) dans cette pièce.</p>;
  }

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" aria-label="Fermer" onClick={() => select(null)}>
          <X className="size-4 text-cacao-700/50" />
        </button>
      </div>
      <div className="mt-1.5">{body}</div>
      {route && (
        <Link href={route} className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-cacao-900 px-3 py-2 text-[13px] font-medium text-white">
          Ouvrir dans le bureau <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
