'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatarTempoRelativo } from '@/lib/utils';

export interface CommunityNotification {
  id: string;
  tipo: 'basenji' | 'evento';
  titulo: string;
  mensagem: string;
  link: string;
  created_at: string;
  tempoRelativo: string;
  foto_url?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

const STORAGE_KEY = 'basenji_last_read_notifications';

export function useNotifications() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [basenjisRes, eventsRes] = await Promise.all([
        supabase
          .from('basenjis')
          .select(`
            id,
            nome,
            foto_url,
            created_at,
            profiles:dono_id (
              cidade,
              estado
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('events')
          .select(`
            id,
            titulo,
            local,
            cidade,
            estado,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const items: CommunityNotification[] = [];

      // Mapeia Basenjis recentes
      if (basenjisRes.data) {
        basenjisRes.data.forEach((b: any) => {
          const profile = b.profiles;
          const loc =
            profile?.cidade && profile?.estado
              ? ` em ${profile.cidade}, ${profile.estado}`
              : profile?.cidade || profile?.estado
                ? ` em ${profile.cidade || profile.estado}`
                : '';

          items.push({
            id: `dog-${b.id}`,
            tipo: 'basenji',
            titulo: 'Novo Basenji na matilha! 🐾',
            mensagem: `O cão ${b.nome} acabou de ser cadastrado${loc}. Confira no feed!`,
            link: `/basenjis/${b.id}`,
            created_at: b.created_at,
            tempoRelativo: formatarTempoRelativo(b.created_at),
            foto_url: b.foto_url,
            cidade: profile?.cidade,
            estado: profile?.estado,
          });
        });
      }

      // Mapeia Eventos recentes
      if (eventsRes.data) {
        eventsRes.data.forEach((ev: any) => {
          const loc =
            ev.cidade && ev.estado
              ? ` em ${ev.cidade}, ${ev.estado}`
              : ev.cidade || ev.estado
                ? ` em ${ev.cidade || ev.estado}`
                : '';

          items.push({
            id: `event-${ev.id}`,
            tipo: 'evento',
            titulo: 'Novo Encontro marcado! 📅',
            mensagem: `Novo evento "${ev.titulo}"${loc}. Participe!`,
            link: '/events',
            created_at: ev.created_at,
            tempoRelativo: formatarTempoRelativo(ev.created_at),
            cidade: ev.cidade,
            estado: ev.estado,
          });
        });
      }

      // Ordena por created_at decrescente
      items.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(items);

      // Verificação de não lidos no localStorage
      if (typeof window !== 'undefined') {
        const lastRead = localStorage.getItem(STORAGE_KEY);
        if (!lastRead) {
          // Se nunca abriu as notificações e há itens, marca como não lido
          setHasUnread(items.length > 0);
        } else {
          const lastReadTime = new Date(lastRead).getTime();
          const unreadExists = items.some(
            (item) => new Date(item.created_at).getTime() > lastReadTime
          );
          setHasUnread(unreadExists);
        }
      }
    } catch (err) {
      console.error('[useNotifications] Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setHasUnread(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Polling a cada 120 segundos (2 minutos) com cleanup garantido
    const interval = setInterval(() => {
      fetchNotifications();
    }, 120_000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    hasUnread,
    markAsRead,
    refresh: fetchNotifications,
  };
}
