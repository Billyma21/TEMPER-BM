/**
 * TOTP (RFC 6238) sans dépendance : secrets base32, pas de 30 s, 6 chiffres, fenêtre +/- 1 pas.
 * MAAYOUD
 */
import { createHmac, randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of clean) {
    const idx = ALPHABET.indexOf(c);
    if (idx < 0) throw new Error('Secret base32 invalide');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

export function hotp(secret: Buffer, counter: number, digits = 6, algo: 'sha1' | 'sha256' = 'sha1'): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac(algo, secret).update(buf).digest();
  const offset = h[h.length - 1]! & 0x0f;
  const code = ((h[offset]! & 0x7f) << 24) | (h[offset + 1]! << 16) | (h[offset + 2]! << 8) | h[offset + 3]!;
  return String(code % 10 ** digits).padStart(digits, '0');
}

export function totp(secretBase32: string, at = Date.now(), step = 30, digits = 6): string {
  return hotp(base32Decode(secretBase32), Math.floor(at / 1000 / step), digits);
}

export function verifyTotp(secretBase32: string, code: string, at = Date.now(), window = 1): boolean {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(at / 1000 / 30);
  for (let w = -window; w <= window; w++) {
    if (hotp(secret, counter + w) === code) return true;
  }
  return false;
}

export function otpauthUri(secretBase32: string, account: string, issuer = 'TEMPER'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&period=30&digits=6`;
}
