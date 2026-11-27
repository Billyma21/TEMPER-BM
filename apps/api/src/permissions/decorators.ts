import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Action, SubjectName } from '@temper/permissions';
import type { Principal } from './principal.js';

export const IS_PUBLIC = 'temper:public';
export const REQUIRES = 'temper:requires';
export const DEVICE_ONLY = 'temper:device-only';

/** Route accessible sans session (connexion, santé). */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Droit minimal requis sur le type de ressource (contrôle objet par objet dans le service). */
export const Requires = (action: Action, subject: SubjectName) => SetMetadata(REQUIRES, { action, subject });

/** Route réservée aux appareils (bornes, lecteurs). */
export const DeviceOnly = () => SetMetadata(DEVICE_ONLY, true);

export const CurrentPrincipal = createParamDecorator((_: unknown, ctx: ExecutionContext): Principal => {
  return ctx.switchToHttp().getRequest().principal;
});
