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

// ─── Tempo relativo amigável ─────────────────────────────────────────────────

/**
 * Converte data ISO em formato relativo amigável em português.
 * Exemplos: "agora mesmo", "há 5 min", "há 2 horas", "ontem", "há 3 dias".
 */
export function formatarTempoRelativo(isoString: string): string {
  const data = new Date(isoString);
  if (isNaN(data.getTime())) return '';

  const agora = new Date();
  const diffSegundos = Math.floor((agora.getTime() - data.getTime()) / 1000);

  if (diffSegundos < 60) {
    return 'agora mesmo';
  }
  const diffMinutos = Math.floor(diffSegundos / 60);
  if (diffMinutos < 60) {
    return `há ${diffMinutos} min`;
  }
  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) {
    return diffHoras === 1 ? 'há 1 hora' : `há ${diffHoras}h`;
  }
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) {
    return 'ontem';
  }
  if (diffDias < 7) {
    return `há ${diffDias} dias`;
  }
  const diffSemanas = Math.floor(diffDias / 7);
  if (diffSemanas < 4) {
    return diffSemanas === 1 ? 'há 1 semana' : `há ${diffSemanas} sem`;
  }
  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses < 12) {
    return diffMeses === 1 ? 'há 1 mês' : `há ${diffMeses} meses`;
  }
  return 'há mais de 1 ano';
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
    const raw = publicUrl.slice(idx + marker.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

/**
 * Gera um caminho seguro de arquivo para o Supabase Storage.
 * Garante chaves válidas sem acentos, espaços ou caracteres especiais,
 * combinando timestamp, UUID e sanitização rigorosa.
 */
export function gerarStoragePath(
  userId: string,
  nomeOuArquivo?: string | null,
  ext: string = 'webp'
): string {
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 10);

  let sanitizedSlug = '';
  if (nomeOuArquivo) {
    const rawName = nomeOuArquivo.includes('.')
      ? nomeOuArquivo.slice(0, nomeOuArquivo.lastIndexOf('.'))
      : nomeOuArquivo;
    sanitizedSlug = rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')   // substitui símbolos e espaços por _
      .replace(/_+/g, '_')            // colapsa múltiplos underlines
      .replace(/^_+|_+$/g, '')        // remove underlines das pontas
      .slice(0, 30);
  }

  const fileName = sanitizedSlug
    ? `${Date.now()}-${uniqueId}-${sanitizedSlug}.${ext}`
    : `${Date.now()}-${uniqueId}.${ext}`;

  return `${userId}/${fileName}`;
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
