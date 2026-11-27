'use client';

/**
 * Borne de pointage (tablette murale, mode kiosque).
 * - Lecteur NFC en émulation clavier : l'UID arrive comme une frappe suivie d'Entrée.
 * - Secours : matricule + PIN.
 * - Hors ligne : les scans sont mis en file (localStorage) avec un clientEventId et rejoués,
 *   l'API garantit l'idempotence. Aucune donnée personnelle n'est conservée sur la borne.
 * MAAYOUD
 */
import type { KioskScanResult } from '@temper/shared';
import { clsx } from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

const QUEUE_KEY = 'temper.kiosk.queue';
const CRED_KEY = 'temper.kiosk.credential';

type Pending = { badgeUid?: string; employeeNumber?: string; pin?: string; clientEventId: string; at: string };

async function send(cred: string, body: Pending): Promise<KioskScanResult> {
  const res = await fetch('/api/v1/time/kiosk/scan', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Device ${cred}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

const readQueue = (): Pending[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export default function KioskPage() {
  const [cred, setCred] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [result, setResult] = useState<KioskScanResult | null>(null);
  const [offline, setOffline] = useState(0);
  const buffer = useRef('');

  useEffect(() => {
    setCred(localStorage.getItem(CRED_KEY));
    setOffline(readQueue().length);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const flush = useCallback(async () => {
    if (!cred) return;
    const q = readQueue();
    const left: Pending[] = [];
    for (const p of q) {
      try {
        await send(cred, p);
      } catch {
        left.push(p);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(left));
    setOffline(left.length);
  }, [cred]);

  useEffect(() => {
    const t = setInterval(flush, 20_000);
    window.addEventListener('online', flush);
    return () => {
      clearInterval(t);
      window.removeEventListener('online', flush);
    };
  }, [flush]);

  const scan = useCallback(
    async (input: Omit<Pending, 'clientEventId' | 'at'>) => {
      if (!cred) return;
      const p: Pending = { ...input, clientEventId: crypto.randomUUID(), at: new Date().toISOString() };
      try {
        setResult(await send(cred, p));
      } catch {
        localStorage.setItem(QUEUE_KEY, JSON.stringify([...readQueue(), p]));
        setOffline(readQueue().length);
        setResult({ ok: true, message: 'Pointage enregistré (hors connexion), il sera transmis automatiquement.', warnings: [] });
      }
      setTimeout(() => setResult(null), 4000);
    },
    [cred],
  );

  // Lecteur de badge en émulation clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Enter') {
        const uid = buffer.current.trim();
        buffer.current = '';
        if (uid.length >= 4) void scan({ badgeUid: uid });
      } else if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scan]);

  if (!cred) {
    return (
      <main className="grid min-h-dvh place-items-center bg-cacao-950 p-6 text-white">
        <form
          className="w-full max-w-md space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const v = new FormData(e.currentTarget).get('cred') as string;
            localStorage.setItem(CRED_KEY, v.trim());
            setCred(v.trim());
          }}
        >
          <h1 className="text-xl font-semibold">Installation de la borne</h1>
          <p className="text-sm text-white/60">Collez l identifiant d appareil généré par l administrateur (Administration, Appareils).</p>
          <input name="cred" required className="w-full rounded-xl bg-white/10 px-3 py-3 font-mono text-sm" />
          <button className="w-full rounded-xl bg-or-500 py-3 font-semibold text-cacao-950">Activer</button>
        </form>
      </main>
    );
  }

  return (
    <main
      className={clsx(
        'flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-white transition-colors',
        !result && 'bg-cacao-950',
        result?.ok && 'bg-[#127a52]',
        result && !result.ok && 'bg-[#a12a2e]',
      )}
    >
      <div className="text-center">
        <div className="text-7xl font-semibold tabular-nums">{now.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="mt-2 text-lg text-white/60">{now.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>
      {result ? (
        <div className="max-w-xl text-center" role="status" aria-live="assertive">
          <div className="text-3xl font-semibold">{result.message}</div>
          {result.warnings.map((w) => (
            <p key={w} className="mt-3 rounded-xl bg-black/20 px-4 py-2 text-base">
              {w}
            </p>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-5 grid size-28 place-items-center rounded-full border-4 border-or-500/70 text-or-400">
            <span className="text-4xl">◉</span>
          </div>
          <div className="text-2xl font-medium">Présentez votre badge</div>
          <PinFallback onSubmit={(employeeNumber, pin) => scan({ employeeNumber, pin })} />
        </div>
      )}
      {offline > 0 && <div className="absolute bottom-4 rounded-full bg-black/30 px-4 py-1.5 text-sm">{offline} pointage(s) en attente de transmission</div>}
    </main>
  );
}

function PinFallback({ onSubmit }: { onSubmit: (employeeNumber: string, pin: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-6 text-sm text-white/60 underline">
        Badge oublié ? Pointer avec mon matricule
      </button>
    );
  return (
    <form
      className="mx-auto mt-6 flex max-w-xs flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSubmit(String(f.get('num')), String(f.get('pin')));
        setOpen(false);
      }}
    >
      <input name="num" placeholder="Matricule" required className="rounded-xl bg-white/10 px-3 py-3 text-center" />
      <input name="pin" placeholder="Code PIN" inputMode="numeric" type="password" required className="rounded-xl bg-white/10 px-3 py-3 text-center tracking-widest" />
      <button className="rounded-xl bg-or-500 py-3 font-semibold text-cacao-950">Pointer</button>
    </form>
  );
}
