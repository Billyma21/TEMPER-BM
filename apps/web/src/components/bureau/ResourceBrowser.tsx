'use client';

/**
 * Liste et fiche d une ressource du gabarit. Les actions absentes des droits ne sont pas affichées.
 * MAAYOUD
 */
import { SUBJECTS, type SubjectName } from '@temper/permissions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DataTable, formatCell } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { Empty } from '@/components/ui/Empty';
import { Field, TextInput } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { localeTag, readLocale } from '@/i18n/messages';
import { ApiError, api, downloadCsv } from '@/lib/api';
import { resourcePath } from '@/lib/resources';
import { useSession } from '@/lib/session';

interface FieldDesc {
  name: string;
  kind: string;
  optional: boolean;
  read: boolean;
  create: boolean;
  update: boolean;
}

interface ListBody {
  items: Array<Record<string, unknown> & { id?: string }>;
  total: number;
  page: number;
  pageSize: number;
}

const WRITABLE = new Set(['string', 'int', 'bigint', 'float', 'decimal', 'bool', 'datetime', 'enum']);

export function ResourceBrowser({ subject }: { subject: SubjectName }) {
  const t = useTranslations('table');
  const r = useTranslations('resource');
  const toast = useToast();
  const { ability } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const path = `/${resourcePath(subject)}`;
  const page = Number(params.get('page') ?? '1') || 1;
  const sort = params.get('sort') ?? undefined;
  const dir = params.get('dir') === 'asc' ? 'asc' : 'desc';
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);
  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'detail' | 'audit' | 'create'>('detail');
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [locale, setLocale] = useState('fr-BE');
  const searchTimer = useRef<number | undefined>(undefined);
  useEffect(() => setLocale(localeTag(readLocale())), []);

  useEffect(() => {
    const raw = localStorage.getItem(`temper.table.${subject}`);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { hidden?: string[]; q?: string };
      if (Array.isArray(saved.hidden)) setHidden(saved.hidden);
      if (!params.get('q') && saved.q) replace({ q: saved.q, page: 1 });
    } catch {
      /* préférence illisible : on repart des colonnes complètes */
    }
    // La restauration ne se rejoue pas à chaque frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  function replace(next: { q?: string; page?: number; sort?: string; dir?: 'asc' | 'desc' }) {
    const query = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) query.set('q', next.q);
      else query.delete('q');
    }
    if (next.page) query.set('page', String(next.page));
    if (next.sort) query.set('sort', next.sort);
    if (next.dir) query.set('dir', next.dir);
    router.replace(`?${query.toString()}`);
  }

  const meta = useQuery({
    queryKey: ['meta', subject],
    queryFn: () => api<{ label: string; fields: FieldDesc[] }>(`${path}/meta`),
  });
  const list = useQuery({
    queryKey: ['list', subject, page, sort, dir, q],
    queryFn: () => {
      const query = new URLSearchParams({ page: String(page), pageSize: '25', dir });
      if (sort) query.set('sort', sort);
      if (q) query.set('q', q);
      return api<ListBody>(`${path}?${query.toString()}`);
    },
  });
  const detail = useQuery({
    queryKey: ['detail', subject, openId],
    enabled: !!openId && tab !== 'create',
    queryFn: () => api<Record<string, unknown>>(`${path}/${openId}`),
  });
  const audit = useQuery({
    queryKey: ['audit', subject, openId],
    enabled: !!openId && tab === 'audit',
    queryFn: () => api<{ items: Array<{ id: string; at: string; action: string; actorId: string | null }> }>(`${path}/${openId}/audit`),
  });

  const columns = useMemo(() => {
    const names = meta.data?.fields.filter((field) => field.read).map((field) => field.name) ?? Object.keys(list.data?.items[0] ?? {});
    return names.filter((name) => name !== 'id').slice(0, 8).map((name) => ({
      key: name,
      label: name,
      numeric: ['int', 'decimal', 'float', 'bigint'].includes(meta.data?.fields.find((field) => field.name === name)?.kind ?? ''),
    }));
  }, [meta.data, list.data]);

  const canExport = ability.can('export', subject);
  const canCreate = ability.can('create', subject) && (meta.data?.fields.some((field) => field.create) ?? false);
  const pages = Math.max(1, Math.ceil((list.data?.total ?? 0) / (list.data?.pageSize ?? 25)));

  function persist(nextHidden: string[], nextQ = q) {
    setHidden(nextHidden);
    localStorage.setItem(`temper.table.${subject}`, JSON.stringify({ hidden: nextHidden, q: nextQ }));
  }

  async function submit(mode: 'create' | 'update') {
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(form)) {
        if (value === '') continue;
        const field = meta.data?.fields.find((item) => item.name === key);
        if (!field) continue;
        if (field.kind === 'bool') body[key] = value === 'true';
        else if (field.kind === 'int' || field.kind === 'bigint') body[key] = Number(value);
        else if (field.kind === 'float' || field.kind === 'decimal') body[key] = value;
        else if (field.kind === 'datetime') body[key] = new Date(value).toISOString();
        else body[key] = value;
      }
      if (mode === 'create') await api(path, { method: 'POST', body: JSON.stringify(body) });
      else if (openId) await api(`${path}/${openId}`, { method: 'PATCH', body: JSON.stringify(body) });
      setOpenId(null);
      setForm({});
      await qc.invalidateQueries({ queryKey: ['list', subject] });
      toast(r('save'));
    } catch (error) {
      toast(error instanceof ApiError ? (error.body?.message ?? error.message) : (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const writable = (meta.data?.fields ?? []).filter((field) => WRITABLE.has(field.kind) && (tab === 'create' ? field.create : field.update));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{SUBJECTS[subject].label}</h1>
          <p className="text-sm text-cacao-700/60">{meta.data?.label}</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setTab('create');
              setOpenId('new');
              setForm({});
            }}
          >
            {r('create')}
          </Button>
        )}
      </header>
      {list.isError ? (
        <Empty title={r('denied')} hint={list.error instanceof ApiError ? list.error.body?.message : undefined} />
      ) : (
        <DataTable
          columns={columns}
          rows={list.data?.items ?? []}
          total={list.data?.total ?? 0}
          page={page}
          pages={pages}
          sort={sort}
          dir={dir}
          selected={selected}
          locale={locale}
          search={draft}
          hidden={hidden}
          labels={{
            search: t('search'),
            export: t('export'),
            empty: t('empty'),
            emptyHint: t('emptyHint'),
            columns: t('columns'),
            previous: t('previous'),
            next: t('next'),
            selected: t('selected'),
            page: t('page'),
            rows: t('rows'),
          }}
          onSearch={(value) => {
            setDraft(value);
            window.clearTimeout(searchTimer.current);
            searchTimer.current = window.setTimeout(() => {
              persist(hidden, value);
              replace({ q: value, page: 1 });
            }, 300);
          }}
          onSort={(key) => replace({ sort: key, dir: sort === key && dir === 'asc' ? 'desc' : 'asc', page: 1 })}
          onPage={(next) => replace({ page: next })}
          onHidden={persist}
          onToggle={(id) => {
            const next = new Set(selected);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setSelected(next);
          }}
          onToggleAll={(ids, on) => setSelected(on ? new Set(ids) : new Set())}
          onRow={(row) => {
            if (typeof row.id !== 'string') return;
            setTab('detail');
            setOpenId(row.id);
            setForm({});
          }}
          onExport={canExport ? () => downloadCsv(`${path}/export${q ? `?q=${encodeURIComponent(q)}` : ''}`, `${subject}.csv`).catch((error: unknown) => toast(error instanceof Error ? error.message : '')) : undefined}
        />
      )}
      <Drawer
        open={openId !== null}
        title={tab === 'create' ? r('create') : r('detail')}
        onClose={() => setOpenId(null)}
      >
        {tab !== 'create' && (
          <div className="mb-4 flex gap-2" role="tablist">
            <Button variant={tab === 'detail' ? 'primary' : 'ghost'} onClick={() => setTab('detail')}>
              {r('detail')}
            </Button>
            <Button variant={tab === 'audit' ? 'primary' : 'ghost'} onClick={() => setTab('audit')}>
              {r('audit')}
            </Button>
          </div>
        )}
        {tab === 'audit' ? (
          audit.data?.items.length ? (
            <ol className="space-y-3">
              {audit.data.items.map((item) => (
                <li key={item.id} className="rounded-xl bg-surface px-3 py-2 text-sm">
                  <div className="font-medium">{item.action}</div>
                  <div className="text-xs text-cacao-700/60">{formatCell(item.at, locale)}</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-cacao-700/60">{r('noAudit')}</p>
          )
        ) : (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(tab === 'create' ? 'create' : 'update');
            }}
          >
            {tab === 'detail' &&
              Object.entries(detail.data ?? {})
                .filter(([key]) => !writable.some((field) => field.name === key))
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[11px] text-cacao-700/60">{key}</div>
                    <div className="text-sm break-words">{formatCell(value, locale)}</div>
                  </div>
                ))}
            {writable.map((field) => (
              <Field key={field.name} label={field.name}>
                {field.kind === 'bool' ? (
                  <select
                    className="w-full rounded-xl border border-black/10 px-3 py-2"
                    value={form[field.name] ?? ''}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                  >
                    <option value=""> </option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <TextInput
                    value={form[field.name] ?? (tab === 'detail' && detail.data ? String(detail.data[field.name] ?? '') : '')}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                  />
                )}
              </Field>
            ))}
            {writable.length > 0 && (
              <div className="flex gap-2">
                <Button type="submit" disabled={busy}>
                  {r('save')}
                </Button>
                <Button variant="ghost" onClick={() => setOpenId(null)}>
                  {r('cancel')}
                </Button>
              </div>
            )}
          </form>
        )}
      </Drawer>
    </div>
  );
}
