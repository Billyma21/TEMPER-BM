'use client';

/**
 * Connexion : e-mail + mot de passe, puis second facteur si le compte l'exige.
 * MAAYOUD
 */
import { LoginSchema } from '@temper/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, DEMO, DEMO_PROFILES, type DemoProfile, api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(form: FormData) {
    setError(null);
    setPending(true);
    try {
      if (step === 'credentials') {
        const parsed = LoginSchema.safeParse({ email: form.get('email'), password: form.get('password') });
        if (!parsed.success) throw new Error('Adresse e-mail ou mot de passe invalide');
        const res = await api<{ mfaRequired: boolean }>('/auth/login', { method: 'POST', body: JSON.stringify(parsed.data) });
        if (res.mfaRequired) {
          setStep('mfa');
          return;
        }
      } else {
        await api('/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ code: form.get('code') }) });
      }
      await qc.invalidateQueries();
      router.replace('/');
    } catch (e) {
      setError(e instanceof ApiError && e.status === 429 ? 'Trop de tentatives. Réessayez dans une minute.' : e instanceof ApiError ? 'Identifiants invalides' : (e as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-cacao-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-or-500 font-bold text-cacao-950">T</span>
          <span className="font-semibold tracking-wide">TEMPER</span>
        </div>
        <div>
          <h1 className="text-4xl leading-tight font-semibold">
            Toute la chocolaterie,
            <br />
            <span className="serif-accent text-or-400">en un coup d oeil.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-cacao-100/70">Personnel, badges, production, qualité, stocks, ventes : un seul système, en mode bureau ou en mode monde.</p>
        </div>
        <p className="text-xs text-cacao-100/40">Maison Aurum Chocolatier · MAAYOUD</p>
      </div>
      <div className="grid place-items-center p-6">
        <form action={submit} className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-semibold">{step === 'credentials' ? 'Connexion' : 'Double authentification'}</h2>
          {DEMO && step === 'credentials' ? (
            <div className="space-y-2">
              <p className="text-sm text-cacao-700/70">Mode démonstration : choisissez un profil pour voir l interface avec ses droits.</p>
              {(Object.keys(DEMO_PROFILES) as DemoProfile[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    localStorage.setItem('temper.demo.profile', k);
                    window.location.href = '/';
                  }}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-medium hover:border-lavande-500"
                >
                  {DEMO_PROFILES[k].label}
                </button>
              ))}
            </div>
          ) : step === 'credentials' ? (
            <>
              <label className="block text-sm">
                <span className="font-medium">Adresse e-mail professionnelle</span>
                <input name="email" type="email" autoComplete="username" required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-lavande-500" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Mot de passe</span>
                <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-lavande-500" />
              </label>
            </>
          ) : (
            <label className="block text-sm">
              <span className="font-medium">Code à 6 chiffres de votre application d authentification</span>
              <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-center text-xl tracking-[0.4em] outline-none focus:border-lavande-500" />
            </label>
          )}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          {!(DEMO && step === 'credentials') && (
            <button disabled={pending} className="w-full rounded-xl bg-cacao-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? 'Vérification' : step === 'credentials' ? 'Se connecter' : 'Valider'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
