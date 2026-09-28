'use client';

import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';
import { getCroppedBlob, type PixelCrop } from '@/lib/utils';
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageCropperProps {
  /** URL do objeto (createObjectURL) da imagem selecionada */
  imageSrc: string;
  /** Razão de aspecto do recorte. Padrão 1 (quadrado) */
  aspect?: number;
  onCropComplete: (blob: Blob, previewUrl: string, file: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  aspect = 1,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChangeHandler = useCallback(
    (location: { x: number; y: number }) => setCrop(location),
    []
  );

  const onCropCompleteHandler = useCallback(
    (_: unknown, pixels: PixelCrop) => setCroppedAreaPixels(pixels),
    []
  );

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, 'image/webp', 0.88);
      const croppedFile = new File([blob], 'dog-photo.webp', { type: 'image/webp' });
      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(blob, previewUrl, croppedFile);
    } catch (err) {
      console.error('[ImageCropper] Erro ao recortar:', err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    /* Overlay full-screen */
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-white/80 text-sm active:text-white"
        >
          <X className="w-5 h-5" /> Cancelar
        </button>
        <span className="text-white font-semibold text-sm">Ajustar foto</span>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className="flex items-center gap-1.5 text-amber-400 font-semibold text-sm disabled:opacity-50 active:text-amber-300"
        >
          {processing ? (
            <span className="text-xs">Processando…</span>
          ) : (
            <><Check className="w-5 h-5" /> Usar</>
          )}
        </button>
      </div>

      {/* Crop area — fills remaining space */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChangeHandler}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
          showGrid={false}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid #d97706' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 px-6 py-4 shrink-0">
        <ZoomOut className="w-5 h-5 text-white/60 shrink-0" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-amber-500"
          aria-label="Zoom"
        />
        <ZoomIn className="w-5 h-5 text-white/60 shrink-0" />
      </div>

      <p className="text-center text-white/40 text-xs pb-4 shrink-0">
        Arraste para enquadrar · Pinça ou arraste o controle para dar zoom
      </p>
    </div>
  );
}
