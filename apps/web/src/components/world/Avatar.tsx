'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { AvatarOutfit } from '@temper/shared';
import { useRef } from 'react';
import type { Group } from 'three';
import { OUTFIT_COLORS, SKIN, hash } from './palette';

interface Props {
  id: string;
  position: [number, number, number];
  outfit: AvatarOutfit;
  label?: string | null;
  isMe?: boolean;
  muted?: boolean;
  scale?: number;
  showLabel?: boolean;
}

/** Le "bonhomme" : corps, tête, détail de tenue. Animation légère, désactivée si mouvement réduit. */
export function Avatar({ id, position, outfit, label, isMe = false, muted = false, scale = 1, showLabel = true }: Props) {
  const ref = useRef<Group>(null);
  const h = hash(id);
  const phase = (h % 628) / 100;
  const colors = OUTFIT_COLORS[outfit];
  const skin = SKIN[h % SKIN.length]!;
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useFrame(({ clock }) => {
    if (!ref.current || reduce) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 2.2 + phase)) * (isMe ? 0.18 : 0.06);
    ref.current.rotation.y = Math.sin(t * 0.4 + phase) * 0.6;
  });

  const s = scale * (isMe ? 1.25 : 1);
  return (
    <group ref={ref} position={position} scale={s}>
      {isMe && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
          <ringGeometry args={[0.55, 0.75, 32]} />
          <meshBasicMaterial color="#8f84f3" transparent opacity={0.9} />
        </mesh>
      )}
      <mesh castShadow position-y={0.55}>
        <capsuleGeometry args={[0.28, 0.5, 4, 12]} />
        <meshStandardMaterial color={muted ? '#c5c9d6' : colors.body} roughness={0.7} />
      </mesh>
      <mesh castShadow position-y={1.18}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={muted ? '#d9dce6' : skin} roughness={0.8} />
      </mesh>
      {(outfit === 'blouse-blanche' || outfit === 'blouse-verte') && (
        <mesh position-y={1.34}>
          <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      {(outfit === 'gilet-orange' || outfit === 'gilet-securite' || outfit === 'combinaison-bleue') && (
        <mesh position-y={1.33}>
          <sphereGeometry args={[0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={outfit === 'combinaison-bleue' ? '#ffffff' : '#f6c453'} />
        </mesh>
      )}
      <mesh position={[0, 0.72, 0.25]}>
        <boxGeometry args={[0.18, 0.08, 0.04]} />
        <meshStandardMaterial color={muted ? '#c5c9d6' : colors.accent} />
      </mesh>
      {label && showLabel && (
        <Html position={[0, 2, 0]} center zIndexRange={[20, 0]}>
          <div className="world-tag" style={{ background: isMe ? '#2b1a12' : 'rgba(43,26,18,.82)', color: 'white' }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
