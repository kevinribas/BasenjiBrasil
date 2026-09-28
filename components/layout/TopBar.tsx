'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Heart } from 'lucide-react';

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

        <div className="flex items-center gap-2">
          <Link
            href="/apoiar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100/70 active:scale-95 transition-all text-xs font-semibold shadow-xs"
            aria-label="Apoiar o projeto"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
            <span>Apoiar</span>
          </Link>

          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
