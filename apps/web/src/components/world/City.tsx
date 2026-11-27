'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { WorldCityLot } from '@temper/shared';
import { useRef } from 'react';
import type { Group } from 'three';
import { WORLD } from './palette';
import { useWorldUi } from './store';

const STYLE: Record<string, { floors: number; w: number; d: number; roof: string; wall: string }> = {
  supermarket: { floors: 2, w: 9, d: 6, roof: '#8f84f3', wall: '#ffffff' },
  warehouse: { floors: 2, w: 8, d: 7, roof: '#c8a24a', wall: '#f3e2b8' },
  hotel: { floors: 5, w: 5, d: 5, roof: '#8f84f3', wall: '#ffffff' },
  office: { floors: 4, w: 5, d: 5, roof: '#6f62e8', wall: '#eef0f7' },
  shop: { floors: 2, w: 5, d: 4, roof: '#e58fb0', wall: '#fff4ea' },
  restaurant: { floors: 1, w: 6, d: 5, roof: '#f08a5d', wall: '#fff4ea' },
};
const FLOOR_H = 2.2;

/** La ville des clients : chaque commande en cours est un chantier ; le bâtiment monte avec la progression. */
export function City({ lots }: { lots: WorldCityLot[] }) {
  return (
    <group>
      {lots.map((l) => (
        <Lot key={l.customerId} lot={l} />
      ))}
    </group>
  );
}

function Lot({ lot }: { lot: WorldCityLot }) {
  const select = useWorldUi((s) => s.select);
  const showLabels = useWorldUi((s) => s.showLabels);
  const st = STYLE[lot.style ?? 'shop'] ?? STYLE.shop!;
  const full = st.floors * FLOOR_H;
  const built = lot.delivered ? full : Math.max(0.35, (full * lot.progress) / 100);
  const building = !lot.delivered && lot.progress > 0;

  return (
    <group
      position={[lot.x, 0, lot.z]}
      onClick={(e) => {
        e.stopPropagation();
        select({ kind: 'lot', id: lot.customerId });
      }}
    >
      <mesh receiveShadow position-y={0.04}>
        <boxGeometry args={[st.w + 3, 0.08, st.d + 3]} />
        <meshStandardMaterial color={WORLD.grass} />
      </mesh>
      {lot.progress === 0 && !lot.delivered ? (
        <mesh position-y={0.12}>
          <boxGeometry args={[st.w, 0.1, st.d]} />
          <meshStandardMaterial color="#d6d9e4" wireframe />
        </mesh>
      ) : (
        <>
          <mesh castShadow receiveShadow position-y={0.08 + built / 2}>
            <boxGeometry args={[st.w, built, st.d]} />
            <meshStandardMaterial color={st.wall} transparent={building} opacity={building ? 0.92 : 1} />
          </mesh>
          {lot.delivered && (
            <mesh castShadow position-y={0.08 + built + 0.15}>
              <boxGeometry args={[st.w + 0.3, 0.3, st.d + 0.3]} />
              <meshStandardMaterial color={st.roof} />
            </mesh>
          )}
          {building && (
            <mesh position-y={0.08 + built + 0.05}>
              <boxGeometry args={[st.w + 0.2, 0.1, st.d + 0.2]} />
              <meshStandardMaterial color="#f6c453" />
            </mesh>
          )}
        </>
      )}
      {building && <Crane height={full + 3} offset={[st.w / 2 + 1.2, -st.d / 2]} />}
      {showLabels && (
        <Html position={[0, (lot.delivered ? full : built) + 2.2, 0]} center zIndexRange={[25, 0]}>
          <div className="flex flex-col items-center gap-1">
            {lot.delivered ? (
              <span className="world-tag" style={{ background: '#22a06b', color: 'white' }}>
                ✓ Livré
              </span>
            ) : lot.orderNumber ? (
              <span className="world-tag" style={{ background: '#f6c453', color: '#2b1a12' }}>
                {lot.progress} %
              </span>
            ) : null}
            <span className="world-tag" style={{ background: 'white', color: '#2b1a12', fontWeight: 500 }}>
              {lot.name}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function Crane({ height, offset }: { height: number; offset: [number, number] }) {
  const arm = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (arm.current) arm.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.9;
  });
  return (
    <group position={[offset[0], 0, offset[1]]}>
      <mesh castShadow position-y={height / 2}>
        <boxGeometry args={[0.25, height, 0.25]} />
        <meshStandardMaterial color="#f6c453" />
      </mesh>
      <group ref={arm} position-y={height}>
        <mesh castShadow position={[-2.5, 0, 0]}>
          <boxGeometry args={[6, 0.22, 0.22]} />
          <meshStandardMaterial color="#f6c453" />
        </mesh>
        <mesh position={[-5, -1, 0]}>
          <boxGeometry args={[0.05, 2, 0.05]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>
    </group>
  );
}
