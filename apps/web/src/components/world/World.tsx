'use client';

/**
 * Monde 3D isométrique : le jumeau numérique de l'entreprise.
 * Même données, mêmes droits que l'interface classique ; seule la représentation change.
 * MAAYOUD
 */
import { MapControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { REALTIME_EVENTS, type WorldBuilding, type WorldSnapshot } from '@temper/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { DEMO, api } from '@/lib/api';
import { Avatar } from './Avatar';
import { Building } from './Building';
import { City } from './City';
import { Environment } from './Environment';
import { Hall } from './Hall';
import { Hud } from './Hud';
import { WORLD } from './palette';
import { SALES_OFFICE, SalesOffice } from './SalesOffice';
import { useWorldUi } from './store';


export default function World() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['world'],
    queryFn: () => api<WorldSnapshot>('/world/snapshot'),
    refetchInterval: DEMO ? false : 30_000,
  });

  // Temps réel : on invalide l'instantané à chaque événement (regroupés sur 1 s)
  useEffect(() => {
    if (DEMO) return;
    const socket = io(`${process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000'}/world`, { withCredentials: true, transports: ['websocket'] });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => qc.invalidateQueries({ queryKey: ['world'] }), 1000);
    };
    Object.values(REALTIME_EVENTS).forEach((ev) => socket.on(ev, refresh));
    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, [qc]);

  if (isLoading) return <div className="grid h-full place-items-center text-sm text-cacao-700/60">Construction du monde</div>;
  if (error || !data) return <div className="grid h-full place-items-center text-sm text-danger">Le monde n a pas pu être chargé.</div>;

  // Point de départ : le bureau commercial pour la force de vente, le centre du site sinon
  const target: [number, number, number] = data.leads ? [-30, 0, 4] : [6, 0, 2];

  return (
    <div className="relative h-full w-full" style={{ background: WORLD.sky }}>
      <Canvas
        orthographic
        shadows
        dpr={[1, 2]}
        camera={{ position: [target[0] + 100, 100, target[2] + 100], zoom: 9, near: -1000, far: 2000 }}
        onPointerMissed={() => useWorldUi.getState().select(null)}
      >
        <FitZoom />
        <color attach="background" args={[WORLD.sky]} />
        <hemisphereLight args={['#ffffff', '#dfe3f0', 0.9]} />
        <directionalLight
          castShadow
          position={[60, 120, 40]}
          intensity={1.4}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-170}
          shadow-camera-right={170}
          shadow-camera-top={170}
          shadow-camera-bottom={-170}
        />
        <Scene data={data} />
        <MapControls target={target} enableRotate={false} enableDamping minZoom={2.5} maxZoom={40} screenSpacePanning={false} />
      </Canvas>
      <Hud data={data} />
    </div>
  );
}

function FitZoom() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = size.width < 640 ? 7 : Math.max(5, Math.min(16, size.width / 110));
    camera.updateProjectionMatrix();
    // uniquement à l'ouverture : ensuite l'utilisateur garde la main
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

const inside = (b: WorldBuilding, x: number, z: number) => Math.abs(x - b.x) <= b.width / 2 && Math.abs(z - b.z) <= b.depth / 2;

function Scene({ data }: { data: WorldSnapshot }) {
  const showLabels = useWorldUi((s) => s.showLabels);
  const showSales = !!data.leads;
  const me = data.me;

  const occupied = useMemo(
    () => [
      ...data.buildings.map((b) => ({ x: b.x, z: b.z, w: b.width + 4, d: b.depth + 4 })),
      ...(showSales ? [{ x: SALES_OFFICE.x, z: SALES_OFFICE.z, w: SALES_OFFICE.width + 4, d: SALES_OFFICE.depth + 4 }] : []),
      ...(data.city ?? []).map((l) => ({ x: l.x, z: l.z, w: 14, d: 14 })),
    ],
    [data, showSales],
  );

  // Placement des personnes : près des machines dans les halls, devant l'entrée ailleurs
  const placed = useMemo(() => {
    const out: Array<{ a: WorldSnapshot['avatars'][number]; pos: [number, number, number] }> = [];
    const byBuilding = new Map<string, WorldSnapshot['avatars']>();
    for (const a of data.avatars) {
      if (a.isMe && showSales) continue;
      byBuilding.set(a.buildingCode, [...(byBuilding.get(a.buildingCode) ?? []), a]);
    }
    for (const [code, list] of byBuilding) {
      const b = data.buildings.find((x) => x.code === code);
      if (!b) continue;
      const ms = data.machines.filter((m) => inside(b, m.x, m.z));
      list.forEach((a, i) => {
        if (b.kind === 'PRODUCTION' && ms.length && !b.locked) {
          const m = ms[i % ms.length]!;
          const ring = Math.floor(i / ms.length);
          out.push({ a, pos: [m.x + 1.7 - ring * 1.1, 0.12, m.z + 1.7] });
        } else if (b.kind === 'PRODUCTION') {
          out.push({ a, pos: [b.x - b.width / 2 + 2 + (i % 8) * 1.4, 0.12, b.z + Math.floor(i / 8) * 1.4] });
        } else {
          const cols = Math.max(3, Math.floor(b.width / 1.6));
          out.push({ a, pos: [b.x - ((cols - 1) * 1.6) / 2 + (i % cols) * 1.6, 0, b.z + b.depth / 2 + 2.2 + Math.floor(i / cols) * 1.6] });
        }
      });
    }
    return out;
  }, [data, showSales]);

  return (
    <group>
      <Environment occupied={occupied} />
      {data.buildings.map((b) =>
        b.kind === 'PRODUCTION' ? <Hall key={b.id} b={b} machines={data.machines.filter((m) => inside(b, m.x, m.z))} /> : <Building key={b.id} b={b} />,
      )}
      {placed.map(({ a, pos }) => (
        <Avatar key={a.id} id={a.id} position={pos} outfit={a.outfit} label={a.name ? `${a.name}${a.level ? ` · niv. ${a.level}` : ''}` : null} isMe={a.isMe} muted={!a.name} scale={1.35} showLabel={showLabels && (a.isMe || placed.length < 20)} />
      ))}
      {showSales && <SalesOffice leads={data.leads!} me={me ? { name: `${me.firstName} · niv. ${me.level}`, outfit: me.outfit } : null} />}
      {data.city && <City lots={data.city} />}
    </group>
  );
}
