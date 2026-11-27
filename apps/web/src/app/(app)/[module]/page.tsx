'use client';

/**
 * Page générique de module : affiche les ressources du module et les actions permises.
 * Chaque module remplace progressivement cette page par ses écrans dédiés
 * (liste filtrable, fiche détail, formulaires), voir PROMPT et docs/modules.
 * MAAYOUD
 */
import { ACTION_LABELS, type Action, MODULES, type ModuleKey, SUBJECTS, SUBJECT_NAMES } from '@temper/permissions';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ModuleIcon } from '@/components/ui/Icon';
import { useSession } from '@/lib/session';

const SHOWN: Action[] = ['read', 'create', 'update', 'approve', 'export', 'execute', 'delete'];

export default function ModulePage() {
  const { module } = useParams<{ module: string }>();
  const { me, ability } = useSession();
  const key = (Object.keys(MODULES) as ModuleKey[]).find((k) => MODULES[k].route === `/${module}`);
  const allowed = key && me.modules.some((m) => m.key === key);

  if (!key || !allowed) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <Lock className="mx-auto mb-3 size-8 text-cacao-700/40" />
          <h1 className="text-lg font-semibold">Accès non autorisé</h1>
          <p className="mt-1 text-sm text-cacao-700/60">Ce module ne fait pas partie de vos fonctions. Contactez votre responsable si nécessaire.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-lavande-600">
            Retour à mon espace
          </Link>
        </div>
      </div>
    );
  }

  const mod = MODULES[key];
  const subjects = SUBJECT_NAMES.filter((s) => SUBJECTS[s].module === key);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-cacao-900 text-or-400">
          <ModuleIcon name={mod.icon} className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{mod.label}</h1>
          <p className="text-sm text-cacao-700/60">{mod.description}</p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => {
          const actions = SHOWN.filter((a) => ability.can(a, s));
          const visible = actions.includes('read');
          return (
            <article key={s} className={visible ? 'rounded-2xl bg-white p-4 shadow-sm' : 'rounded-2xl border border-dashed border-black/10 p-4 opacity-60'}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold">{SUBJECTS[s].label}</h2>
                {!visible && <Lock className="size-3.5 shrink-0 text-cacao-700/40" />}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {actions.length ? (
                  actions.map((a) => (
                    <span key={a} className="rounded-full bg-lavande-100 px-2 py-0.5 text-[11px] font-medium text-lavande-600">
                      {ACTION_LABELS[a]}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-cacao-700/50">Aucun droit</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
