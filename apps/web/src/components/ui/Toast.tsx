'use client';

/**
 * Annonce courte, lue par les technologies d assistance.
 * MAAYOUD
 */
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext<(text: string) => void>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const push = useCallback((next: string) => {
    setText(next);
    window.setTimeout(() => setText((current) => (current === next ? null : current)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        {text && <p className="rounded-full bg-cacao-900 px-4 py-2 text-sm text-white shadow-lg">{text}</p>}
      </div>
    </ToastContext.Provider>
  );
}
