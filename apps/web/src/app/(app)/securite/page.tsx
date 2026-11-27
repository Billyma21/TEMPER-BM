'use client';

/**
 * Sessions, application d authentification, clés de sécurité.
 * MAAYOUD
 */
import { startRegistration } from '@simplewebauthn/browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { Field, TextInput } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { ApiError, api } from '@/lib/api';

interface SessionRow {
  id: string;
  ip: string | null;
  userAgent: string | null;
  current: boolean;
  lastSeenAt: string;
}

interface KeyRow {
  id: string;
  name: string;
  createdAt: string;
}

export default function SecurityPage() {
  const t = useTranslations('security');
  const toast = useToast();
  const qc = useQueryClient();
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState<string[] | null>(null);
  const sessions = useQuery({ queryKey: ['sessions'], queryFn: () => api<{ items: SessionRow[] }>('/auth/sessions') });
  const keys = useQuery({ queryKey: ['webauthn'], queryFn: () => api<{ items: KeyRow[] }>('/auth/webauthn') });

  function fail(error: unknown) {
    toast(error instanceof ApiError ? (error.body?.message ?? error.message) : (error as Error).message);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-cacao-700/60">{t('intro')}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{t('sessions')}</h2>
        {(sessions.data?.items ?? []).length === 0 ? (
          <Empty title={t('emptySessions')} />
        ) : (
          <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
            {sessions.data?.items.map((session) => (
              <li key={session.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{session.userAgent ?? session.ip ?? session.id}</div>
                  {session.current && <div className="text-xs text-lavande-600">{t('current')}</div>}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    void api(`/auth/sessions/${session.id}/revoke`, { method: 'POST' })
                      .then(() => qc.invalidateQueries({ queryKey: ['sessions'] }))
                      .catch(fail);
                  }}
                >
                  {t('revoke')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">{t('enroll')}</h2>
        {!qr && (
          <Button
            onClick={() => {
              void api<{ secret: string; qrSvg: string }>('/auth/mfa/enroll', { method: 'POST' })
                .then((res) => {
                  setSecret(res.secret);
                  setQr(res.qrSvg);
                })
                .catch(fail);
            }}
          >
            {t('enroll')}
          </Button>
        )}
        {qr && (
          <div className="space-y-3">
            <img alt="" className="size-48" src={`data:image/svg+xml;utf8,${encodeURIComponent(qr)}`} />
            <p className="text-xs text-cacao-700/60">
              {t('secret')} : <span className="font-mono">{secret}</span>
            </p>
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void api<{ backupCodes: string[] }>('/auth/mfa/confirm', { method: 'POST', body: JSON.stringify({ code }) })
                  .then((res) => {
                    setBackup(res.backupCodes);
                    setQr(null);
                  })
                  .catch(fail);
              }}
            >
              <Field label={t('confirm')}>
                <TextInput value={code} inputMode="numeric" autoComplete="one-time-code" onChange={(event) => setCode(event.target.value)} />
              </Field>
              <Button type="submit">{t('confirm')}</Button>
            </form>
          </div>
        )}
        {backup && (
          <div>
            <p className="text-sm">{t('backup')}</p>
            <ul className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm">
              {backup.map((value) => (
                <li key={value} className="rounded-lg bg-surface px-2 py-1">
                  {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t('keys')}</h2>
          <Button
            variant="secondary"
            onClick={() => {
              void api<Record<string, unknown>>('/auth/webauthn/register/options', { method: 'POST' })
                .then((options) => startRegistration({ optionsJSON: options as never }))
                .then((attestation) => api('/auth/webauthn/register/verify', { method: 'POST', body: JSON.stringify(attestation) }))
                .then(() => qc.invalidateQueries({ queryKey: ['webauthn'] }))
                .catch(fail);
            }}
          >
            {t('addKey')}
          </Button>
        </div>
        {(keys.data?.items ?? []).length === 0 ? (
          <Empty title={t('emptyKeys')} />
        ) : (
          <ul className="divide-y divide-black/5 rounded-2xl bg-white px-4 shadow-sm">
            {keys.data?.items.map((key) => (
              <li key={key.id} className="flex items-center justify-between py-3 text-sm">
                <span>{key.name}</span>
                <Button
                  variant="ghost"
                  onClick={() => {
                    void api(`/auth/webauthn/${key.id}`, { method: 'DELETE' })
                      .then(() => qc.invalidateQueries({ queryKey: ['webauthn'] }))
                      .catch(fail);
                  }}
                >
                  {t('remove')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
