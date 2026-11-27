'use client';

import { Html } from '@react-three/drei';
import type { AvatarOutfit, WorldLead } from '@temper/shared';
import { Avatar } from './Avatar';
import { LEAD_ROOMS, WORLD } from './palette';
import { useWorldUi } from './store';

export const SALES_OFFICE = { x: -52, z: -6, width: 36, depth: 24 };

interface RoomLayout {
  stage: (typeof LEAD_ROOMS)[number]['stage'];
  label: string;
  color: string;
  x: number;
  z: number;
  w: number;
  d: number;
}

/** Plan du bureau : grande salle "à appeler", puis une pièce par étape du parcours prospect. */
function layout(): RoomLayout[] {
  const { width: W, depth: D } = SALES_OFFICE;
  const rows: Array<[number, number, number]> = [
    // [index dans LEAD_ROOMS, largeur relative, rangée]
    [0, 2, 0],
    [1, 1, 0],
    [2, 1, 0],
    [3, 1, 1],
    [4, 1, 1],
    [5, 1, 1],
    [6, 1, 1],
  ];
  const out: RoomLayout[] = [];
  for (const row of [0, 1]) {
    const items = rows.filter((r) => r[2] === row);
    const total = items.reduce((s, r) => s + r[1], 0);
    let cursor = -W / 2;
    for (const [idx, rel] of items) {
      const w = (W * rel) / total;
      const room = LEAD_ROOMS[idx]!;
      out.push({ ...room, x: cursor + w / 2, z: row === 0 ? -D / 4 : D / 4, w, d: D / 2 });
      cursor += w;
    }
  }
  return out;
}

const ROOMS = layout();

/** Le bureau commercial : chaque prospect est un personnage dans la pièce de son étape. */
export function SalesOffice({ leads, me }: { leads: WorldLead[]; me: { name: string; outfit: AvatarOutfit } | null }) {
  const select = useWorldUi((s) => s.select);
  const showLabels = useWorldUi((s) => s.showLabels);
  const wallH = 1.2;
  return (
    <group position={[SALES_OFFICE.x, 0, SALES_OFFICE.z]}>
      <mesh receiveShadow position-y={0.06}>
        <boxGeometry args={[SALES_OFFICE.width + 0.6, 0.12, SALES_OFFICE.depth + 0.6]} />
        <meshStandardMaterial color="#e6e3fb" />
      </mesh>
      {ROOMS.map((r) => {
        const inRoom = leads.filter((l) => l.stage === r.stage);
        const cols = Math.max(1, Math.floor((r.w - 1.6) / 1.3));
        return (
          <group key={r.stage} position={[r.x, 0, r.z]}>
            <mesh
              receiveShadow
              position-y={0.14}
              onClick={(e) => {
                e.stopPropagation();
                select({ kind: 'room', id: r.stage });
              }}
            >
              <boxGeometry args={[r.w - 0.3, 0.05, r.d - 0.3]} />
              <meshStandardMaterial color={WORLD.floorRoom} />
            </mesh>
            {/* Cloisons */}
            <mesh castShadow position={[-r.w / 2 + 0.08, wallH / 2, 0]}>
              <boxGeometry args={[0.16, wallH, r.d]} />
              <meshStandardMaterial color={WORLD.wall} />
            </mesh>
            <mesh castShadow position={[0, wallH / 2, -r.d / 2 + 0.08]}>
              <boxGeometry args={[r.w, wallH, 0.16]} />
              <meshStandardMaterial color={WORLD.wall} />
            </mesh>
            <mesh position={[0, 0.18, r.d / 2 - 0.5]}>
              <boxGeometry args={[r.w - 1, 0.05, 0.25]} />
              <meshStandardMaterial color={r.color} />
            </mesh>
            {inRoom.slice(0, cols * 6).map((l, i) => {
              const cx = (i % cols) - (cols - 1) / 2;
              const cz = Math.floor(i / cols);
              return <Avatar key={l.id} id={l.id} position={[cx * 1.3, 0.15, -r.d / 2 + 1.6 + cz * 1.4]} outfit="visiteur" scale={0.85} muted={!l.mine} showLabel={false} />;
            })}
            {showLabels && (
              <Html position={[0, 2.2, 0]} center zIndexRange={[30, 0]}>
                <div className="world-tag" style={{ background: 'white', color: '#2b1a12', borderLeft: `3px solid ${r.color}` }}>
                  {inRoom.length} · {r.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
      {me && <Avatar id="me-sales" position={[ROOMS[0]!.x + 3, 0.15, ROOMS[0]!.z + 3]} outfit={me.outfit} label={me.name} isMe scale={1.3} />}
      {showLabels && (
        <Html position={[0, 1.5, SALES_OFFICE.depth / 2 + 2]} center zIndexRange={[30, 0]}>
          <div className="world-tag" style={{ background: '#2b1a12', color: 'white' }}>
            Bureau commercial
          </div>
        </Html>
      )}
    </group>
  );
}

export function roomOf(stage: string) {
  return ROOMS.find((r) => r.stage === stage);
}
