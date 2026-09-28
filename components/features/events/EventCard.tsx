import { Event } from '@/types';
import { MapPin, Clock, Users, CheckCircle2, Circle } from 'lucide-react';

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
    <article className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      {/* Date strip */}
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 w-fit mb-3">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-medium capitalize">{dateStr} · {timeStr}</span>
      </div>

      <h3 className="font-bold text-stone-800 text-base leading-snug mb-1">{event.titulo}</h3>

      {event.descricao && (
        <p className="text-sm text-stone-500 line-clamp-2 mb-3">{event.descricao}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-4">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{event.local} — {event.cidade}, {event.estado}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-stone-500">
          <Users className="w-4 h-4" />
          <span>{goingCount} {goingCount === 1 ? 'confirmado' : 'confirmados'}</span>
        </div>

        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95
            ${isGoing
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-amber-600 text-white shadow-sm'
            }`}
        >
          {isGoing ? (
            <><CheckCircle2 className="w-4 h-4" /> Confirmado</>
          ) : (
            <><Circle className="w-4 h-4" /> Confirmar</>
          )}
        </button>
      </div>
    </article>
  );
}
