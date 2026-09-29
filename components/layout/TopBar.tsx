'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Heart, HeartPulse } from 'lucide-react';

interface TopBarProps {
  title?: string;
  showLogo?: boolean;
}

export default function TopBar({ title, showLogo = false }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {showLogo ? (
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-full overflow-hidden border border-amber-200 bg-white">
              <Image
                src="/images/logo.png"
                alt="Basenji Brasil"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-amber-800 text-lg">Basenji Brasil</span>
          </Link>
        ) : (
          <h1 className="font-bold text-stone-800 text-lg">{title}</h1>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/saude"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 hover:bg-emerald-100/70 active:scale-95 transition-all text-xs font-semibold shadow-xs"
            aria-label="Saúde & Cuidados da raça"
            title="Saúde & Cuidados"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Saúde</span>
          </Link>

          <Link
            href="/apoiar"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100/70 active:scale-95 transition-all text-xs font-semibold shadow-xs"
            aria-label="Apoiar o projeto"
            title="Apoiar o projeto"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
            <span className="hidden xs:inline">Apoiar</span>
          </Link>

          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
