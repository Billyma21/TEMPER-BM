'use client';

/**
 * Coquille de l'interface classique : navigation construite à partir des droits effectifs.
 * MAAYOUD
 */
import { clsx } from 'clsx';
import { Building2, Gamepad2, Home, LogOut, Menu, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ModuleIcon } from '@/components/ui/Icon';
import { ApiError, DEMO, DEMO_PROFILES, type DemoProfile, api, demoProfile } from '@/lib/api';
import { SessionProvider, useMeQuery } from '@/lib/session';

const ROLE_LABELS: Record<string, string> = {
  EMPLOYE: 'Employé',
  OPERATEUR: 'Opérateur',
  COMMERCIAL: 'Commercial',
  DIRECTEUR_SITE: 'Directeur de site',
  DIRECTEUR_PRODUCTION: 'Directeur de production',
  MANAGER_EQUIPE: 'Manager',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, error, isLoading } = useMeQuery();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) router.replace('/connexion');
  }, [error, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (isLoading || !me) {
    return (
      <div className="grid h-dvh place-items-center text-sm text-cacao-700">
        <div className="flex items-center gap-3">
          <span className="size-2 animate-ping rounded-full bg-lavande-500" />
          Chargement de votre espace
        </div>
      </div>
    );
  }

  const name = me.user.employee?.preferredName ?? me.user.employee?.firstName ?? me.user.email;
  const isWorld = pathname.startsWith('/monde');

  const nav = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 pt-1">
        <span className="grid size-8 place-items-center rounded-lg bg-or-500 font-bold text-cacao-950">T</span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-wide text-white">TEMPER</span>
          <span className="block text-[11px] text-cacao-100/60">Maison Aurum</span>
        </span>
      </Link>
      <NavItem href="/" active={pathname === '/'} icon={<Home className="size-4" />} label="Mon espace" />
      <div className="mt-3 mb-1 px-2 text-[10px] font-semibold tracking-widest text-cacao-100/40 uppercase">Modules</div>
      {me.modules
        .filter((m) => m.key !== 'monde')
        .map((m) => (
          <NavItem key={m.key} href={m.route} active={pathname.startsWith(m.route)} icon={<ModuleIcon name={m.icon} className="size-4" />} label={m.label} />
        ))}
      <div className="mt-auto space-y-2 pt-4">
        {DEMO && <DemoSwitcher />}
        <button
          type="button"
          onClick={async () => {
            await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
            router.replace('/connexion');
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-cacao-100/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" /> Se déconnecter
        </button>
      </div>
    </nav>
  );

  return (
    <SessionProvider me={me}>
      <div className="flex h-dvh overflow-hidden">
        <aside className="hidden w-64 shrink-0 bg-cacao-900 lg:block">{nav}</aside>
        {open && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <aside className="w-72 bg-cacao-900">{nav}</aside>
            <button type="button" aria-label="Fermer le menu" className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-black/5 bg-white/80 px-4 backdrop-blur">
            <button type="button" className="lg:hidden" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="flex rounded-full bg-surface p-1 text-sm font-medium" role="tablist" aria-label="Mode d affichage">
              <Link href="/" role="tab" aria-selected={!isWorld} className={clsx('flex items-center gap-1.5 rounded-full px-3 py-1.5', !isWorld ? 'bg-white shadow-sm' : 'text-cacao-700/70')}>
                <Building2 className="size-4" /> Bureau
              </Link>
              <Link href="/monde" role="tab" aria-selected={isWorld} className={clsx('flex items-center gap-1.5 rounded-full px-3 py-1.5', isWorld ? 'bg-lavande-500 text-white shadow-sm' : 'text-cacao-700/70')}>
                <Gamepad2 className="size-4" /> Monde
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-[11px] text-cacao-700/60">{me.activeRoles.filter((r) => r !== 'EMPLOYE').map((r) => ROLE_LABELS[r] ?? r).join(', ') || 'Employé'}</div>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-lavande-100 font-semibold text-lavande-600">{name.slice(0, 1)}</span>
            </div>
          </header>
          {me.mfaPending && (
            <div className="flex items-center gap-2 bg-or-100 px-4 py-2 text-sm text-cacao-800">
              <ShieldAlert className="size-4 shrink-0" /> Certaines de vos fonctions exigent la double authentification. Activez-la dans votre profil pour y accéder.
            </div>
          )}
          <main className={clsx('min-h-0 flex-1', isWorld ? 'overflow-hidden' : 'overflow-y-auto')}>{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

function NavItem({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
        active ? 'bg-white/10 font-semibold text-white' : 'text-cacao-100/70 hover:bg-white/5 hover:text-white',
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function DemoSwitcher() {
  const [p, setP] = useState<DemoProfile>('noa');
  useEffect(() => setP(demoProfile()), []);
  return (
    <label className="block rounded-lg bg-white/5 p-2 text-[11px] text-cacao-100/70">
      Démo : voir avec les droits de
      <select
        value={p}
        onChange={(e) => {
          localStorage.setItem('temper.demo.profile', e.target.value);
          window.location.reload();
        }}
        className="mt-1 w-full rounded-md bg-cacao-800 px-2 py-1.5 text-xs text-white"
      >
        {Object.entries(DEMO_PROFILES).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
    </label>
  );
}
