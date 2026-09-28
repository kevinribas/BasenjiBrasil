'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/types';
import EventCard from '@/components/features/events/EventCard';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      await fetchEvents();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        profiles(id, nome, avatar_url),
        event_attendees(id, usuario_id, status, profiles(nome, avatar_url))
      `)
      .order('data_hora', { ascending: true });

    setEvents((data as Event[]) ?? []);
    setLoading(false);
  }

  async function toggleAttendance(eventId: string, currentlyGoing: boolean) {
    if (!userId) return;

    if (currentlyGoing) {
      await supabase
        .from('event_attendees')
        .delete()
        .eq('evento_id', eventId)
        .eq('usuario_id', userId);
    } else {
      await supabase
        .from('event_attendees')
        .upsert({ evento_id: eventId, usuario_id: userId, status: 'going' });
    }

    fetchEvents();
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-700">Encontros & Eventos</h2>
        <Link
          href="/events/new"
          className="flex items-center gap-1.5 text-sm bg-amber-600 text-white px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Criar
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">Nenhum evento cadastrado</p>
          <p className="text-sm mt-1">Seja o primeiro a criar um encontro!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => {
            const isGoing = event.event_attendees?.some(
              (a) => a.usuario_id === userId && a.status === 'going'
            ) ?? false;
            const goingCount = event.event_attendees?.filter((a) => a.status === 'going').length ?? 0;

            return (
              <EventCard
                key={event.id}
                event={event}
                isGoing={isGoing}
                goingCount={goingCount}
                onToggle={() => toggleAttendance(event.id, isGoing)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
