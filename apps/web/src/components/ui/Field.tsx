'use client';

/**
 * Champ libellé. Le message d erreur est lié au contrôle.
 * MAAYOUD
 */
import type { InputHTMLAttributes, ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-cacao-700/60">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ${props.className ?? ''}`} />;
}
