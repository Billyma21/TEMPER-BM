/**
 * Temps réel (Socket.IO, espace /world) : présence, état machines, progression des commandes, quêtes.
 * Salles :
 *  - site:<id>             événements agrégés (compteurs), pour tout le personnel du site
 *  - presence:site:<id>    présence nominative, si droit read WorldPresence sur le site
 *  - presence:team:<id>    présence nominative de l'équipe, si droit sur l'équipe
 *  - user:<id>             notifications et quêtes personnelles
 * MAAYOUD
 */
import { Logger } from '@nestjs/common';
import { type OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { asSubject } from '@temper/permissions';
import type { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service.js';
import { env } from '../config/env.js';

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

@WebSocketGateway({ namespace: '/world', cors: { origin: true, credentials: true } })
export class RealtimeGateway implements OnGatewayConnection {
  private readonly log = new Logger(RealtimeGateway.name);
  @WebSocketServer() server!: Server;

  constructor(private readonly auth: AuthService) {}

  async handleConnection(client: Socket) {
    const token = readCookie(client.handshake.headers.cookie, env().SESSION_COOKIE);
    const p = token ? await this.auth.authenticateSession(token) : null;
    if (!p) {
      client.disconnect(true);
      return;
    }
    const rooms = [`user:${p.id}`];
    const e = p.employee;
    if (e) {
      rooms.push(`site:${e.siteId}`);
      if (p.ability.can('read', asSubject('WorldPresence', { siteId: e.siteId, teamId: '__any__', departmentId: '__any__' }))) {
        rooms.push(`presence:site:${e.siteId}`);
      } else if (e.teamId && p.ability.can('read', asSubject('WorldPresence', { siteId: e.siteId, teamId: e.teamId, departmentId: e.departmentId }))) {
        rooms.push(`presence:team:${e.teamId}`);
      }
    }
    await client.join(rooms);
    this.log.debug(`Connexion ${p.id} : ${rooms.join(', ')}`);
  }

  toSite(siteId: string, event: string, payload: unknown) {
    this.server?.to(`site:${siteId}`).emit(event, payload);
  }

  toPresence(siteId: string, teamId: string | null, event: string, payload: unknown) {
    const rooms = [`presence:site:${siteId}`, ...(teamId ? [`presence:team:${teamId}`] : [])];
    this.server?.to(rooms).emit(event, payload);
  }

  toUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }
}
