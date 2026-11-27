'use client';

/**
 * Liste nominative d évacuation, avec une copie chiffrée sur l appareil d accueil.
 * MAAYOUD
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/ui/Empty';
import { ApiError, api } from '@/lib/api';

interface Roll {
  generatedAt: string;
  muster: string;
  zones: Array<{ zoneId: string; code: string; name: string; people: Array<{ name: string; kind: string }> }>;
}

const SEAL = 'temper.evac.seal';
const KEY = 'temper.evac.key';

async function localKey() {
  const existing = localStorage.getItem(KEY);
  if (existing) {
    const raw = Uint8Array.from(atob(existing), (char) => char.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  const raw = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(KEY, btoa(String.fromCharCode(...raw)));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function seal(plain: string) {
  const key = await localKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain));
  const blob = { iv: btoa(String.fromCharCode(...iv)), data: btoa(String.fromCharCode(...new Uint8Array(data))) };
  localStorage.setItem(SEAL, JSON.stringify(blob));
}

async function unseal(): Promise<Roll | null> {
  const raw = localStorage.getItem(SEAL);
  if (!raw) return null;
  try {
    const blob = JSON.parse(raw) as { iv: string; data: string };
    const key = await localKey();
    const iv = Uint8Array.from(atob(blob.iv), (char) => char.charCodeAt(0));
    const data = Uint8Array.from(atob(blob.data), (char) => char.charCodeAt(0));
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(plain)) as Roll;
  } catch {
    return null;
  }
}

export function EvacuationBoard() {
  const t = useTranslations('desk');
  const [local, setLocal] = useState(false);
  const roll = useQuery({
    queryKey: ['evacuation'],
    queryFn: () => api<Roll>('/access/evacuation'),
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (!roll.data) return;
    setLocal(false);
    void seal(JSON.stringify(roll.data));
  }, [roll.data]);

  useEffect(() => {
    if (!roll.isError) return;
    void unseal().then((copy) => {
      if (copy) {
        setLocal(true);
      }
    });
  }, [roll.isError]);

  const [copy, setCopy] = useState<Roll | null>(null);
  useEffect(() => {
    if (!roll.isError) return;
    void unseal().then(setCopy);
  }, [roll.isError]);

  const data = roll.data ?? copy;
  const denied = roll.error instanceof ApiError && roll.error.status === 403;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">{t('evacuation')}</h1>
        {data?.muster && <p className="text-sm text-cacao-800">{t('muster')} : {data.muster}</p>}
        {local && <p className="text-sm text-cacao-800">{t('localCopy')}</p>}
      </header>
      {denied || !data || data.zones.length === 0 ? (
        <Empty title={denied ? t('evacuationEmpty') : t('evacuationEmpty')} />
      ) : (
        data.zones.map((zone) => (
          <section key={zone.zoneId} className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">{zone.name}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {zone.people.map((person) => (
                <li key={`${zone.zoneId}-${person.name}`}>{person.name}</li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
