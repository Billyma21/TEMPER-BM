'use client';

import dynamic from 'next/dynamic';

const World = dynamic(() => import('@/components/world/World'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-cacao-700/60">Construction du monde</div>,
});

export default function MondePage() {
  return <World />;
}
