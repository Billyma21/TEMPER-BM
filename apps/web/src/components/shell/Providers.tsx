'use client';

/**
 * Fournisseurs : requêtes, langue, annonces.
 * MAAYOUD
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { createContext, useContext, useEffect, useState } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { type Locale, MESSAGES, localeTag, readLocale, writeLocale } from '@/i18n/messages';

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({
  locale: 'fr',
  setLocale: () => undefined,
});

export function useLocaleSwitch() {
  return useContext(LocaleContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 15_000 } },
      }),
  );
  const [locale, setLocaleState] = useState<Locale>('fr');
  useEffect(() => {
    const next = readLocale();
    setLocaleState(next);
    document.documentElement.lang = localeTag(next);
  }, []);
  const setLocale = (next: Locale) => {
    writeLocale(next);
    document.documentElement.lang = localeTag(next);
    setLocaleState(next);
  };
  return (
    <QueryClientProvider client={client}>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Europe/Brussels">
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </LocaleContext.Provider>
    </QueryClientProvider>
  );
}
