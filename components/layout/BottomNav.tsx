'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, PlusCircle, User } from 'lucide-react';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/events', label: 'Encontros', icon: CalendarDays },
  { href: '/basenjis/new', label: 'Cadastrar', icon: PlusCircle },
  { href: '/profile', label: 'Perfil', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-[0_-1px_12px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/feed' && pathname.startsWith(href));
          const isCTA = href === '/basenjis/new';

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-150 active:scale-95
                ${isCTA
                  ? 'text-amber-600'
                  : isActive
                    ? 'text-amber-700'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
            >
              <Icon
                className={`w-6 h-6 ${isCTA ? 'text-amber-600' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
