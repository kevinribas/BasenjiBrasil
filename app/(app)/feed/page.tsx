'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Basenji, ESTADOS_BR } from '@/types';
import BasenjiCard from '@/components/features/feed/BasenjiCard';
import { SlidersHorizontal, X } from 'lucide-react';

export default function FeedPage() {
  const supabase = createClient();
  const [basenjis, setBasenjis] = useState<Basenji[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchBasenjis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado, filterCidade]);

  async function fetchBasenjis() {
    setLoading(true);

    // Usa alias explícito 'profiles:dono_id' para o join pela FK correta
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Feed] Erro ao buscar basenjis:', error);
      setLoading(false);
      return;
    }

    let result = (data as Basenji[]) ?? [];

    // Filtragem client-side: o PostgREST não suporta .eq() em colunas
    // de tabelas relacionadas (joined) no nível da query pai.
    if (filterEstado) {
      result = result.filter(
        (b) => b.profiles?.estado === filterEstado
      );
    }
    if (filterCidade) {
      const termo = filterCidade.toLowerCase();
      result = result.filter(
        (b) => b.profiles?.cidade?.toLowerCase().includes(termo)
      );
    }

    setBasenjis(result);
    setLoading(false);
  }

  function clearFilters() {
    setFilterEstado('');
    setFilterCidade('');
  }

  const hasFilters = filterEstado || filterCidade;

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-700">
          {hasFilters ? 'Basenjis filtrados' : 'Todos os Basenjis'}
        </h2>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full"
            >
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
              showFilter ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1 block">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todos os estados</option>
              {ESTADOS_BR.map(({ sigla, nome }) => (
                <option key={sigla} value={sigla}>{nome} ({sigla})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1 block">Cidade</label>
            <input
              type="text"
              value={filterCidade}
              onChange={(e) => setFilterCidade(e.target.value)}
              placeholder="Buscar por cidade..."
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : basenjis.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🐕</p>
          <p className="font-medium">Nenhum Basenji encontrado</p>
          {hasFilters && <p className="text-sm mt-1">Tente remover os filtros</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {basenjis.map((basenji) => (
            <BasenjiCard key={basenji.id} basenji={basenji} />
          ))}
        </div>
      )}
    </div>
  );
}
