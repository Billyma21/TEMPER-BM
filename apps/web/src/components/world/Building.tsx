'use client';

import { Html } from '@react-three/drei';
import type { WorldBuilding } from '@temper/shared';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { WORLD } from './palette';
import { useWorldUi } from './store';

const FLOOR_H = 2.4;

/** Bâtiment du site : étages empilés, fenêtres, toit lavande. Verrouillé = grisé + cadenas. */
export function Building({ b }: { b: WorldBuilding }) {
  const select = useWorldUi((s) => s.select);
  const selected = useWorldUi((s) => s.selection?.kind === 'building' && s.selection.id === b.id);
  const showLabels = useWorldUi((s) => s.showLabels);
  const [hover, setHover] = useState(false);
  const floors = Math.max(1, b.floors);
  const height = floors * FLOOR_H;
  const wall = b.locked ? WORLD.locked : b.color ?? WORLD.wall;
  const lift = hover || selected ? 0.25 : 0;

  return (
    <group
      position={[b.x, lift, b.z]}
      onClick={(e) => {
        e.stopPropagation();
        select({ kind: 'building', id: b.id });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
    >
      {/* Socle */}
      <mesh receiveShadow position-y={0.05}>
        <boxGeometry args={[b.width + 1.2, 0.1, b.depth + 1.2]} />
        <meshStandardMaterial color={selected ? '#e6e2ff' : '#e4e6ef'} />
      </mesh>
      {/* Étages */}
      {Array.from({ length: floors }).map((_, i) => (
        <group key={i} position-y={0.1 + i * FLOOR_H}>
          <mesh castShadow receiveShadow position-y={FLOOR_H / 2}>
            <boxGeometry args={[b.width, FLOOR_H - 0.06, b.depth]} />
            <meshStandardMaterial color={wall} roughness={0.9} transparent={b.locked} opacity={b.locked ? 0.75 : 1} />
          </mesh>
          {!b.locked && (
            <>
              <mesh position={[0, FLOOR_H * 0.55, b.depth / 2 + 0.01]}>
                <planeGeometry args={[b.width * 0.86, 0.7]} />
                <meshStandardMaterial color={WORLD.window} />
              </mesh>
              <mesh position={[b.width / 2 + 0.01, FLOOR_H * 0.55, 0]} rotation-y={Math.PI / 2}>
                <planeGeometry args={[b.depth * 0.86, 0.7]} />
                <meshStandardMaterial color={WORLD.window} />
              </mesh>
            </>
          )}
        </group>
      ))}
      {/* Toit */}
      <mesh castShadow position-y={0.1 + height + 0.15}>
        <boxGeometry args={[b.width + 0.3, 0.3, b.depth + 0.3]} />
        <meshStandardMaterial color={b.locked ? WORLD.roofLocked : WORLD.roof} roughness={0.6} />
      </mesh>
      {showLabels && (
        <Html position={[0, height + 1.6, 0]} center zIndexRange={[30, 0]}>
          <div className="world-tag flex items-center gap-1" style={{ background: b.locked ? '#eef0f6' : 'white', color: '#2b1a12' }}>
            {b.locked && <Lock size={11} />}
            {b.name}
            {!b.locked && b.occupancy > 0 && <span style={{ color: '#6f62e8' }}>· {b.occupancy}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}
