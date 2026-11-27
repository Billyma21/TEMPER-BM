'use client';

import type { WorldQuest } from '@temper/shared';
import { clsx } from 'clsx';
import { Check, Sparkles } from 'lucide-react';

export function QuestCard({ firstName, quests, compact = false }: { firstName: string; quests: WorldQuest[]; compact?: boolean }) {
  const todo = quests.filter((q) => q.status !== 'COMPLETED').length;
  return (
    <section className={clsx('rounded-2xl bg-white shadow-[0_8px_30px_rgb(30_20_60/0.08)]', compact ? 'p-3' : 'p-5')}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Bonjour {firstName}</h2>
          <p className="text-[11px] text-cacao-700/60">{new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">{todo} à faire</span>
      </header>
      {quests.length === 0 && <p className="text-sm text-cacao-700/60">Aucune quête aujourd hui.</p>}
      <ul className="space-y-2">
        {quests.map((q) => {
          const done = q.status === 'COMPLETED';
          const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100));
          return (
            <li key={q.id} className={clsx('rounded-xl border p-2.5', done ? 'border-ok/30 bg-ok/5' : 'border-black/5')}>
              <div className="flex items-center gap-2">
                <span className={clsx('grid size-5 shrink-0 place-items-center rounded-md', done ? 'bg-ok text-white' : 'border border-black/15')}>{done && <Check className="size-3.5" />}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{q.title}</span>
                <span className="flex items-center gap-1 rounded-full bg-lavande-100 px-2 py-0.5 text-[11px] font-semibold text-lavande-600">
                  <Sparkles className="size-3" />+{q.xp} XP
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                  <div className={clsx('h-full rounded-full', done ? 'bg-ok' : 'bg-lavande-500')} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-cacao-700/60">
                  {q.progress}/{q.target}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
