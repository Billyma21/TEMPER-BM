'use client';

/**
 * Entrée d un module : uniquement les ressources que la personne peut lire.
 * MAAYOUD
 */
import { MODULES, type ModuleKey, SUBJECTS } from '@temper/permissions';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ModuleIcon } from '@/components/ui/Icon';
import { pluralKebab, subjectsOf } from '@/lib/resources';
import { useSession } from '@/lib/session';

export default function ModulePage() {
  const t = useTranslations('resource');
  const desk = useTranslations('desk');
  const time = useTranslations('time');
  const prod = useTranslations('production');
  const { module } = useParams<{ module: string }>();
  const { me, ability } = useSession();
  const key = (Object.keys(MODULES) as ModuleKey[]).find((item) => MODULES[item].route === `/${module}`);
  const allowed = key && me.modules.some((item) => item.key === key);

  if (!key || !allowed) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <Lock className="mx-auto mb-3 size-8 text-cacao-700/40" />
          <h1 className="text-lg font-semibold">{t('denied')}</h1>
          <p className="mt-1 text-sm text-cacao-700/60">{t('deniedHint')}</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-lavande-600">
            {t('back')}
          </Link>
        </div>
      </div>
    );
  }

  const mod = MODULES[key];
  const subjects = subjectsOf(key).filter((subject) => ability.can('read', subject));

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Link key={subject} href={`${mod.route}/${pluralKebab(subject)}`} className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
            <h2 className="text-sm font-semibold">{SUBJECTS[subject].label}</h2>
            <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
          </Link>
        ))}
        {module === 'organisation' && (
          <Link href="/organisation/organigramme" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
            <h2 className="text-sm font-semibold">{desk('chart')}</h2>
            <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
          </Link>
        )}
        {module === 'temps' && (
          <>
            <Link href="/temps/planning" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{time('planning')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
            <Link href="/temps/journee" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{time('day')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
            <Link href="/temps/releves" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{time('sheets')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
            <Link href="/temps/feries" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{time('holidays')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
          </>
        )}
        {module === 'production' && (
          <>
            <Link href="/production/tablette" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{prod('tablet')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
            <Link href="/production/tracabilite" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{prod('trace')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
          </>
        )}
        {module === 'acces' && (
          <>
            <Link href="/acces/evacuation" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{desk('evacuation')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
            <Link href="/acces/visiteurs" className="rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-lavande-300">
              <h2 className="text-sm font-semibold">{desk('visitors')}</h2>
              <p className="mt-2 text-xs font-medium text-lavande-600">{t('open')}</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
