'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ESTADOS_BR, type Profile } from '@/types';
import { extrairPathStorage, gerarStoragePath } from '@/lib/utils';
import ImageCropper from '@/components/ui/ImageCropper';
import {
  ArrowLeft,
  Camera,
  Loader2,
  Check,
  User,
  MapPin,
  Mail,
} from 'lucide-react';

type CropperState =
  | { open: false }
  | { open: true; rawSrc: string };

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Estados dos dados
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Campos do formulário
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // ── Foto / Avatar
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropperState, setCropperState] = useState<CropperState>({ open: false });

  // ── Feedback
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Carrega dados atuais do perfil
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError || !data) {
        console.error('[EditProfile] Erro ao carregar perfil:', fetchError);
        setError('Não foi possível carregar as informações do seu perfil.');
      } else {
        setProfile(data);
        setNome(data.nome || '');
        setCidade(data.cidade || '');
        setEstado(data.estado || '');
        setPhotoPreview(data.avatar_url || null);
      }

      setLoading(false);
    }

    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ── Seleção e recorte de nova foto
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const rawSrc = URL.createObjectURL(file);
    setCropperState({ open: true, rawSrc });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleCropComplete = useCallback((blob: Blob, preview: string, file: File) => {
    const croppedFile = file || new File([blob], 'avatar.webp', { type: 'image/webp' });
    setPhotoBlob(blob);
    setPhotoFile(croppedFile);
    setPhotoPreview(preview);
    setCropperState({ open: false });
  }, []);

  const handleCropCancel = useCallback(() => {
    setCropperState({ open: false });
  }, []);

  // ── Salvar alterações
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (!cidade.trim() || !estado) {
      setError('Por favor, informe cidade e estado.');
      return;
    }
    if (!userId) return;

    setSaving(true);
    setError('');

    let novoAvatarUrl = profile?.avatar_url ?? null;

    // 1️⃣ Se uma nova foto foi selecionada, faz o upload para o Storage
    const fileToUpload =
      photoFile ||
      (photoBlob ? new File([photoBlob], 'avatar.webp', { type: 'image/webp' }) : null);

    if (fileToUpload) {
      // Remove foto anterior do Storage (best-effort se pertencer ao bucket basenjis)
      if (profile?.avatar_url) {
        const oldPath = extrairPathStorage(profile.avatar_url, 'basenjis');
        if (oldPath) {
          await supabase.storage.from('basenjis').remove([oldPath]);
        }
      }

      const storagePath = gerarStoragePath(userId, 'avatar', 'webp');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('basenjis')
        .upload(storagePath, fileToUpload, {
          upsert: true,
          contentType: 'image/webp',
        });

      if (uploadError) {
        console.error('[EditProfile] Erro ao enviar avatar:', uploadError);
        setError(`Falha ao salvar a nova foto: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('basenjis')
        .getPublicUrl(uploadData.path);

      novoAvatarUrl = urlData.publicUrl;
    }

    // 2️⃣ Atualiza a tabela profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nome: nome.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        avatar_url: novoAvatarUrl,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[EditProfile] Erro ao atualizar perfil:', updateError);
      setError(`Erro ao salvar dados: ${updateError.message}`);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/perfil');
    }, 800);
  }

  // ── Skeleton de carregamento
  if (loading) {
    return (
      <div className="px-4 pt-3 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-24 h-24 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 w-28 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-16 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          <div className="h-16 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          <div className="h-16 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          <div className="h-14 bg-amber-200 rounded-2xl animate-pulse mt-2" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de recorte de imagem full-screen */}
      {cropperState.open && (
        <ImageCropper
          imageSrc={cropperState.rawSrc}
          aspect={1}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="px-4 pt-3 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/perfil"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors shrink-0"
            aria-label="Voltar para o perfil"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-stone-800 text-lg leading-tight">Editar Perfil</h1>
            <p className="text-xs text-stone-400">Atualize seus dados e foto pública</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Seletor de Foto de Perfil (Avatar) */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              id="avatar-upload"
            />
            <div className="relative group cursor-pointer">
              <label
                htmlFor="avatar-upload"
                className="block relative w-24 h-24 rounded-full overflow-hidden bg-amber-100 border-4 border-white shadow-lg cursor-pointer"
              >
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt={nome || 'Avatar'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    👤
                  </div>
                )}
                {/* Overlay hover/touch */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </label>

              {/* Botão circular de câmera sobreposto */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer active:scale-95 transition-all"
                title="Trocar foto"
              >
                <Camera className="w-4 h-4" />
              </label>
            </div>

            <label
              htmlFor="avatar-upload"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer pt-1"
            >
              Trocar foto de perfil
            </label>
          </div>

          {/* Card dos Campos */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                maxLength={80}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
              />
            </div>

            {/* Email (somente leitura) */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full border border-stone-200/60 rounded-xl px-4 py-3 text-stone-400 bg-stone-100 text-sm cursor-not-allowed select-none"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Vinculado à sua conta de login.
              </p>
            </div>

            {/* Localização: Estado & Cidade */}
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                Localização <span className="text-red-400">*</span>
              </span>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Estado (UF)
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
                >
                  <option value="">Selecione seu estado</option>
                  {ESTADOS_BR.map(({ sigla, nome: nomeEstado }) => (
                    <option key={sigla} value={sigla}>
                      {nomeEstado} ({sigla})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Nome da sua cidade"
                  required
                  maxLength={100}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Mensagens de Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Perfil atualizado com sucesso! Redirecionando…</span>
            </div>
          )}

          {/* Botão de Salvar */}
          <button
            type="submit"
            disabled={saving || success}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-md transition-all duration-150 text-base"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-5 h-5" />
                <span>Salvo!</span>
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
