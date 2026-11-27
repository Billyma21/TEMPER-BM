/**
 * Compte personnel : sessions, enrôlement TOTP, codes de secours, clés WebAuthn.
 * Le secret TOTP et la clé publique ne ressortent que le temps de l enrôlement.
 * MAAYOUD
 */
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import type { WebAuthnRegistrationInput } from '@temper/shared';
import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';
import { AuditService } from '../audit/audit.service.js';
import { encryptField, sha256 } from '../common/crypto.js';
import { decryptField } from '../common/crypto.js';
import { env } from '../config/env.js';
import { AccessService } from '../permissions/access.service.js';
import type { Principal } from '../permissions/principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { generateSecret, otpauthUri, verifyTotp } from './totp.js';

const CHALLENGE_TTL = 300;

@Injectable()
export class AccountService {
  private readonly challenges = new Map<string, { challenge: string; exp: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly access: AccessService,
    private readonly audit: AuditService,
  ) {}

  async sessions(p: Principal) {
    const rows = await this.prisma.db.session.findMany({
      where: { userId: p.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
      select: { id: true, ip: true, userAgent: true, mfaVerifiedAt: true, lastSeenAt: true, createdAt: true, expiresAt: true },
    });
    return {
      items: rows.map((row) => ({
        id: row.id,
        ip: row.ip,
        userAgent: row.userAgent,
        current: row.id === p.sessionId,
        mfaVerifiedAt: row.mfaVerifiedAt?.toISOString() ?? null,
        lastSeenAt: row.lastSeenAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
      })),
    };
  }

  async revoke(p: Principal, id: string) {
    const row = await this.prisma.db.session.findFirst({ where: { id, userId: p.id, revokedAt: null } });
    if (!row) throw new NotFoundException({ code: 'NOT_FOUND' });
    await this.prisma.db.session.update({ where: { id }, data: { revokedAt: new Date() } });
    await this.access.invalidate(p.id);
    await this.audit.log({ actorType: 'USER', actorId: p.id, action: 'revoke', subject: 'Session', subjectId: id });
    return { ok: true, current: id === p.sessionId };
  }

  async enroll(p: Principal) {
    const user = await this.prisma.db.user.findUniqueOrThrow({ where: { id: p.id } });
    if (user.mfaEnabled) throw new ConflictException({ code: 'CONFLICT', message: 'Le second facteur est déjà actif' });
    const secret = generateSecret();
    await this.prisma.db.user.update({
      where: { id: p.id },
      data: { mfaSecretEnc: encryptField(secret, env().FIELD_ENCRYPTION_KEY), mfaEnabled: false },
    });
    const uri = otpauthUri(secret, user.email);
    const qrSvg = await QRCode.toString(uri, { type: 'svg', margin: 1, width: 192, color: { dark: '#2b1a12', light: '#00000000' } });
    return { secret, uri, qrSvg };
  }

  async confirm(p: Principal, code: string) {
    const user = await this.prisma.db.user.findUniqueOrThrow({ where: { id: p.id } });
    if (!user.mfaSecretEnc) throw new UnauthorizedException({ code: 'MFA_NOT_ENROLLED' });
    const secret = decryptField(user.mfaSecretEnc, env().FIELD_ENCRYPTION_KEY);
    if (!verifyTotp(secret, code.trim())) throw new UnauthorizedException({ code: 'INVALID_MFA_CODE' });
    const backupCodes = Array.from({ length: 8 }, () => randomBytes(4).toString('hex'));
    await this.prisma.db.user.update({
      where: { id: p.id },
      data: { mfaEnabled: true, recoveryCodesHash: backupCodes.map((value) => sha256(value.toLowerCase())) },
    });
    await this.access.invalidate(p.id);
    await this.audit.log({ actorType: 'USER', actorId: p.id, action: 'enroll', subject: 'User', subjectId: p.id, reason: 'TOTP' });
    return { backupCodes };
  }

  async listKeys(p: Principal) {
    const rows = await this.prisma.db.webAuthnCredential.findMany({
      where: { userId: p.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, transports: true, createdAt: true, lastUsedAt: true },
    });
    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        transports: row.transports,
        createdAt: row.createdAt.toISOString(),
        lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
      })),
    };
  }

  async registrationOptions(p: Principal) {
    const user = await this.prisma.db.user.findUniqueOrThrow({ where: { id: p.id } });
    const existing = await this.prisma.db.webAuthnCredential.findMany({ where: { userId: p.id }, select: { credentialId: true, transports: true } });
    const rpID = new URL(env().WEB_PUBLIC_URL).hostname;
    const options = await generateRegistrationOptions({
      rpName: 'TEMPER',
      rpID,
      userName: user.email,
      userID: new TextEncoder().encode(p.id),
      userDisplayName: user.email,
      attestationType: 'none',
      excludeCredentials: existing.map((row) => ({ id: row.credentialId, transports: row.transports })),
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
    });
    this.challenges.set(p.id, { challenge: options.challenge, exp: Date.now() + CHALLENGE_TTL * 1000 });
    await this.redis.set(`temper:webauthn:${p.id}`, options.challenge, CHALLENGE_TTL);
    return options;
  }

  async registrationVerify(p: Principal, body: WebAuthnRegistrationInput) {
    const expected = await this.takeChallenge(p.id);
    if (!expected) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'La demande d enrôlement a expiré' });
    let verified = false;
    let credentialId = '';
    let publicKey: Uint8Array = new Uint8Array();
    let counter = 0;
    let transports: string[] = body.response.transports ?? [];
    try {
      const result = await verifyRegistrationResponse({
        response: { ...body, clientExtensionResults: body.clientExtensionResults ?? {} } as RegistrationResponseJSON,
        expectedChallenge: expected,
        expectedOrigin: env().WEB_PUBLIC_URL,
        expectedRPID: new URL(env().WEB_PUBLIC_URL).hostname,
        requireUserVerification: false,
      });
      verified = result.verified;
      if (result.verified && result.registrationInfo) {
        credentialId = result.registrationInfo.credential.id;
        publicKey = result.registrationInfo.credential.publicKey;
        counter = result.registrationInfo.credential.counter;
        transports = result.registrationInfo.credential.transports ?? transports;
      }
    } catch {
      verified = false;
    }
    if (!verified || !credentialId) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Attestation refusée' });
    const created = await this.prisma.db.webAuthnCredential.create({
      data: {
        userId: p.id,
        credentialId,
        publicKey: Buffer.from(publicKey),
        counter,
        transports,
        name: body.authenticatorAttachment === 'platform' ? 'Passkey de cet appareil' : 'Clé de sécurité',
      },
      select: { id: true, name: true },
    });
    await this.audit.log({ actorType: 'USER', actorId: p.id, action: 'enroll', subject: 'WebAuthnCredential', subjectId: created.id });
    return created;
  }

  async revokeKey(p: Principal, id: string) {
    const row = await this.prisma.db.webAuthnCredential.findFirst({ where: { id, userId: p.id } });
    if (!row) throw new NotFoundException({ code: 'NOT_FOUND' });
    await this.prisma.db.webAuthnCredential.delete({ where: { id } });
    await this.audit.log({ actorType: 'USER', actorId: p.id, action: 'revoke', subject: 'WebAuthnCredential', subjectId: id });
    return { ok: true };
  }

  private async takeChallenge(userId: string): Promise<string | null> {
    const local = this.challenges.get(userId);
    this.challenges.delete(userId);
    if (local && local.exp > Date.now()) return local.challenge;
    return this.redis.get(`temper:webauthn:${userId}`);
  }
}
