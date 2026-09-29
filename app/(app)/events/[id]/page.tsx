'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Event, Profile, Basenji } from '@/types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  Share2,
  UserCheck,
  Sparkles,
  Info,
  XCircle,
  Loader2,
} from 'lucide-react';

interface AttendeeDog {
  id: string;
  dono_id: string;
  nome: string;
  foto_url: string | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeDogs, setAttendeeDogs] = useState<AttendeeDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchEventData = useCallback(async () => {
    if (!id) return;

    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          profiles:criador_id (
            id,
            nome,
            avatar_url,
            cidade,
            estado
          ),
          event_attendees (
            id,
            evento_id,
            usuario_id,
            status,
            updated_at,
            profiles:usuario_id (
              id,
              nome,
              avatar_url,
              cidade,
              estado
            )
          )
        `)
        .eq('id', id)
        .single();

      if (eventError || !eventData) {
        console.error('[EventDetail] Erro ao carregar evento:', eventError);
        setEvent(null);
        setLoading(false);
        return;
      }

      setEvent(eventData as unknown as Event);

      // Busca os Basenjis dos tutores confirmados
      const goingAttendees = (eventData.event_attendees || []).filter(
        (a: any) => a.status === 'going'
      );
      const userIds = Array.from(new Set(goingAttendees.map((a: any) => a.usuario_id)));

      if (userIds.length > 0) {
        const { data: dogsData } = await supabase
          .from('basenjis')
          .select('id, dono_id, nome, foto_url')
          .in('dono_id', userIds);

        setAttendeeDogs(dogsData || []);
      } else {
        setAttendeeDogs([]);
      }
    } catch (err) {
      console.error('[EventDetail] Exceção ao carregar:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    async function loadUser() {
      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData.user?.id ?? null);
    }
    loadUser();
    fetchEventData();
  }, [fetchEventData]);

  // Lista de confirmados (status === 'going')
  const confirmedAttendees = useMemo(() => {
    return (event?.event_attendees || []).filter((a) => a.status === 'going');
  }, [event]);

  // Usuário atual já confirmou?
  const isUserGoing = useMemo(() => {
    if (!userId) return false;
    return confirmedAttendees.some((a) => a.usuario_id === userId);
  }, [confirmedAttendees, userId]);

  // Mapeamento de cães por tutor
  const dogsByTutor = useMemo(() => {
    const map = new Map<string, AttendeeDog[]>();
    attendeeDogs.forEach((dog) => {
      const list = map.get(dog.dono_id) || [];
      list.push(dog);
      map.set(dog.dono_id, list);
    });
    return map;
  }, [attendeeDogs]);

  // Toggle de confirmação de presença (RSVP)
  async function handleToggleAttendance() {
    if (!userId) {
      router.push('/login');
      return;
    }
    if (!event) return;

    setToggling(true);

    try {
      if (isUserGoing) {
        // Cancela presença
        await supabase
          .from('event_attendees')
          .delete()
          .eq('evento_id', event.id)
          .eq('usuario_id', userId);
      } else {
        // Confirma presença
        await supabase
          .from('event_attendees')
          .upsert({
            evento_id: event.id,
            usuario_id: userId,
            status: 'going',
          });
      }

      await fetchEventData();
    } catch (err) {
      console.error('[EventDetail] Erro no toggle de presença:', err);
    } finally {
      setToggling(false);
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: event ? `${event.titulo} | Basenji Brasil` : 'Basenji Brasil',
          text: event
            ? `Participe do encontro "${event.titulo}" em ${event.cidade}, ${event.estado}!`
            : 'Encontros da comunidade Basenji Brasil',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // ── Skeleton de Carregamento ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 pt-3 pb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
        </div>
        <div className="h-28 rounded-2xl bg-stone-100 animate-pulse" />
        <div className="h-20 rounded-2xl bg-stone-100 animate-pulse" />
        <div className="h-40 rounded-2xl bg-stone-100 animate-pulse" />
      </div>
    );
  }

  // ── Evento Não Encontrado ─────────────────────────────────────────────────
  if (!event) {
    return (
      <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
        <span className="text-5xl mb-3">📅❓</span>
        <h2 className="text-lg font-bold text-stone-800 mb-1">Encontro não encontrado</h2>
        <p className="text-sm text-stone-500 mb-6 max-w-xs">
          O encontro que você procura não foi localizado ou foi encerrado pelo organizador.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Encontros
        </Link>
      </div>
    );
  }

  // Formatação de data e hora
  const eventDate = new Date(event.data_hora);
  const dataFormatada = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const horaFormatada = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // URL de pesquisa no Google Maps
  const mapsQuery = encodeURIComponent(
    `${event.local}, ${event.cidade} - ${event.estado}, Brasil`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="px-4 pt-3 pb-8 flex flex-col gap-4">
      {/* ── Header de Navegação ── */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/events');
            }
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-stone-600 shadow-sm border border-stone-200/80 active:scale-95 transition-all"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-stone-600 shadow-sm border border-stone-200/80 active:scale-95 transition-all"
            title="Compartilhar encontro"
            aria-label="Compartilhar encontro"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="bg-stone-800 text-white text-xs py-2 px-3 rounded-xl text-center shadow animate-in fade-in">
          Link do encontro copiado para a área de transferência!
        </div>
      )}

      {/* ── Card Principal do Encontro ── */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col gap-4">
        {/* Data & Horário */}
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/70 rounded-xl px-3.5 py-2 w-fit">
          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="capitalize">{dataFormatada}</span>
          <span className="text-amber-400">•</span>
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{horaFormatada}</span>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight leading-snug">
          {event.titulo}
        </h1>

        {/* Localização & Link Google Maps */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-start gap-2 text-stone-600 text-sm">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-800">{event.local}</p>
              <p className="text-xs text-stone-500">
                {event.cidade}, {event.estado}
              </p>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200/60 active:scale-95 transition-all w-fit mt-1"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Abrir no Google Maps</span>
            <ExternalLink className="w-3 h-3 text-amber-600/70" />
          </a>
        </div>

        {/* Descrição detalhada */}
        {event.descricao && (
          <div className="pt-3 border-t border-stone-100">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Sobre o Encontro
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {event.descricao}
            </p>
          </div>
        )}

        {/* Orientações Comunitárias da Raça */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-100 flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Dica para o encontro:</strong> Leve água fresca, guia firme e certifique-se
            de que as vacinas e vermífugos do seu cão estão em dia para uma socialização saudável!
          </span>
        </div>

        {/* Organizador / Criador */}
        {event.profiles && (
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 relative rounded-full overflow-hidden bg-amber-100 border border-amber-200 shrink-0">
                {event.profiles.avatar_url ? (
                  <Image
                    src={event.profiles.avatar_url}
                    alt={event.profiles.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    👤
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                  Organizado por
                </span>
                <span className="font-bold text-stone-800 text-xs truncate block">
                  {event.profiles.nome}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Seção de RSVP (Confirmação de Presença) ── */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-800">Sua Presença</h2>
              <p className="text-[11px] text-stone-400">
                {isUserGoing
                  ? 'Você confirmou presença neste encontro!'
                  : 'Confirme para que os outros tutores saibam que você vai!'}
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Ação RSVP */}
        {isUserGoing ? (
          <div className="flex flex-col gap-2">
            <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Presença Confirmada!</span>
            </div>
            <button
              type="button"
              onClick={handleToggleAttendance}
              disabled={toggling}
              className="text-xs text-stone-400 hover:text-red-500 py-1 transition-colors self-center active:scale-95 disabled:opacity-50"
            >
              {toggling ? 'Atualizando…' : 'Cancelar minha presença'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleAttendance}
            disabled={toggling}
            className="w-full py-4 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
          >
            {toggling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Atualizando…</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Confirmar Presença no Encontro 🐾</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Lista de Confirmados ("Quem vai 🐾") ── */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
              <span>Quem vai</span>
              <span className="text-amber-600">🐾</span>
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {confirmedAttendees.length}{' '}
            {confirmedAttendees.length === 1 ? 'tutor confirmado' : 'tutores confirmados'}
          </span>
        </div>

        {confirmedAttendees.length === 0 ? (
          <div className="py-10 text-center text-stone-400 flex flex-col items-center gap-2">
            <span className="text-3xl">🐾</span>
            <p className="text-xs font-semibold text-stone-600">
              Seja o primeiro a confirmar presença neste encontro!
            </p>
            <p className="text-[11px] text-stone-400 max-w-xs">
              Sua confirmação motiva outros tutores da região a participarem.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {confirmedAttendees.map((attendee) => {
              const profile = attendee.profiles;
              const tutorDogs = profile ? dogsByTutor.get(profile.id) || [] : [];
              const dogNames = tutorDogs.map((d) => d.nome).join(', ');
              const subtitle = dogNames
                ? `Tutor(a) do ${dogNames}`
                : profile?.cidade
                  ? `${profile.cidade}, ${profile.estado}`
                  : 'Tutor da comunidade';

              return (
                <div
                  key={attendee.id}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar do Tutor */}
                    <div className="w-11 h-11 relative rounded-full overflow-hidden bg-amber-100 border-2 border-amber-200 shrink-0">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Dados do Tutor & Cães */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-stone-800 text-sm truncate">
                        {profile?.nome || 'Tutor Basenji'}
                      </h3>
                      <p className="text-xs text-amber-800/80 font-medium truncate flex items-center gap-1">
                        <span>🐾</span>
                        <span>{subtitle}</span>
                      </p>
                    </div>
                  </div>

                  {/* Fotos dos Cães (se houver) */}
                  {tutorDogs.length > 0 && (
                    <div className="flex -space-x-2 shrink-0">
                      {tutorDogs.slice(0, 3).map((d) => (
                        <div
                          key={d.id}
                          className="w-7 h-7 relative rounded-full overflow-hidden border-2 border-white bg-amber-50 shadow-xs"
                          title={d.nome}
                        >
                          {d.foto_url ? (
                            <Image
                              src={d.foto_url}
                              alt={d.nome}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">
                              🐕
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
