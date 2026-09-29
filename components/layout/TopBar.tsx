'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  Heart,
  HeartPulse,
  Menu,
  X,
  ChevronRight,
  User,
  ShieldCheck,
} from 'lucide-react';

interface TopBarProps {
  title?: string;
  showLogo?: boolean;
}

export default function TopBar({ title, showLogo = false }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o drawer com tecla Esc e trava scroll do body quando aberto
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo ou Título */}
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

          {/* Lado Direito Limpo: Apoiar + Menu Hambúrguer */}
          <div className="flex items-center gap-2">
            <Link
              href="/apoiar"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-rose-700 hover:bg-rose-100/70 active:scale-95 transition-all text-xs font-semibold shadow-xs"
              aria-label="Apoiar o projeto"
              title="Apoiar o projeto"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
              <span>Apoiar</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200/70 text-stone-700 active:scale-95 transition-all"
              aria-label="Abrir menu de navegação"
              aria-expanded={isOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Menu Lateral Deslizante (Drawer / Sheet) ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Sheet */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[85vw] max-w-xs bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menu principal"
      >
        {/* Header do Drawer */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative rounded-full overflow-hidden border border-amber-200 bg-white">
              <Image
                src="/images/logo.png"
                alt="Basenji Brasil"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-stone-800 text-sm leading-tight">
                Basenji Brasil
              </h2>
              <span className="text-[10px] text-stone-400">Comunidade & Conexão</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Itens de Navegação */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {/* Notificações */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-200/70 text-stone-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-xs">Notificações</h3>
                <p className="text-[11px] text-stone-400">Sem avisos no momento</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-stone-300" />
          </div>

          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 pt-2">
            Navegação & Comunidade
          </span>

          {/* Saúde & Cuidados */}
          <Link
            href="/saude"
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/50 active:scale-[0.99] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-stone-800 text-xs group-hover:text-emerald-800 transition-colors">
                  Saúde & Cuidados
                </h3>
                <p className="text-[11px] text-stone-500 truncate">
                  Guia da raça e relatos da comunidade
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 shrink-0 ml-1 transition-colors" />
          </Link>

          {/* Meu Perfil & Cães */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-2xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/40 active:scale-[0.99] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-stone-800 text-xs group-hover:text-amber-800 transition-colors">
                  Meu Perfil & Cães
                </h3>
                <p className="text-[11px] text-stone-500 truncate">
                  Gerencie seus Basenjis cadastrados
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 shrink-0 ml-1 transition-colors" />
          </Link>

          {/* Apoiar o Projeto (destaque final da seção) */}
          <Link
            href="/apoiar"
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/90 active:scale-[0.99] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-stone-800 text-xs group-hover:text-rose-800 transition-colors">
                    Apoiar o Basenji Brasil
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-800">
                    Pix
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 truncate">
                  Iniciativa voluntária sem fins lucrativos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-rose-500 shrink-0 ml-1 transition-colors" />
          </Link>

          {/* Links Institucionais */}
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 pt-3">
            Institucional
          </span>

          <Link
            href="/termos"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              Termos de Uso
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          </Link>

          <Link
            href="/privacidade"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              Política de Privacidade
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          </Link>
        </div>

        {/* Rodapé do Drawer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/70 text-center">
          <p className="text-[11px] font-medium text-stone-500">
            Basenji Brasil • v1.0
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            Feito com ❤️ pela comunidade de tutores
          </p>
        </div>
      </aside>
    </>
  );
}
