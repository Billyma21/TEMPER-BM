/**
 * Messages d erreur de l API, négociés sur Accept-Language (fr par défaut, puis nl et en).
 * MAAYOUD
 */
export type Lang = 'fr' | 'nl' | 'en';

const TEXT = {
  UNAUTHENTICATED: {
    fr: 'Authentification requise',
    nl: 'Authenticatie vereist',
    en: 'Authentication required',
  },
  INVALID_CREDENTIALS: {
    fr: 'Identifiants invalides',
    nl: 'Ongeldige aanmeldgegevens',
    en: 'Invalid credentials',
  },
  FORBIDDEN: {
    fr: 'Accès refusé',
    nl: 'Toegang geweigerd',
    en: 'Access denied',
  },
  MFA_REQUIRED: {
    fr: 'Second facteur requis',
    nl: 'Tweede factor vereist',
    en: 'Second factor required',
  },
  MFA_NOT_ENROLLED: {
    fr: 'Second facteur non enrôlé',
    nl: 'Tweede factor niet geregistreerd',
    en: 'Second factor is not enrolled',
  },
  INVALID_MFA_CODE: {
    fr: 'Code de second facteur invalide',
    nl: 'Ongeldige code voor de tweede factor',
    en: 'Invalid second factor code',
  },
  DEVICE_ONLY: {
    fr: 'Réservé aux appareils',
    nl: 'Voorbehouden aan apparaten',
    en: 'Devices only',
  },
  USER_ONLY: {
    fr: 'Réservé aux utilisateurs',
    nl: 'Voorbehouden aan gebruikers',
    en: 'Users only',
  },
  NOT_FOUND: {
    fr: 'Ressource introuvable',
    nl: 'Bron niet gevonden',
    en: 'Resource not found',
  },
  VALIDATION_ERROR: {
    fr: 'Données invalides',
    nl: 'Ongeldige gegevens',
    en: 'Invalid data',
  },
  BAD_FILTER: {
    fr: 'Filtre inconnu',
    nl: 'Onbekende filter',
    en: 'Unknown filter',
  },
  BAD_SORT: {
    fr: 'Tri invalide',
    nl: 'Ongeldige sortering',
    en: 'Invalid sort',
  },
  CONFLICT: {
    fr: 'Conflit avec une donnée existante',
    nl: 'Conflict met een bestaand gegeven',
    en: 'Conflict with existing data',
  },
  IMMUTABLE: {
    fr: 'Cette information est immuable : corrigez par une contre-écriture',
    nl: 'Dit gegeven is onwijzigbaar: verbeter het met een tegenboeking',
    en: 'This record is immutable: correct it with a reversing entry',
  },
  RATE_LIMITED: {
    fr: 'Trop de requêtes, réessayez dans un instant',
    nl: 'Te veel verzoeken, probeer het zo meteen opnieuw',
    en: 'Too many requests, try again shortly',
  },
  INTERNAL: {
    fr: 'Erreur interne',
    nl: 'Interne fout',
    en: 'Internal error',
  },
} as const satisfies Record<string, Record<Lang, string>>;

export type ErrorCode = keyof typeof TEXT;

export function negotiate(header?: string): Lang {
  const parts = (header ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase().split(';')[0] ?? '');
  for (const part of parts) {
    if (part.startsWith('nl')) return 'nl';
    if (part.startsWith('fr')) return 'fr';
    if (part.startsWith('en')) return 'en';
  }
  return 'fr';
}

export function message(code: string, lang: Lang): string {
  const row = TEXT[code as ErrorCode];
  return row ? row[lang] : TEXT.INTERNAL[lang];
}
