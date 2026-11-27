/**
 * Génère docs/04-roles-permissions.md à partir du code (source unique de vérité).
 * Usage : pnpm docs:matrix
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ACTION_LABELS,
  APPROVAL_POLICIES,
  ASSIGNABLE_ROLES,
  MODULES,
  type ModuleKey,
  ROLES,
  ROLE_KEYS,
  type RoleKey,
  SCOPE_LABELS,
  SCOPE_LETTER,
  SCOPES,
  SOD_RULES,
  SUBJECTS,
  type Scope,
  expandRole,
} from '../src';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../../docs/04-roles-permissions.md');

const rank = (s: Scope) => SCOPES.indexOf(s);

function baseOf(role: RoleKey): RoleKey[] {
  const d = ROLES[role];
  if (d.base || d.category === 'appareil') return [];
  return [d.external || d.category === 'externe' ? 'EXTERNE' : 'EMPLOYE'];
}

/** Portée maximale de consultation par module ; "*" = uniquement certains champs (annuaire). */
function readScopeByModule(role: RoleKey): Record<ModuleKey, string> {
  const full = {} as Record<ModuleKey, Scope | undefined>;
  const limited = {} as Record<ModuleKey, Scope | undefined>;
  for (const r of [...baseOf(role), ...expandRole(role)]) {
    for (const g of ROLES[r].grants) {
      if (!g.actions.includes('read') && !g.actions.includes('manage')) continue;
      const mods: ModuleKey[] = g.subjects.includes('all')
        ? (Object.keys(MODULES) as ModuleKey[])
        : g.subjects.map((s) => SUBJECTS[s as keyof typeof SUBJECTS].module);
      const target = g.fields ? limited : full;
      for (const m of mods) {
        const cur = target[m];
        if (!cur || rank(g.scope) > rank(cur)) target[m] = g.scope;
      }
    }
  }
  const res = {} as Record<ModuleKey, string>;
  for (const m of Object.keys(MODULES) as ModuleKey[]) {
    const f = full[m];
    const l = limited[m];
    res[m] = f && (!l || rank(f) >= rank(l)) ? SCOPE_LETTER[f] : l ? `${SCOPE_LETTER[l]}*` : '';
  }
  return res;
}

const lines: string[] = [];
lines.push('# Rôles et permissions');
lines.push('');
lines.push('> Document généré automatiquement depuis `packages/permissions` (`pnpm docs:matrix`). Ne pas modifier à la main.');
lines.push('');
lines.push('## Légende des portées');
lines.push('');
for (const s of SCOPES) lines.push(`- **${SCOPE_LETTER[s]}** : ${SCOPE_LABELS[s]}`);
lines.push('');
lines.push('## Vue d ensemble : portée maximale de consultation par module');
lines.push('');
lines.push('Chaque rôle interne inclut le socle EMPLOYE (libre-service), chaque rôle externe le socle EXTERNE. Case vide : aucune donnée. P seul : libre-service "Mon espace", le module métier reste masqué. Astérisque : champs limités (annuaire, adresse de livraison).');
lines.push('');
const mods = (Object.keys(MODULES) as ModuleKey[]).sort((a, b) => MODULES[a].order - MODULES[b].order);
lines.push(`| Rôle | ${mods.map((m) => MODULES[m].short).join(' | ')} |`);
lines.push(`|---|${mods.map(() => ':-:').join('|')}|`);
for (const r of ROLE_KEYS) {
  const m = readScopeByModule(r);
  lines.push(`| ${ROLES[r].label} | ${mods.map((k) => m[k]).join(' | ')} |`);
}
lines.push('');
lines.push('## Détail par rôle');
for (const r of ROLE_KEYS) {
  const d = ROLES[r];
  lines.push('');
  lines.push(`### ${d.label} (\`${r}\`)`);
  lines.push('');
  lines.push(d.description);
  lines.push('');
  lines.push(`- Catégorie : ${d.category}${d.base ? ' (socle automatique)' : ''}${d.external ? ', externe' : ''}`);
  lines.push(`- Second facteur obligatoire : ${d.requiresMfa ? 'oui' : 'non'} ; délégable : ${d.delegable ? 'oui' : 'non'} ; session max : ${d.maxSessionMinutes / 60} h`);
  if (d.inherits?.length) lines.push(`- Hérite de : ${d.inherits.map((i) => `\`${i}\``).join(', ')}`);
  lines.push(`- Tenue dans le monde 3D : ${d.avatar}`);
  lines.push('');
  lines.push('| Actions | Ressources | Portée | Restrictions |');
  lines.push('|---|---|---|---|');
  for (const g of d.grants) {
    const subjects = g.subjects.map((s) => (s === 'all' ? 'Tout' : SUBJECTS[s as keyof typeof SUBJECTS].label)).join(', ');
    const restr = [
      g.fields ? `champs : ${g.fields.join(', ')}` : '',
      g.conditions ? `si ${JSON.stringify(g.conditions)}` : '',
    ]
      .filter(Boolean)
      .join(' ; ');
    lines.push(`| ${g.actions.map((a) => ACTION_LABELS[a]).join(', ')} | ${subjects} | ${SCOPE_LABELS[g.scope]} | ${restr} |`);
  }
}
lines.push('');
lines.push('## Séparation des tâches');
lines.push('');
lines.push('| Règle | Cumul interdit | Niveau | Risque couvert |');
lines.push('|---|---|---|---|');
for (const s of SOD_RULES) lines.push(`| ${s.id} | ${s.label} | ${s.severity === 'BLOCK' ? 'Bloquant' : 'Alerte + quatre yeux'} | ${s.rationale} |`);
lines.push('');
lines.push('## Circuits de validation par défaut');
lines.push('');
for (const [k, p] of Object.entries(APPROVAL_POLICIES)) {
  lines.push(`### ${p.label} (\`${k}\`)`);
  lines.push('');
  for (const t of p.tiers) {
    const bound = t.upTo === null ? 'au-delà' : `jusqu à ${t.upTo} ${p.unit === 'EUR' ? 'EUR' : p.unit === 'PERCENT' ? '%' : p.unit === 'DAYS' ? 'jours' : ''}`;
    const steps = t.steps.length ? t.steps.map((s, i) => `${i + 1}. ${s.map((x) => ROLES[x].label).join(' ou ')}`).join(' puis ') : 'aucune validation';
    lines.push(`- ${bound} : ${steps}`);
  }
  if (p.fourEyes) lines.push('- Contrôle quatre yeux : le demandeur ne valide jamais sa propre demande.');
  if ('note' in p && p.note) lines.push(`- Note : ${p.note}`);
  lines.push('');
}
lines.push(`Rôles attribuables : ${ASSIGNABLE_ROLES.length}. Ressources protégées : ${Object.keys(SUBJECTS).length}.`);
lines.push('');
lines.push('MAAYOUD');
lines.push('');

writeFileSync(out, lines.join('\n'));
console.log(`Écrit : ${out}`);
