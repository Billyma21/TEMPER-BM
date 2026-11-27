/**
 * Règle des quatre yeux, sans base.
 * MAAYOUD
 */
import { describe, expect, it } from 'vitest';
import { mayDecide, stepRoles } from '../src/approvals/decision.js';

describe('Décision de validation', () => {
  const steps = [['MANAGER_EQUIPE', 'CHEF_EQUIPE'], ['DRH']];

  it('lit les rôles de l étape courante', () => {
    expect(stepRoles(steps, 0)).toEqual(['MANAGER_EQUIPE', 'CHEF_EQUIPE']);
    expect(stepRoles(steps, 3)).toEqual([]);
  });

  it('refuse l auteur même s il a le rôle', () => {
    expect(
      mayDecide({
        roles: ['MANAGER_EQUIPE'],
        steps,
        currentStep: 0,
        requesterUserId: 'moi',
        userId: 'moi',
        fourEyes: true,
      }),
    ).toBe(false);
  });

  it('accepte un rôle de l étape, pas un rôle d une autre', () => {
    expect(mayDecide({ roles: ['CHEF_EQUIPE'], steps, currentStep: 0, requesterUserId: 'auteur', userId: 'chef', fourEyes: true })).toBe(true);
    expect(mayDecide({ roles: ['DRH'], steps, currentStep: 0, requesterUserId: 'auteur', userId: 'rh', fourEyes: true })).toBe(false);
  });
});
