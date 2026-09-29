'use client';

import { useState } from 'react';
import {
  CondicaoSaude,
  CategoriaSaude,
  StatusCondicaoSaude,
  CONDICOES_PREDEFINIDAS,
  STATUS_SAUDE_CONFIG,
} from '@/types';
import {
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface HealthConditionsEditorProps {
  condicoes: CondicaoSaude[];
  onChange: (novasCondicoes: CondicaoSaude[]) => void;
}

export default function HealthConditionsEditor({
  condicoes,
  onChange,
}: HealthConditionsEditorProps) {
  const [isOpen, setIsOpen] = useState(condicoes.length > 0);

  function isCategorySelected(categoria: CategoriaSaude): boolean {
    return condicoes.some((c) => c.categoria === categoria);
  }

  function handleTogglePredefinida(item: typeof CONDICOES_PREDEFINIDAS[number]) {
    if (isCategorySelected(item.categoria)) {
      // Remove
      onChange(condicoes.filter((c) => c.categoria !== item.categoria));
    } else {
      // Adiciona
      const nova: CondicaoSaude = {
        categoria: item.categoria,
        titulo: item.titulo,
        status: 'controlado',
        descricao: '',
        compartilhar_comunidade: true,
      };
      onChange([...condicoes, nova]);
      setIsOpen(true);
    }
  }

  function handleUpdateCondicao(index: number, updates: Partial<CondicaoSaude>) {
    const list = [...condicoes];
    list[index] = { ...list[index], ...updates };
    onChange(list);
  }

  function handleRemoveCondicao(index: number) {
    onChange(condicoes.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all">
      {/* ── Header Sanfonado ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/30 text-left hover:bg-emerald-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <HeartPulse className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-800 text-sm">
                Saúde & Cuidados
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                Opcional
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {condicoes.length === 0
                ? 'Relate sensibilidades ou condições comuns da raça'
                : `${condicoes.length} ${
                    condicoes.length === 1 ? 'condição informada' : 'condições informadas'
                  }`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-400">
          {condicoes.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              {condicoes.length}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </div>
      </button>

      {/* ── Conteúdo Aberto ── */}
      {isOpen && (
        <div className="p-4 border-t border-stone-100 flex flex-col gap-4">
          <div className="bg-emerald-50/60 rounded-xl p-3 text-xs text-emerald-900 border border-emerald-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              O Basenji possui particularidades como sensibilidade gastrointestinal,
              síndrome de Fanconi e alergias. Compartilhe observações para ajudar a comunidade!
            </span>
          </div>

          {/* Chips de seleção rápida */}
          <div>
            <span className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
              Toque para adicionar/remover:
            </span>
            <div className="flex flex-wrap gap-2">
              {CONDICOES_PREDEFINIDAS.map((item) => {
                const selected = isCategorySelected(item.categoria);
                return (
                  <button
                    key={item.categoria}
                    type="button"
                    onClick={() => handleTogglePredefinida(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all text-left ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm active:scale-95'
                        : 'bg-stone-50 text-stone-700 border-stone-200/90 hover:bg-stone-100 active:scale-95'
                    }`}
                  >
                    {selected ? (
                      <span className="text-white font-bold">✓</span>
                    ) : (
                      <Plus className="w-3 h-3 text-stone-400" />
                    )}
                    <span>{item.titulo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de condições ativas para preenchimento de detalhes */}
          {condicoes.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Detalhes das condições selecionadas:
              </span>

              {condicoes.map((cond, index) => {
                const statusCfg = STATUS_SAUDE_CONFIG[cond.status];
                return (
                  <div
                    key={`${cond.categoria}-${index}`}
                    className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/60 flex flex-col gap-3"
                  >
                    {/* Linha de título + botão remover */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {cond.categoria === 'outra' ? (
                          <input
                            type="text"
                            value={cond.titulo}
                            onChange={(e) =>
                              handleUpdateCondicao(index, { titulo: e.target.value })
                            }
                            placeholder="Nome da condição / particularidade"
                            className="w-full text-sm font-bold text-stone-800 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                        ) : (
                          <h4 className="text-sm font-bold text-stone-800 leading-snug">
                            {cond.titulo}
                          </h4>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCondicao(index)}
                        className="text-stone-400 hover:text-red-500 p-1 rounded-md transition-colors"
                        title="Remover condição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Seletor de Status */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                        Status atual:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {(
                          [
                            'em_tratamento',
                            'controlado',
                            'resolvido',
                            'preventivo',
                          ] as StatusCondicaoSaude[]
                        ).map((st) => {
                          const isCurrent = cond.status === st;
                          const cfg = STATUS_SAUDE_CONFIG[st];
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateCondicao(index, { status: st })}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                                isCurrent
                                  ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-emerald-500/20 shadow-xs font-bold`
                                  : 'bg-white text-stone-600 border-stone-200/70 hover:bg-stone-50'
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                        Observação breve (sintomas, ração que funcionou, exames):
                      </label>
                      <textarea
                        rows={2}
                        value={cond.descricao ?? ''}
                        onChange={(e) =>
                          handleUpdateCondicao(index, { descricao: e.target.value })
                        }
                        placeholder="Ex: Teve melhora com ração gastrointestinal e probiótico prescrito."
                        maxLength={300}
                        className="w-full text-xs text-stone-700 bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-stone-400 resize-none"
                      />
                    </div>

                    {/* Checkbox de compartilhamento comunitário */}
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={cond.compartilhar_comunidade}
                        onChange={(e) =>
                          handleUpdateCondicao(index, {
                            compartilhar_comunidade: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                      />
                      <span className="text-xs text-stone-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Permitir que outros tutores vejam essa informação para troca de experiências
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
