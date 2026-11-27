'use client';

import { useMemo } from 'react';
import { WORLD, seeded } from './palette';

type Box = { x: number; z: number; w: number; d: number };

/** Sol, routes, arbres. Le décor est déterministe (même graine) et évite les emprises bâties. */
export function Environment({ occupied }: { occupied: Box[] }) {
  const trees = useMemo(() => {
    const rnd = seeded(42);
    const out: Array<[number, number, number]> = [];
    let guard = 0;
    while (out.length < 90 && guard++ < 4000) {
      const x = -120 + rnd() * 220;
      const z = -70 + rnd() * 175;
      const onRoad = Math.abs(z - 40) < 5 || (z > 40 && Math.abs(x + 8) < 4);
      const hit = occupied.some((b) => Math.abs(x - b.x) < b.w / 2 + 3 && Math.abs(z - b.z) < b.d / 2 + 3);
      const inCampus = x > -75 && x < 58 && z > -40 && z < 32;
      if (!onRoad && !hit && !(inCampus && rnd() > 0.25)) out.push([x, z, 0.8 + rnd() * 0.7]);
    }
    return out;
  }, [occupied]);

  const dashes = useMemo(() => Array.from({ length: 56 }, (_, i) => -140 + i * 5), []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position-y={-0.01}>
        <planeGeometry args={[420, 320]} />
        <meshStandardMaterial color={WORLD.ground} />
      </mesh>
      {/* Emprise du site */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[-8, 0, -4]}>
        <planeGeometry args={[136, 74]} />
        <meshStandardMaterial color={WORLD.campus} />
      </mesh>
      {/* Route principale et rues de la ville */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 40]} receiveShadow>
        <planeGeometry args={[300, 6]} />
        <meshStandardMaterial color={WORLD.road} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-8, 0.012, 70]} receiveShadow>
        <planeGeometry args={[5, 60]} />
        <meshStandardMaterial color={WORLD.road} />
      </mesh>
      {dashes.map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.02, 40]}>
          <planeGeometry args={[2.2, 0.25]} />
          <meshBasicMaterial color={WORLD.roadLine} />
        </mesh>
      ))}
      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh castShadow position-y={0.6}>
            <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
            <meshStandardMaterial color={WORLD.trunk} />
          </mesh>
          <mesh castShadow position-y={1.9}>
            <boxGeometry args={[1.4, 1.6, 1.4]} />
            <meshStandardMaterial color={i % 3 ? WORLD.tree : WORLD.treeDark} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
