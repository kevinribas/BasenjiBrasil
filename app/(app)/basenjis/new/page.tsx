'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ESTADOS_BR } from '@/types';
import { Camera, Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function NewBasenjiPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState<'macho' | 'femea'>('macho');
  const [cor, setCor] = useState('');
  const [bio, setBio] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !cor.trim()) {
      setError('Nome e cor são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    let foto_url: string | null = null;

    // ── Upload de foto ──────────────────────────────────────────
    if (photoFile) {
      // Sanitiza nome: remove espaços e caracteres problemáticos
      const safeName = photoFile.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      const ext = safeName.split('.').pop() ?? 'jpg';
      const storagePath = `${user.id}/${Date.now()}-${safeName}`;

      console.log('[Upload] Iniciando upload para:', storagePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('basenjis')
        .upload(storagePath, photoFile, {
          upsert: true,
          contentType: photoFile.type,
        });

      if (uploadError) {
        // Falha de upload → aborta o cadastro e avisa o usuário
        console.error('[Upload] Erro ao enviar foto:', uploadError);
        setError(`Falha no upload da foto: ${uploadError.message}. Verifique se o bucket "basenjis" existe e está público.`);
        setLoading(false);
        return;
      }

      // Usa o path confirmado pelo Supabase (uploadData.path) para gerar a URL pública
      const { data: urlData } = supabase.storage
        .from('basenjis')
        .getPublicUrl(uploadData.path);

      foto_url = urlData.publicUrl;
      console.log('[Upload] foto_url gerada:', foto_url);
    }
    // ────────────────────────────────────────────────────────────

    const { error: insertError } = await supabase.from('basenjis').insert({
      dono_id: user.id,
      nome: nome.trim(),
      sexo,
      cor: cor.trim(),
      bio: bio.trim() || null,
      data_nasc: dataNasc || null,
      foto_url,
    });

    if (insertError) {
      console.error('[Insert] Erro ao cadastrar basenji:', insertError);
      setError(`Erro ao cadastrar: ${insertError.message}`);
      setLoading(false);
      return;
    }

    router.push('/feed');
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <h2 className="text-base font-semibold text-stone-700 mb-4">Cadastrar Basenji</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Photo Upload */}
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            id="photo-upload"
          />
          {photoPreview ? (
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden">
              <Image src={photoPreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo-upload"
              className="w-32 h-32 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center gap-2 cursor-pointer active:bg-amber-100 transition-colors"
            >
              <Camera className="w-8 h-8 text-amber-400" />
              <span className="text-xs text-amber-500 font-medium">Adicionar foto</span>
            </label>
          )}
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do seu Basenji"
            required
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        {/* Sexo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Sexo *</label>
          <div className="grid grid-cols-2 gap-2">
            {(['macho', 'femea'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSexo(s)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95
                  ${sexo === s
                    ? s === 'macho'
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
              >
                {s === 'macho' ? '♂ Macho' : '♀ Fêmea'}
              </button>
            ))}
          </div>
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Cor / Pelagem *</label>
          <input
            type="text"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            placeholder="Ex: Preto e branco, Vermelho..."
            required
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        {/* Data de nascimento */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Data de Nascimento</label>
          <input
            type="date"
            value={dataNasc}
            onChange={(e) => setDataNasc(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre ele/ela..."
            rows={3}
            maxLength={280}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
          />
          <p className="text-xs text-stone-400 text-right mt-1">{bio.length}/280</p>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold py-4 rounded-2xl transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Cadastrando...' : 'Cadastrar Basenji 🐕'}
        </button>
      </form>
    </div>
  );
}
