'use client';

import Link from 'next/link';
import { Event } from '@/types';
import { MapPin, Clock, Users, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isGoing: boolean;
  goingCount: number;
  onToggle: () => void;
}

export default function EventCard({ event, isGoing, goingCount, onToggle }: EventCardProps) {
  const eventDate = new Date(event.data_hora);
  const dateStr = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="group relative bg-white rounded-2xl p-4 shadow-sm border border-stone-100 hover:shadow-md hover:border-amber-200/60 active:scale-[0.99] transition-all cursor-pointer">
      {/* Stretched Link para a página de detalhes do encontro */}
      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver detalhes do encontro ${event.titulo}`}
      />

      {/* Date strip */}
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 w-fit mb-3 pointer-events-none">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-medium capitalize">{dateStr} · {timeStr}</span>
      </div>

      <h3 className="font-bold text-stone-800 text-base leading-snug mb-1 group-hover:text-amber-800 transition-colors pointer-events-none">
        {event.titulo}
      </h3>

      {event.descricao && (
        <p className="text-sm text-stone-500 line-clamp-2 mb-3 pointer-events-none">
          {event.descricao}
        </p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-4 pointer-events-none">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{event.local} — {event.cidade}, {event.estado}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-50">
        <div className="flex items-center gap-2 text-xs text-stone-500 pointer-events-none">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold text-stone-700">{goingCount}</span>
            <span>{goingCount === 1 ? 'confirmado' : 'confirmados'}</span>
          </div>
          <span className="text-stone-300">•</span>
          <span className="text-amber-700 font-medium group-hover:underline flex items-center gap-0.5">
            Ver quem vai <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* RSVP button (com stopPropagation para não acionar o link do card) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs ${
            isGoing
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          {isGoing ? (
            <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmado</>
          ) : (
            <><Circle className="w-3.5 h-3.5" /> Confirmar</>
          )}
        </button>
      </div>
    </article>
  );
}
