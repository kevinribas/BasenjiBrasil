'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell } from 'lucide-react';

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
            <div className="w-8 h-8 relative rounded-full overflow-hidden border border-amber-200">
              <Image
                src="/images/logo.jfif"
                alt="Basenji Brasil"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-amber-800 text-lg">Basenji Brasil</span>
          </Link>
        ) : (
          <h1 className="font-bold text-stone-800 text-lg">{title}</h1>
        )}

        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
