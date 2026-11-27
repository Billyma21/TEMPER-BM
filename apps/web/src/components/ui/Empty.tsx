/**
 * État vide : une phrase, jamais une liste inventée.
 * MAAYOUD
 */
export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 max-w-md text-sm text-cacao-700/60">{hint}</p>}
    </div>
  );
}
