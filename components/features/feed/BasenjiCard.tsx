'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Basenji } from '@/types';
import { MapPin, Venus, Mars, Cake, Pencil } from 'lucide-react';
import { calcularIdade } from '@/lib/utils';

interface BasenjiCardProps {
  basenji: Basenji;
  /** ID do usuário logado — exibe botão de edição se for o dono */
  currentUserId?: string | null;
}

export default function BasenjiCard({ basenji, currentUserId }: BasenjiCardProps) {
  const profile = basenji.profiles;
  const idade = calcularIdade(basenji.data_nasc);
  const isDono = currentUserId != null && currentUserId === basenji.dono_id;

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md hover:border-amber-200/60 active:scale-[0.99] transition-all cursor-pointer">
      {/* Stretched link cobrindo todo o card para navegar aos detalhes do cão */}
      <Link
        href={`/basenjis/${basenji.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver detalhes de ${basenji.nome}`}
      />

      {/* Photo */}
      <div className="relative w-full h-52 bg-amber-50 overflow-hidden pointer-events-none">
        {basenji.foto_url ? (
          <Image
            src={basenji.foto_url}
            alt={basenji.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🐕
          </div>
        )}

        {/* Sex badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow pointer-events-none ${
            basenji.sexo === 'macho' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
          }`}
        >
          {basenji.sexo === 'macho' ? <Mars className="w-3.5 h-3.5" /> : <Venus className="w-3.5 h-3.5" />}
          {basenji.sexo === 'macho' ? 'Macho' : 'Fêmea'}
        </div>
      </div>

      {/* Edit button — only for owner */}
      {isDono && (
        <div className="absolute top-3 left-3 z-10">
          <Link
            href={`/basenjis/${basenji.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-stone-700 shadow hover:bg-white active:scale-95 transition-all"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </Link>
        </div>
      )}

      {/* Info */}
      <div className="p-4 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-stone-800 text-lg leading-tight group-hover:text-amber-800 transition-colors">
              {basenji.nome}
            </h3>
            <p className="text-sm text-stone-500">{basenji.cor}</p>
          </div>
          {profile?.cidade && profile.estado && (
            <div className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.cidade}, {profile.estado}</span>
            </div>
          )}
        </div>

        {/* Idade */}
        {idade && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md w-fit font-medium border border-amber-200/50">
            <Cake className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{idade}</span>
          </div>
        )}

        {basenji.bio && (
          <p className="mt-2 text-sm text-stone-600 line-clamp-2">{basenji.bio}</p>
        )}

        {/* Owner */}
        {profile && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
            <div className="w-7 h-7 relative rounded-full overflow-hidden bg-amber-100 shrink-0">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.nome} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
              )}
            </div>
            <span className="text-xs text-stone-500">Tutor: <span className="font-medium text-stone-700">{profile.nome}</span></span>
          </div>
        )}
      </div>
    </article>
  );
}
