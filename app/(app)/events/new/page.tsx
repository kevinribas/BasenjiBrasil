'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ESTADOS_BR } from '@/types';
import { ArrowLeft, CalendarDays, Loader2, MapPin, AlignLeft, Tag } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna o datetime mínimo permitido no input (agora + 30 min, arredondado). */
function getMinDatetime(): string {
  const d = new Date(Date.now() + 30 * 60 * 1000);
  d.setSeconds(0, 0);
  // datetime-local exige "YYYY-MM-DDTHH:mm"
  return d.toISOString().slice(0, 16);
}

/** Formata Date para o valor padrão do input datetime-local. */
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();

  // Campos do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [dataHora, setDataHora] = useState('');

  // Estados da UI
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Pré-popula cidade/estado do perfil do tutor
  useEffect(() => {
    async function prefillProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('cidade, estado')
        .eq('id', user.id)
        .single();

      if (profile?.estado) setEstado(profile.estado);
      if (profile?.cidade) setCidade(profile.cidade);

      // Sugestão de data/hora: amanhã às 10h
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(10, 0, 0, 0);
      setDataHora(toDatetimeLocal(amanha));

      setLoadingProfile(false);
    }

    prefillProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo.trim()) { setError('O título do evento é obrigatório.'); return; }
    if (!local.trim())  { setError('Informe o local / ponto de referência.'); return; }
    if (!cidade.trim()) { setError('Informe a cidade do evento.'); return; }
    if (!estado)        { setError('Selecione o estado.'); return; }
    if (!dataHora)      { setError('Informe a data e hora do evento.'); return; }

    const dataISO = new Date(dataHora).toISOString();
    if (new Date(dataISO) <= new Date()) {
      setError('A data/hora do evento deve ser no futuro.');
      return;
    }

    if (!userId) { router.push('/login'); return; }

    setLoading(true);
    setError('');

    // 1️⃣ Insere o evento
    const { data: novoEvento, error: insertError } = await supabase
      .from('events')
      .insert({
        criador_id: userId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        local: local.trim(),
        cidade: cidade.trim(),
        estado,
        data_hora: dataISO,
      })
      .select('id')
      .single();

    if (insertError || !novoEvento) {
      console.error('[NewEvent] Erro ao criar evento:', insertError);
      setError(`Erro ao criar encontro: ${insertError?.message ?? 'tente novamente.'}`);
      setLoading(false);
      return;
    }

    // 2️⃣ Registra o criador como confirmado (going)
    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .insert({
        evento_id: novoEvento.id,
        usuario_id: userId,
        status: 'going',
      });

    if (attendeeError) {
      // Não bloqueia o fluxo — o evento foi criado com sucesso
      console.warn('[NewEvent] Aviso: não foi possível confirmar presença automática:', attendeeError);
    }

    router.push('/events');
  }

  // ── Skeleton enquanto carrega o perfil ───────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="h-8 w-32 bg-stone-200 rounded-lg animate-pulse" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-3 pb-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/events"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors shrink-0"
          aria-label="Voltar para encontros"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-stone-800 text-lg leading-tight">Novo Encontro</h1>
          <p className="text-xs text-stone-400">Organize um encontro para a comunidade</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* ── Título ── */}
        <FormField
          label="Título do Evento"
          required
          icon={<Tag className="w-4 h-4 text-amber-500" />}
        >
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder='Ex: Encontro Basenji no Parcão'
            maxLength={100}
            className={inputCls}
          />
          <CharCount current={titulo.length} max={100} />
        </FormField>

        {/* ── Descrição ── */}
        <FormField
          label="Descrição"
          icon={<AlignLeft className="w-4 h-4 text-amber-500" />}
          hint="Dicas de coleira, regras do local, etc."
        >
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o encontro, recomendações importantes, como coleiras obrigatórias, guias duplas..."
            rows={4}
            maxLength={500}
            className={`${inputCls} resize-none`}
          />
          <CharCount current={descricao.length} max={500} />
        </FormField>

        {/* ── Data e Hora ── */}
        <FormField
          label="Data e Hora"
          required
          icon={<CalendarDays className="w-4 h-4 text-amber-500" />}
        >
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            min={getMinDatetime()}
            className={inputCls}
          />
        </FormField>

        {/* ── Local ── */}
        <FormField
          label="Local / Ponto de Referência"
          required
          icon={<MapPin className="w-4 h-4 text-amber-500" />}
          hint="Nome do parque, praça ou endereço completo"
        >
          <input
            type="text"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder='Ex: Parque Moinhos de Vento, próximo ao lago'
            maxLength={200}
            className={inputCls}
          />
        </FormField>

        {/* ── Estado & Cidade ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Localização do Evento
          </p>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Estado <span className="text-red-400">*</span>
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Selecione o estado</option>
              {ESTADOS_BR.map(({ sigla, nome }) => (
                <option key={sigla} value={sigla}>
                  {nome} ({sigla})
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Cidade <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Nome da cidade"
              maxLength={100}
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Erro ── */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-md transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando encontro...
            </>
          ) : (
            <>
              <CalendarDays className="w-4 h-4" />
              Criar Encontro 🐕
            </>
          )}
        </button>

      </form>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 ' +
  'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 ' +
  'transition text-sm';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({ label, required, hint, icon, children }: FormFieldProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <label className="text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      </div>
      {hint && <p className="text-xs text-stone-400 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function CharCount({ current, max }: { current: number; max: number }) {
  const near = current >= max * 0.85;
  return (
    <p className={`text-xs text-right -mt-1 ${near ? 'text-amber-500' : 'text-stone-300'}`}>
      {current}/{max}
    </p>
  );
}
