'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ESTADOS_BR, type Basenji, type CondicaoSaude } from '@/types';
import { extrairPathStorage, gerarStoragePath } from '@/lib/utils';
import ImageCropper from '@/components/ui/ImageCropper';
import HealthConditionsEditor from '@/components/features/basenjis/HealthConditionsEditor';
import {
  ArrowLeft, Camera, Loader2, Trash2, X, AlertTriangle,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────
type CropperState =
  | { open: false }
  | { open: true; rawSrc: string };

// ─── Página ──────────────────────────────────────────────────────────────────
export default function EditBasenjiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Dados carregados
  const [basenji, setBasenji] = useState<Basenji | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ── Campos do formulário
  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState<'macho' | 'femea'>('macho');
  const [cor, setCor] = useState('');
  const [bio, setBio] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [condicoesSaude, setCondicoesSaude] = useState<CondicaoSaude[]>([]);

  // ── Foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropperState, setCropperState] = useState<CropperState>({ open: false });

  // ── UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Carrega dados do Basenji ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setCurrentUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from('basenjis')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        console.error('[EditBasenji] Não encontrado:', fetchError);
        router.push('/profile');
        return;
      }

      // Segurança: só dono pode editar
      if (data.dono_id !== user.id) {
        router.push('/feed');
        return;
      }

      const b = data as Basenji;
      setBasenji(b);
      setNome(b.nome);
      setSexo(b.sexo);
      setCor(b.cor);
      setBio(b.bio ?? '');
      setDataNasc(b.data_nasc ?? '');
      setPhotoPreview(b.foto_url ?? null);
      setCondicoesSaude(b.condicoes_saude ?? []);
      setLoadingData(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Seleciona nova foto (abre cropper) ───────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const rawSrc = URL.createObjectURL(file);
    setCropperState({ open: true, rawSrc });
    // Reset input para permitir re-selecionar o mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleCropComplete = useCallback((blob: Blob, preview: string, file: File) => {
    const croppedFile = file || new File([blob], 'dog-photo.webp', { type: 'image/webp' });
    setPhotoBlob(blob);
    setPhotoFile(croppedFile);
    setPhotoPreview(preview);
    setCropperState({ open: false });
  }, []);

  const handleCropCancel = useCallback(() => {
    setCropperState({ open: false });
  }, []);

  function removePhoto() {
    setPhotoBlob(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Salvar edição ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !cor.trim()) { setError('Nome e cor são obrigatórios.'); return; }
    if (!currentUserId || !basenji) return;

    setSaving(true);
    setError('');

    let foto_url = basenji.foto_url; // mantém a atual por padrão

    // Fez upload de nova foto (arquivo File / Blob recortado)
    const fileToUpload = photoFile || (photoBlob ? new File([photoBlob], 'dog-photo.webp', { type: 'image/webp' }) : null);

    if (fileToUpload) {
      // Remove foto antiga do Storage (best-effort)
      if (basenji.foto_url) {
        const oldPath = extrairPathStorage(basenji.foto_url);
        if (oldPath) {
          await supabase.storage.from('basenjis').remove([oldPath]);
        }
      }

      const storagePath = gerarStoragePath(currentUserId, nome, 'webp');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('basenjis')
        .upload(storagePath, fileToUpload, { upsert: true, contentType: 'image/webp' });

      if (uploadError) {
        console.error('[EditBasenji] Upload falhou:', uploadError);
        setError(`Falha no upload da foto: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('basenjis').getPublicUrl(uploadData.path);
      foto_url = urlData.publicUrl;
    }

    // Removeu a foto sem escolher nova
    if (!photoPreview && !fileToUpload) {
      foto_url = null;
    }

    const { error: updateError } = await supabase
      .from('basenjis')
      .update({
        nome: nome.trim(),
        sexo,
        cor: cor.trim(),
        bio: bio.trim() || null,
        data_nasc: dataNasc || null,
        foto_url,
        condicoes_saude: condicoesSaude,
      })
      .eq('id', id)
      .eq('dono_id', currentUserId); // garante RLS no cliente também

    if (updateError) {
      console.error('[EditBasenji] Update falhou:', updateError);
      setError(`Erro ao salvar: ${updateError.message}`);
      setSaving(false);
      return;
    }

    router.push('/profile');
  }

  // ── Excluir Basenji ───────────────────────────────────────────────────────
  async function handleDelete() {
    if (!currentUserId || !basenji) return;
    setDeleting(true);

    // Remove foto do Storage (best-effort)
    if (basenji.foto_url) {
      const path = extrairPathStorage(basenji.foto_url);
      if (path) await supabase.storage.from('basenjis').remove([path]);
    }

    const { error: deleteError } = await supabase
      .from('basenjis')
      .delete()
      .eq('id', id)
      .eq('dono_id', currentUserId);

    if (deleteError) {
      console.error('[EditBasenji] Delete falhou:', deleteError);
      setError(`Erro ao excluir: ${deleteError.message}`);
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }

    router.push('/profile');
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="h-8 w-32 bg-stone-200 rounded-lg animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!basenji) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Cropper modal (full-screen) */}
      {cropperState.open && (
        <ImageCropper
          imageSrc={cropperState.rawSrc}
          aspect={1}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-8">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-stone-800 text-lg text-center">
                Excluir perfil de {basenji.nome}?
              </h3>
              <p className="text-sm text-stone-500 text-center">
                Esta ação é irreversível. O perfil e a foto serão removidos permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm active:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:bg-red-600"
              >
                {deleting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo…</>
                  : <><Trash2 className="w-4 h-4" /> Excluir</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de edição */}
      <div className="px-4 pt-3 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-stone-800 text-lg leading-tight">Editar Basenji</h1>
              <p className="text-xs text-stone-400">{basenji.nome}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 active:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Foto ── */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-edit"
          />
          <div className="flex flex-col items-center gap-2">
            {photoPreview ? (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={photoPreview}
                  alt={nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 128px"
                />
                <div className="absolute inset-0 flex items-end justify-center gap-2 pb-2 bg-gradient-to-t from-black/50 to-transparent">
                  <label
                    htmlFor="photo-edit"
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
                htmlFor="photo-edit"
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center gap-2 cursor-pointer active:bg-amber-100 transition-colors"
              >
                <Camera className="w-8 h-8 text-amber-400" />
                <span className="text-xs text-amber-500 font-medium">Adicionar foto</span>
              </label>
            )}
            <p className="text-xs text-stone-400">
              Toque na foto para abrir o ajuste de enquadramento
            </p>
          </div>

          {/* ── Nome ── */}
          <Field label="Nome" required>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do Basenji"
              required
              className={input}
            />
          </Field>

          {/* ── Sexo ── */}
          <Field label="Sexo" required>
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
          </Field>

          {/* ── Cor ── */}
          <Field label="Cor / Pelagem" required>
            <input
              type="text"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              placeholder="Ex: Preto e branco, Vermelho..."
              required
              className={input}
            />
          </Field>

          {/* ── Data de Nascimento ── */}
          <Field label="Data de Nascimento">
            <input
              type="date"
              value={dataNasc}
              onChange={(e) => setDataNasc(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={input}
            />
          </Field>

          {/* ── Bio ── */}
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre ele/ela..."
              rows={3}
              maxLength={280}
              className={`${input} resize-none`}
            />
            <p className="text-xs text-stone-400 text-right mt-1">{bio.length}/280</p>
          </Field>

          {/* ── Saúde & Cuidados (Opcional) ── */}
          <HealthConditionsEditor
            condicoes={condicoesSaude}
            onChange={setCondicoesSaude}
          />

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
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl shadow-md transition-all duration-150"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</>
              : '✓ Salvar alterações'
            }
          </button>

        </form>
      </div>
    </>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const input =
  'w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 bg-stone-50 ' +
  'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-2">
      <label className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
