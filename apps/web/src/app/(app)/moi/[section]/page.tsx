'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const TITLES: Record<string, string> = {
  conges: 'Mes congés',
  paie: 'Mes fiches de paie',
  formations: 'Mes formations',
  planning: 'Mon planning',
  pointages: 'Mes pointages',
  outils: 'Mes outils empruntés',
  frais: 'Mes notes de frais',
  signaler: 'Signaler un incident ou une situation dangereuse',
  donnees: 'Mes données personnelles',
};

/** Libre-service : écrans à implémenter (voir docs/modules/00-libre-service.md). */
export default function SelfServicePage() {
  const { section } = useParams<{ section: string }>();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-lavande-600">
        Mon espace
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{TITLES[section] ?? 'Mon espace'}</h1>
      <p className="mt-2 text-sm text-cacao-700/60">Écran en cours de construction.</p>
    </div>
  );
}
