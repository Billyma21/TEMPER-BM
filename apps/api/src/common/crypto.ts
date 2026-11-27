/**
 * Primitives cryptographiques centralisées. Aucun autre fichier ne manipule de secret directement.
 * MAAYOUD
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { hash, verify } from 'argon2';

/** Paramètres argon2id recommandés (OWASP) */
const ARGON = { type: 2 as const, memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const hashPassword = (plain: string) => hash(plain, ARGON);
export const verifyPassword = (hashed: string, plain: string) => verify(hashed, plain);

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** Empreinte d'UID de badge : l'UID brut n'est jamais stocké. */
export const badgeUidHash = (uid: string, pepper: string) =>
  createHmac('sha256', pepper).update(uid.trim().toUpperCase().replace(/[^0-9A-F]/g, '')).digest('hex');

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Chiffrement de champ AES-256-GCM : "v1.<iv>.<tag>.<données>" en base64url. */
export function encryptField(plain: string, keyMaterial: string): string {
  const key = createHash('sha256').update(keyMaterial).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.');
}

export function decryptField(payload: string, keyMaterial: string): string {
  const [version, iv, tag, data] = payload.split('.');
  if (version !== 'v1' || !iv || !tag || !data) throw new Error('Format chiffré invalide');
  const key = createHash('sha256').update(keyMaterial).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
}
