'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import ImageCropper from '@/components/ui/ImageCropper';

type CropperState = { open: false } | { open: true; rawSrc: string };

export default function NewBasenjiPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState<'macho' | 'femea'>('macho');
  const [cor, setCor] = useState('');
  const [bio, setBio] = useState('');
  const [dataNasc, setDataNasc] = useState('');

  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropperState, setCropperState] = useState<CropperState>({ open: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ao selecionar arquivo → abre o cropper
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const rawSrc = URL.createObjectURL(file);
    setCropperState({ open: true, rawSrc });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleCropComplete = useCallback((blob: Blob, preview: string) => {
    setPhotoBlob(blob);
    setPhotoPreview(preview);
    setCropperState({ open: false });
  }, []);

  const handleCropCancel = useCallback(() => setCropperState({ open: false }), []);

  function removePhoto() {
    setPhotoBlob(null);
    setPhotoPreview(null);
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

    // ── Upload de foto (blob recortado) ──────────────────────────────────
    if (photoBlob) {
      const storagePath = `${user.id}/${Date.now()}-${nome.trim().replace(/\s+/g, '_')}.webp`;

      console.log('[Upload] Iniciando upload para:', storagePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('basenjis')
        .upload(storagePath, photoBlob, { upsert: true, contentType: 'image/webp' });

      if (uploadError) {
        console.error('[Upload] Erro ao enviar foto:', uploadError);
        setError(`Falha no upload da foto: ${uploadError.message}. Verifique se o bucket "basenjis" existe e está público.`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('basenjis').getPublicUrl(uploadData.path);
      foto_url = urlData.publicUrl;
      console.log('[Upload] foto_url gerada:', foto_url);
    }
    // ────────────────────────────────────────────────────────────────────

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
    <>
      {/* Cropper full-screen */}
      {cropperState.open && (
        <ImageCropper
          imageSrc={cropperState.rawSrc}
          aspect={1}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Cadastrar Basenji</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            {photoPreview ? (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-md">
                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 flex items-end justify-center gap-2 pb-2 bg-gradient-to-t from-black/50 to-transparent">
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center gap-1 text-[11px] text-white bg-black/40 px-2 py-1 rounded-lg cursor-pointer"
                  >
                    <Camera className="w-3 h-3" /> Trocar
                  </label>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="flex items-center gap-1 text-[11px] text-white bg-red-500/80 px-2 py-1 rounded-lg"
                  >
                    <X className="w-3 h-3" /> Remover
                  </button>
                </div>
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
            <p className="text-xs text-stone-400">
              Selecione uma foto para recortar e enquadrar
            </p>
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
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
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
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
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
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm"
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
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none text-sm"
            />
            <p className="text-xs text-stone-400 text-right mt-1">{bio.length}/280</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

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
    </>
  );
}
