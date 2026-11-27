'use client';

/**
 * Tableau de données : tri, colonnes, sélection, export, fenêtre au-delà de 200 lignes.
 * MAAYOUD
 */
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { Empty } from './Empty';

export interface TableColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

const ROW = 40;
const VIRTUAL_FROM = 200;

export function DataTable({
  columns,
  rows,
  total,
  page,
  pages,
  sort,
  dir,
  selected,
  onSort,
  onPage,
  onToggle,
  onToggleAll,
  onRow,
  search,
  onSearch,
  onExport,
  hidden,
  onHidden,
  locale,
  labels,
}: {
  columns: TableColumn[];
  rows: Array<Record<string, unknown> & { id?: string }>;
  total: number;
  page: number;
  pages: number;
  sort?: string;
  dir: 'asc' | 'desc';
  selected: Set<string>;
  onSort: (key: string) => void;
  onPage: (page: number) => void;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], on: boolean) => void;
  onRow: (row: Record<string, unknown>) => void;
  search: string;
  onSearch: (value: string) => void;
  onExport?: () => void;
  hidden: string[];
  onHidden: (hidden: string[]) => void;
  locale: string;
  labels: {
    search: string;
    export: string;
    empty: string;
    emptyHint: string;
    columns: string;
    previous: string;
    next: string;
    selected: string;
    page: string;
    rows: string;
  };
}) {
  const shown = columns.filter((column) => !hidden.includes(column.key));
  const scroller = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState({ start: 0, end: rows.length });
  const virtual = rows.length > VIRTUAL_FROM;
  const ids = rows.flatMap((row) => (typeof row.id === 'string' ? [row.id] : []));
  const allOn = ids.length > 0 && ids.every((id) => selected.has(id));

  useEffect(() => {
    if (!virtual) return;
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const start = Math.max(0, Math.floor(el.scrollTop / ROW) - 6);
      const end = Math.min(rows.length, Math.ceil((el.scrollTop + el.clientHeight) / ROW) + 8);
      setRange({ start, end });
    };
    update();
    el.addEventListener('scroll', update);
    return () => el.removeEventListener('scroll', update);
  }, [virtual, rows.length]);

  const slice = virtual ? rows.slice(range.start, range.end) : rows;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="min-w-48 flex-1 text-sm">
          <span className="sr-only">{labels.search}</span>
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={labels.search}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm">{labels.columns}</summary>
          <fieldset className="absolute right-0 z-10 mt-1 max-h-64 w-56 overflow-auto rounded-xl border border-black/10 bg-white p-2 shadow-lg">
            {columns.map((column) => (
              <label key={column.key} className="flex items-center gap-2 px-1 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={!hidden.includes(column.key)}
                  onChange={(event) => {
                    const next = event.target.checked ? hidden.filter((key) => key !== column.key) : [...hidden, column.key];
                    onHidden(next.length >= columns.length ? hidden : next);
                  }}
                />
                {column.label}
              </label>
            ))}
          </fieldset>
        </details>
        {onExport && (
          <Button variant="secondary" onClick={onExport}>
            {labels.export}
          </Button>
        )}
      </div>
      {selected.size > 0 && <p className="text-xs text-cacao-700/70">{labels.selected.replace('COUNT', String(selected.size))}</p>}
      {rows.length === 0 ? (
        <Empty title={labels.empty} hint={labels.emptyHint} />
      ) : (
        <div ref={scroller} className={clsx('overflow-auto rounded-2xl bg-white shadow-sm', virtual && 'max-h-[32rem]')}>
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{labels.rows.replace('TOTAL', String(total))}</caption>
            <thead className="sticky top-0 bg-cacao-50 text-xs tracking-wide text-cacao-700/70 uppercase">
              <tr>
                <th className="w-10 px-3 py-2">
                  <input type="checkbox" checked={allOn} aria-label={labels.selected} onChange={(event) => onToggleAll(ids, event.target.checked)} />
                </th>
                {shown.map((column) => (
                  <th key={column.key} className={clsx('px-3 py-2 font-medium', column.numeric && 'text-right')}>
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort(column.key)}>
                      {column.label}
                      {sort === column.key && (dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {virtual && range.start > 0 && (
                <tr aria-hidden>
                  <td colSpan={shown.length + 1} style={{ height: range.start * ROW, padding: 0 }} />
                </tr>
              )}
              {slice.map((row, index) => {
                const id = typeof row.id === 'string' ? row.id : `row-${range.start + index}`;
                return (
                  <tr key={id} className="border-t border-black/5 hover:bg-lavande-100/40" style={virtual ? { height: ROW } : undefined}>
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={selected.has(id)} aria-label={id} onChange={() => onToggle(id)} onClick={(event) => event.stopPropagation()} />
                    </td>
                    {shown.map((column, columnIndex) => (
                      <td key={column.key} className={clsx('max-w-xs truncate px-3 py-2', column.numeric && 'text-right tabular-nums')}>
                        {columnIndex === 0 ? (
                          <button type="button" className="text-left font-medium text-lavande-600" onClick={() => onRow(row)}>
                            {formatCell(row[column.key], locale)}
                          </button>
                        ) : (
                          formatCell(row[column.key], locale)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {virtual && range.end < rows.length && (
                <tr aria-hidden>
                  <td colSpan={shown.length + 1} style={{ height: (rows.length - range.end) * ROW, padding: 0 }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-cacao-700/60">{labels.rows.replace('TOTAL', String(total))}</span>
        <div className="flex items-center gap-2">
          <span>{labels.page.replace('PAGES', String(pages)).replace('PAGE', String(page))}</span>
          <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            {labels.previous}
          </Button>
          <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            {labels.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function formatCell(value: unknown, locale = 'fr-BE'): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') {
    if (locale.startsWith('nl')) return value ? 'ja' : 'nee';
    if (locale.startsWith('en')) return value ? 'yes' : 'no';
    return value ? 'oui' : 'non';
  }
  if (typeof value === 'number') return new Intl.NumberFormat(locale).format(value);
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value) && value.length < 16) return new Intl.NumberFormat(locale).format(Number(value));
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
