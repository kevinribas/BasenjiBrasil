// ─── Idade amigável a partir de data_nasc ────────────────────────────────────

/**
 * Calcula a idade de um Basenji de forma amigável.
 * Retorna null se data_nasc for nulo/undefined.
 *
 * Exemplos:
 *   "3 semanas" | "4 meses" | "1 ano" | "3 anos"
 */
export function calcularIdade(dataNasc: string | null | undefined): string | null {
  if (!dataNasc) return null;

  const nasc = new Date(dataNasc);
  if (isNaN(nasc.getTime())) return null;

  const hoje = new Date();
  // Zera horário para comparação apenas por data
  hoje.setHours(0, 0, 0, 0);
  nasc.setHours(0, 0, 0, 0);

  const diffMs = hoje.getTime() - nasc.getTime();
  if (diffMs < 0) return null; // data futura, ignora

  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 7) {
    return diffDias === 1 ? '1 dia' : `${diffDias} dias`;
  }
  if (diffDias < 30) {
    const semanas = Math.floor(diffDias / 7);
    return semanas === 1 ? '1 semana' : `${semanas} semanas`;
  }

  // Cálculo preciso de meses/anos usando diferença de calendário
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  if (hoje.getDate() < nasc.getDate()) meses--;
  if (meses < 0) { anos--; meses += 12; }

  const totalMeses = anos * 12 + meses;

  if (totalMeses < 12) {
    return totalMeses === 1 ? '1 mês' : `${totalMeses} meses`;
  }
  return anos === 1 ? '1 ano' : `${anos} anos`;
}

// ─── Helpers de Supabase Storage ─────────────────────────────────────────────

/**
 * Extrai o path relativo de uma URL pública do Supabase Storage.
 * Input:  "https://xxx.supabase.co/storage/v1/object/public/basenjis/user-id/foto.jpg"
 * Output: "user-id/foto.jpg"
 */
export function extrairPathStorage(
  publicUrl: string,
  bucket: string = 'basenjis'
): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  } catch {
    return null;
  }
}

// ─── Canvas crop ─────────────────────────────────────────────────────────────

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Gera um Blob recortado a partir de um <img> src e uma área de pixel crop.
 * Retorna WebP com qualidade 0.88 como formato preferido (fallback JPEG).
 */
export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputMime: 'image/webp' | 'image/jpeg' = 'image/webp',
  quality = 0.88
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else if (outputMime !== 'image/jpeg') {
          canvas.toBlob(
            (fallbackBlob) => {
              if (fallbackBlob) resolve(fallbackBlob);
              else reject(new Error('canvas.toBlob retornou null'));
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('canvas.toBlob retornou null'));
        }
      },
      outputMime,
      quality
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}
