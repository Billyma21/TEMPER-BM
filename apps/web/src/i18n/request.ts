/**
 * Langue côté serveur : cookie temper_locale, français sinon.
 * MAAYOUD
 */
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { MESSAGES, type Locale } from './messages';

export default getRequestConfig(async () => {
  const jar = await cookies();
  const raw = jar.get('temper_locale')?.value;
  const locale: Locale = raw === 'nl' || raw === 'en' ? raw : 'fr';
  return { locale, messages: MESSAGES[locale], timeZone: 'Europe/Brussels' };
});
