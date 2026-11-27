'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { WorldBuilding, WorldMachine } from '@temper/shared';
import { Lock } from 'lucide-react';
import { useRef } from 'react';
import type { MeshStandardMaterial } from 'three';
import { MACHINE_STATUS, WORLD } from './palette';
import { useWorldUi } from './store';

/** Hall de production "maison de poupée" : murs bas, sans toit, machines et équipes visibles. */
export function Hall({ b, machines }: { b: WorldBuilding; machines: WorldMachine[] }) {
  const select = useWorldUi((s) => s.select);
  const showLabels = useWorldUi((s) => s.showLabels);
  const wallH = 1.7;
  const t = 0.3;
  const walls: Array<[number, number, number, number]> = [
    [0, -b.depth / 2, b.width, t],
    [0, b.depth / 2, b.width, t],
    [-b.width / 2, 0, t, b.depth],
    [b.width / 2, 0, t, b.depth],
  ];
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh
        receiveShadow
        position-y={0.06}
        onClick={(e) => {
          e.stopPropagation();
          select({ kind: 'building', id: b.id });
        }}
      >
        <boxGeometry args={[b.width, 0.12, b.depth]} />
        <meshStandardMaterial color={b.locked ? WORLD.locked : (b.color ?? WORLD.floorRoom)} />
      </mesh>
      {walls.map(([x, z, w, d], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, wallH / 2, z]}>
          <boxGeometry args={[w, wallH, d]} />
          <meshStandardMaterial color={b.locked ? WORLD.locked : '#d9d3f7'} />
        </mesh>
      ))}
      {!b.locked && machines.map((m) => <Machine key={m.id} m={m} origin={[b.x, b.z]} />)}
      {showLabels && (
        <Html position={[0, 4.2, -b.depth / 2]} center zIndexRange={[30, 0]}>
          <div className="world-tag flex items-center gap-1" style={{ background: 'white', color: '#2b1a12' }}>
            {b.locked && <Lock size={11} />}
            {b.name}
            {!b.locked && b.occupancy > 0 && <span style={{ color: '#6f62e8' }}>· {b.occupancy}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

function Machine({ m, origin }: { m: WorldMachine; origin: [number, number] }) {
  const lamp = useRef<MeshStandardMaterial>(null);
  const select = useWorldUi((s) => s.select);
  const status = MACHINE_STATUS[m.status];
  useFrame(({ clock }) => {
    if (!lamp.current) return;
    const t = clock.getElapsedTime();
    lamp.current.emissiveIntensity = status.blink ? (Math.sin(t * 8) > 0 ? 2.2 : 0.2) : 0.9 + Math.sin(t * 2) * 0.2;
  });
  return (
    <group
      position={[m.x - origin[0], 0, m.z - origin[1]]}
      onClick={(e) => {
        e.stopPropagation();
        select({ kind: 'machine', id: m.id });
      }}
    >
      <mesh castShadow receiveShadow position-y={0.75}>
        <boxGeometry args={[2.6, 1.3, 1.8]} />
        <meshStandardMaterial color="#f1f2f8" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.42, 0.92]}>
        <boxGeometry args={[2.2, 0.08, 0.04]} />
        <meshStandardMaterial color="#c9a227" />
      </mesh>
      <mesh position={[0.95, 1.65, 0.55]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial ref={lamp} color={status.color} emissive={status.color} emissiveIntensity={1} />
      </mesh>
      {m.status === 'BREAKDOWN' && (
        <Html position={[0, 3, 0]} center zIndexRange={[40, 0]}>
          <div className="world-tag" style={{ background: '#e5484d', color: 'white' }}>
            {m.code} en panne
          </div>
        </Html>
      )}
    </group>
  );
}
