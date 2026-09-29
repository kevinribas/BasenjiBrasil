'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Basenji, STATUS_SAUDE_CONFIG } from '@/types';
import { calcularIdade } from '@/lib/utils';
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Venus,
  Mars,
  Cake,
  ZoomIn,
  X,
  Share2,
  HeartPulse,
} from 'lucide-react';

export default function BasenjiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params?.id as string;

  const [dog, setDog] = useState<Basenji | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      setCurrentUserId(authData.user?.id ?? null);

      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('basenjis')
        .select(`
          *,
          profiles:dono_id (
            id,
            nome,
            avatar_url,
            cidade,
            estado
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('[BasenjiDetail] Erro ao carregar cão:', error);
        setDog(null);
      } else {
        setDog(data as Basenji);
      }
      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Tecla Esc para fechar o zoom
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowZoom(false);
    }
    if (showZoom) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showZoom]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: dog ? `${dog.nome} no Basenji Brasil` : 'Basenji Brasil',
        url: window.location.href,
      }).catch(() => {});
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
        {/* Header navigation skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
          <div className="w-20 h-9 rounded-full bg-stone-200 animate-pulse" />
        </div>
        {/* Photo skeleton */}
        <div className="w-full aspect-square rounded-3xl bg-stone-200 animate-pulse" />
        {/* Title skeleton */}
        <div className="h-8 w-44 bg-stone-200 rounded-lg animate-pulse mt-2" />
        {/* Badges skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="w-20 h-7 rounded-full bg-stone-200 animate-pulse" />
          <div className="w-24 h-7 rounded-full bg-stone-200 animate-pulse" />
          <div className="w-20 h-7 rounded-full bg-stone-200 animate-pulse" />
        </div>
        {/* Bio skeleton */}
        <div className="h-28 rounded-2xl bg-white border border-stone-100 p-4 animate-pulse flex flex-col gap-2">
          <div className="h-4 w-28 bg-stone-200 rounded" />
          <div className="h-3 w-full bg-stone-100 rounded" />
          <div className="h-3 w-3/4 bg-stone-100 rounded" />
        </div>
        {/* Tutor skeleton */}
        <div className="h-20 rounded-2xl bg-white border border-stone-100 p-4 animate-pulse flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-32 bg-stone-200 rounded" />
            <div className="h-3 w-24 bg-stone-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // ── Cão Não Encontrado ───────────────────────────────────────────────────
  if (!dog) {
    return (
      <div className="px-4 py-16 flex flex-col items-center justify-center text-center">
        <span className="text-5xl mb-3">🐕❓</span>
        <h2 className="text-lg font-bold text-stone-800 mb-1">Cão não encontrado</h2>
        <p className="text-sm text-stone-500 mb-6 max-w-xs">
          O perfil deste Basenji não foi localizado ou pode ter sido removido pelo tutor.
        </p>
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Feed
        </Link>
      </div>
    );
  }

  const isDono = currentUserId != null && currentUserId === dog.dono_id;
  const idade = calcularIdade(dog.data_nasc);

  return (
    <>
      {/* ── Modal de Foto em Tela Cheia ────────────────────────────────────── */}
      {showZoom && dog.foto_url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowZoom(false)}
        >
          <button
            type="button"
            onClick={() => setShowZoom(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-all z-10"
            aria-label="Fechar visualização"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative w-full max-w-md max-h-[85vh] aspect-square rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={dog.foto_url}
              alt={dog.nome}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
          </div>
          <p className="text-white/70 text-xs mt-4 font-medium tracking-wide">
            {dog.nome} • Toque fora ou pressione Esc para fechar
          </p>
        </div>
      )}

      <div className="px-4 pt-3 pb-8 flex flex-col gap-4">
        {/* ── Header de Navegação ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/feed');
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
              title="Compartilhar"
              aria-label="Compartilhar perfil"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {isDono && (
              <Link
                href={`/basenjis/${dog.id}/edit`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar</span>
              </Link>
            )}
          </div>
        </div>

        {copied && (
          <div className="bg-stone-800 text-white text-xs py-2 px-3 rounded-xl text-center shadow animate-in fade-in">
            Link copiado para a área de transferência!
          </div>
        )}

        {/* ── Foto Principal em Destaque ──────────────────────────────────── */}
        <div
          onClick={() => dog.foto_url && setShowZoom(true)}
          className={`relative w-full aspect-square max-h-[380px] rounded-3xl overflow-hidden bg-amber-50 shadow-md border border-amber-100/60 ${
            dog.foto_url ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''
          }`}
        >
          {dog.foto_url ? (
            <>
              <Image
                src={dog.foto_url}
                alt={dog.nome}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full shadow pointer-events-none">
                <ZoomIn className="w-4 h-4" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400">
              <span className="text-6xl">🐕</span>
              <span className="text-xs font-medium">Sem foto cadastrada</span>
            </div>
          )}
        </div>

        {/* ── Informações Principais do Cão ────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {dog.nome}
            </h1>
          </div>

          {/* Badges Visuais */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Sexo */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                dog.sexo === 'macho'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-pink-100 text-pink-700'
              }`}
            >
              {dog.sexo === 'macho' ? (
                <Mars className="w-3.5 h-3.5" />
              ) : (
                <Venus className="w-3.5 h-3.5" />
              )}
              {dog.sexo === 'macho' ? 'Macho' : 'Fêmea'}
            </span>

            {/* Cor */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {dog.cor}
            </span>

            {/* Idade */}
            {idade && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 shadow-sm">
                <Cake className="w-3.5 h-3.5 text-amber-600" />
                {idade}
              </span>
            )}
          </div>
        </div>

        {/* ── Bio / Sobre ─────────────────────────────────────────────────── */}
        {dog.bio && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Sobre o Basenji
            </h2>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {dog.bio}
            </p>
          </div>
        )}

        {/* ── Histórico de Saúde & Cuidados ────────────────────────────────── */}
        {(() => {
          const condicoesVisiveis = (dog.condicoes_saude ?? []).filter(
            (c) => c.compartilhar_comunidade || isDono
          );
          if (condicoesVisiveis.length === 0) return null;

          return (
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-bold text-stone-800">
                    Histórico de Saúde & Cuidados
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">
                  {condicoesVisiveis.length}{' '}
                  {condicoesVisiveis.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {condicoesVisiveis.map((cond, idx) => {
                  const cfg =
                    STATUS_SAUDE_CONFIG[cond.status] ?? STATUS_SAUDE_CONFIG.controlado;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-stone-800 leading-snug">
                          {cond.titulo}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {cond.descricao && (
                        <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                          {cond.descricao}
                        </p>
                      )}

                      {isDono && !cond.compartilhar_comunidade && (
                        <span className="text-[10px] text-stone-400 italic">
                          🔒 Visível apenas para você (privado)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-stone-400 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                ℹ️ Informações compartilhadas pela comunidade. Não substituem orientação veterinária profissional.
              </p>
            </div>
          );
        })()}

        {/* ── Cartão do Tutor ─────────────────────────────────────────────── */}
        {dog.profiles && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-amber-100 border-2 border-amber-300 shrink-0">
                {dog.profiles.avatar_url ? (
                  <Image
                    src={dog.profiles.avatar_url}
                    alt={dog.profiles.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    👤
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Tutor Responsável
                </span>
                <h3 className="font-bold text-stone-800 text-base truncate">
                  {dog.profiles.nome}
                </h3>
                {(dog.profiles.cidade || dog.profiles.estado) && (
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">
                      {[dog.profiles.cidade, dog.profiles.estado]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
