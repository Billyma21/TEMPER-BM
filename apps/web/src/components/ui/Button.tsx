'use client';

/**
 * Bouton du bureau. L action principale est cacao, le danger reste explicite.
 * MAAYOUD
 */
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

const STYLES = {
  primary: 'bg-cacao-900 text-white hover:bg-cacao-800',
  secondary: 'border border-black/10 bg-white hover:border-lavande-500',
  ghost: 'hover:bg-black/5',
  danger: 'bg-danger text-white hover:opacity-90',
} as const;

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof STYLES }) {
  return (
    <button
      type={type}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50', STYLES[variant], className)}
      {...props}
    />
  );
}
