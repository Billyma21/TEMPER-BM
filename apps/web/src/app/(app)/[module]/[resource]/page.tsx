'use client';

/**
 * Liste générique branchée sur le gabarit CRUD.
 * MAAYOUD
 */
import { MODULES, type ModuleKey } from '@temper/permissions';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { ResourceBrowser } from '@/components/bureau/ResourceBrowser';
import { EvacuationBoard } from '@/components/bureau/EvacuationBoard';
import { OrgChart } from '@/components/bureau/OrgChart';
import { DayBoard, WeekBoard } from '@/components/bureau/TimeBoards';
import { VisitorDesk } from '@/components/bureau/VisitorDesk';
import { subjectFromSegment } from '@/lib/resources';
import { useSession } from '@/lib/session';

export default function ResourcePage() {
  return (
    <Suspense fallback={null}>
      <ResourceGate />
    </Suspense>
  );
}

function ResourceGate() {
  const t = useTranslations('resource');
  const { module, resource } = useParams<{ module: string; resource: string }>();
  const { me, ability } = useSession();
  const key = (Object.keys(MODULES) as ModuleKey[]).find((item) => MODULES[item].route === `/${module}`);
  const opened = key && me.modules.some((item) => item.key === key);
  if (opened && module === 'organisation' && resource === 'organigramme') return <OrgChart />;
  if (opened && module === 'acces' && resource === 'evacuation') return <EvacuationBoard />;
  if (opened && module === 'acces' && resource === 'visiteurs') return <VisitorDesk />;
  if (opened && module === 'temps' && resource === 'planning') return <WeekBoard />;
  if (opened && module === 'temps' && resource === 'journee') return <DayBoard />;
  const subject = key ? subjectFromSegment(key, resource) : undefined;
  const allowed = key && subject && me.modules.some((item) => item.key === key) && ability.can('read', subject);

  if (!allowed || !subject) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <Lock className="mx-auto mb-3 size-8 text-cacao-700/40" />
          <h1 className="text-lg font-semibold">{t('denied')}</h1>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-lavande-600">
            {t('back')}
          </Link>
        </div>
      </div>
    );
  }

  return <ResourceBrowser subject={subject} />;
}
