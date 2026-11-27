'use client';

/**
 * Cloche : notifications du compte, rafraîchies à l arrivée d un événement personnel.
 * MAAYOUD
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { DEMO, api } from '@/lib/api';

interface Note {
  id: string;
  title: string;
  body?: string | null;
  readAt?: string | null;
  link?: string | null;
}

export function Notifications() {
  const t = useTranslations('shell');
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const notes = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<{ items: Note[] }>('/communication/notifications?pageSize=20&sort=createdAt&dir=desc'),
  });
  useEffect(() => {
    if (DEMO) return;
    const origin = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const socket = io(`${origin}/world`, { withCredentials: true });
    socket.on('notification', () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => {
      socket.close();
    };
  }, [qc]);
  const unread = (notes.data?.items ?? []).filter((note) => !note.readAt).length;
  return (
    <div className="relative">
      <button type="button" aria-label={t('notifications')} className="relative rounded-lg p-2 hover:bg-surface" onClick={() => setOpen((value) => !value)}>
        <Bell className="size-4" />
        {unread > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-danger" />}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-72 rounded-xl border border-black/10 bg-white p-2 shadow-lg">
          {(notes.data?.items ?? []).length === 0 ? (
            <p className="px-2 py-3 text-sm text-cacao-700/60">{t('noNotifications')}</p>
          ) : (
            <ul>
              {(notes.data?.items ?? []).map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-surface"
                    onClick={() => {
                      if (!note.readAt) void api(`/communication/notifications/${note.id}`, { method: 'PATCH', body: JSON.stringify({ readAt: new Date().toISOString() }) }).catch(() => undefined);
                      setOpen(false);
                      if (note.link) window.location.href = note.link;
                    }}
                  >
                    <span className={note.readAt ? 'text-cacao-700/70' : 'font-medium'}>{note.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
