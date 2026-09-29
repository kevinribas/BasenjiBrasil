'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  Basenji,
  CategoriaSaude,
  CONDICOES_PREDEFINIDAS,
  STATUS_SAUDE_CONFIG,
} from '@/types';
import {
  ArrowLeft,
  HeartPulse,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Users,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  MapPin,
} from 'lucide-react';

export default function SaudeComunitariaPage() {
  const supabase = createClient();

  const [dogs, setDogs] = useState<Basenji[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoriaSaude | 'todas'>('todas');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('basenjis')
        .select(`
          id,
          nome,
          foto_url,
          sexo,
          cor,
          dono_id,
          data_nasc,
          condicoes_saude,
          created_at,
          profiles:dono_id (
            nome,
            cidade,
            estado,
            avatar_url
          )
        `);

      if (error) {
        console.error('[Saude] Erro ao carregar basenjis:', error);
      } else {
        setDogs((data as unknown as Basenji[]) || []);
      }
      setLoading(false);
    }

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Total de cães
  const totalDogs = dogs.length;

  // Estatísticas por categoria de saúde
  const stats = useMemo(() => {
    const counts: Record<CategoriaSaude, number> = {
      sensibilidade_digestiva: 0,
      fanconi: 0,
      figado_ipsid: 0,
      alergias_pele: 0,
      renal: 0,
      outra: 0,
    };

    dogs.forEach((dog) => {
      const condicoes = dog.condicoes_saude ?? [];
      const categoriasRegistradas = new Set(
        condicoes
          .filter((c) => c.compartilhar_comunidade)
          .map((c) => c.categoria)
      );

      categoriasRegistradas.forEach((cat) => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
    });

    return counts;
  }, [dogs]);

  // Cães que compartilharam ao menos uma condição pública
  const sharedDogsList = useMemo(() => {
    const list: {
      dog: Basenji;
      condicao: NonNullable<Basenji['condicoes_saude']>[number];
    }[] = [];

    dogs.forEach((dog) => {
      const condicoes = dog.condicoes_saude ?? [];
      condicoes.forEach((c) => {
        if (c.compartilhar_comunidade) {
          if (
            selectedCategoryFilter === 'todas' ||
            c.categoria === selectedCategoryFilter
          ) {
            list.push({ dog, condicao: c });
          }
        }
      });
    });

    return list;
  }, [dogs, selectedCategoryFilter]);

  return (
    <div className="px-4 pt-3 pb-8 flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors shrink-0"
          aria-label="Voltar para o feed"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-stone-800 text-lg leading-tight">
              Saúde & Cuidados
            </h1>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3" /> Comunidade
            </span>
          </div>
          <p className="text-xs text-stone-400">
            Orientações sobre a raça e estatísticas colaborativas no Brasil
          </p>
        </div>
      </div>

      {/* ── Aviso Veterinário Importante ── */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
            Aviso aos Tutores
          </h2>
          <p className="text-xs text-amber-800 leading-relaxed mt-1">
            As informações deste espaço são relatos voluntários para troca de experiências
            entre tutores de Basenjis. <strong>Não substituem consultas, diagnósticos ou prescrições veterinárias.</strong> Em caso de sintomas, procure um médico veterinário.
          </p>
        </div>
      </div>

      {/* ── Censo de Saúde (Estatísticas da Raça) ── */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-800">
                Censo Comunitário de Saúde
              </h2>
              <p className="text-[11px] text-stone-400">
                Baseado em {totalDogs} Basenjis cadastrados na rede
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {CONDICOES_PREDEFINIDAS.map((item) => {
              const count = stats[item.categoria] || 0;
              const percent = totalDogs > 0 ? Math.round((count / totalDogs) * 100) : 0;

              return (
                <div key={item.categoria} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 truncate max-w-[220px]">
                      {item.titulo}
                    </span>
                    <span className="text-stone-500 font-medium shrink-0">
                      <strong>{count}</strong> {count === 1 ? 'cão' : 'cães'} ({percent}%)
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(percent, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Guias e Particularidades da Raça ── */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          Particularidades Importantes do Basenji
        </h2>

        {/* Guia 1: Trato Digestivo */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-lg">🥣</span>
            <h3 className="font-bold text-stone-800 text-sm">
              Sensibilidade Gastrointestinal
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Muitos Basenjis apresentam intolerâncias a ingredientes comuns, gorduras ou mudanças bruscas de cardápio. É frequente a necessidade de rações super premium monoproteicas, gastrointestinais ou alimentação natural (AN) orientada por nutrólogo, com suporte de probióticos.
          </p>
        </div>

        {/* Guia 2: Fanconi */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-800">
            <span className="text-lg">🧬</span>
            <h3 className="font-bold text-stone-800 text-sm">
              Síndrome de Fanconi & Teste de DNA
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Doença renal genética característica da raça onde os rins deixam de reabsorver nutrientes essenciais. O teste de DNA é padrão para cruzamentos responsáveis. Em cães suscetíveis, recomenda-se a medição periódica de glicose na urina com tiras reagentes simples a partir dos 2-3 anos.
          </p>
        </div>

        {/* Guia 3: IPSID e Fígado */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-800">
            <span className="text-lg">🩺</span>
            <h3 className="font-bold text-stone-800 text-sm">
              IPSID e Acompanhamento Hepático
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            A doença imunoproliferativa do intestino delgado e elevações nas enzimas hepáticas requerem exames de sangue anuais e ultrassonografia. A detecção precoce permite manejo clínico eficaz.
          </p>
        </div>
      </div>

      {/* ── Cães com Diagnósticos Compartilhados pela Comunidade ── */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-800">
                Casos Compartilhados por Tutores
              </h2>
              <p className="text-[11px] text-stone-400">
                Troca de experiências entre quem convive com o manejo
              </p>
            </div>
          </div>
        </div>

        {/* Filtro de Categoria */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('todas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategoryFilter === 'todas'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas ({sharedDogsList.length})
          </button>
          {CONDICOES_PREDEFINIDAS.map((item) => (
            <button
              key={item.categoria}
              type="button"
              onClick={() => setSelectedCategoryFilter(item.categoria)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategoryFilter === item.categoria
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item.titulo.split('/')[0].trim()}
            </button>
          ))}
        </div>

        {/* Lista de cães */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sharedDogsList.length === 0 ? (
          <div className="py-8 text-center text-stone-400 flex flex-col items-center gap-2">
            <span className="text-3xl">🐾</span>
            <p className="text-xs">
              Nenhum relato público registrado para este filtro no momento.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sharedDogsList.map(({ dog, condicao }, index) => {
              const cfg =
                STATUS_SAUDE_CONFIG[condicao.status] ?? STATUS_SAUDE_CONFIG.controlado;

              return (
                <Link
                  key={`${dog.id}-${condicao.categoria}-${index}`}
                  href={`/basenjis/${dog.id}`}
                  className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/70 hover:bg-stone-100/80 active:scale-[0.99] transition-all flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden bg-amber-100 shrink-0 border border-amber-200">
                        {dog.foto_url ? (
                          <Image
                            src={dog.foto_url}
                            alt={dog.nome}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base">
                            🐕
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-stone-800 text-sm truncate group-hover:text-amber-800 transition-colors">
                          {dog.nome}
                        </h3>
                        {dog.profiles?.cidade && (
                          <div className="flex items-center gap-1 text-[11px] text-stone-400 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>
                              {dog.profiles.cidade}, {dog.profiles.estado}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </div>
                  </div>

                  <div className="pt-1 border-t border-stone-200/50">
                    <span className="text-xs font-bold text-stone-700">
                      {condicao.titulo}
                    </span>
                    {condicao.descricao && (
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                        “{condicao.descricao}”
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Convite para Adicionar Dados do Cão ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-200" />
          <h3 className="font-bold text-base">Ajude a Fortalecer o Censo</h3>
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed">
          Seu Basenji tem alguma intolerância alimentar, histórico de saúde ou manejo que deu certo? Adicione nas informações de saúde do perfil dele para ajudar outros tutores que passam pelo mesmo desafio.
        </p>
        <Link
          href="/profile"
          className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
        >
          <span>Ir para meus cães</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
