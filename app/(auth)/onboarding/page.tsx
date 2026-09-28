'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Loader2 } from 'lucide-react';
import { ESTADOS_BR } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cidade.trim() || !estado) {
      setError('Por favor, preencha cidade e estado.');
      return;
    }

    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cidade: cidade.trim(), estado })
      .eq('id', user.id);

    if (updateError) {
      setError('Erro ao salvar. Tente novamente.');
      setLoading(false);
      return;
    }

    router.push('/feed');
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl p-7 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
            <MapPin className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-stone-800">Onde você está?</h1>
          <p className="text-sm text-stone-500 text-center">
            Informe sua localização para encontrar Basenjis e eventos perto de você.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            >
              <option value="">Selecione o estado</option>
              {ESTADOS_BR.map(({ sigla, nome }) => (
                <option key={sigla} value={sigla}>
                  {nome} ({sigla})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: São Paulo"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold py-4 rounded-2xl transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Salvando...' : 'Começar'}
          </button>
        </form>
      </div>
    </div>
  );
}
