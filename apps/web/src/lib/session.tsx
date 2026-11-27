'use client';

/**
 * Session et droits côté client. Le front masque ce qui n'est pas permis,
 * mais l'API reste l'unique autorité : chaque appel est revérifié côté serveur.
 * MAAYOUD
 */
import { type AppAbility, type RawRule, createAppAbility } from '@temper/permissions';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';
import { ApiError, type MeResponse, api } from './api';

interface SessionValue {
  me: MeResponse;
  ability: AppAbility;
}

const SessionContext = createContext<SessionValue | null>(null);

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<MeResponse>('/auth/me'),
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    staleTime: 60_000,
  });
}

export function SessionProvider({ me, children }: { me: MeResponse; children: React.ReactNode }) {
  const ability = useMemo(() => createAppAbility(me.rules as RawRule[]), [me.rules]);
  return <SessionContext.Provider value={{ me, ability }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(SessionContext);
  if (!v) throw new Error('useSession hors SessionProvider');
  return v;
}
