/**
 * Décision d une étape de validation : le rôle demandé, et jamais l auteur de la demande.
 * MAAYOUD
 */

export function stepRoles(steps: unknown, currentStep: number): string[] {
  if (!Array.isArray(steps)) return [];
  const step = steps[currentStep];
  if (!Array.isArray(step)) return [];
  return step.filter((role): role is string => typeof role === 'string');
}

export function mayDecide(input: {
  roles: readonly string[];
  steps: unknown;
  currentStep: number;
  requesterUserId: string;
  userId: string;
  fourEyes: boolean;
}): boolean {
  if (input.fourEyes && input.requesterUserId === input.userId) return false;
  const needed = stepRoles(input.steps, input.currentStep);
  return needed.some((role) => input.roles.includes(role));
}
