import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LogIn } from 'lucide-react';

export default function PublicLegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Moldura centralizada mobile-first */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col bg-[#FFFDF7] shadow-xl border-x border-amber-100/60">
        {/* Cabeçalho */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-transform">
              <div className="w-9 h-9 relative rounded-full overflow-hidden border border-amber-300 shadow-xs">
                <Image
                  src="/images/logo.png"
                  alt="Basenji Brasil"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <span className="font-bold text-amber-900 text-base block leading-tight">
                  Basenji Brasil
                </span>
                <span className="text-[10px] text-stone-400 block font-medium">
                  Comunidade Nacional
                </span>
              </div>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar / Cadastrar</span>
            </Link>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>

        {/* Rodapé institucional */}
        <footer className="mt-auto border-t border-stone-200/80 bg-stone-50/80 px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-stone-500 mb-2">
            <Link href="/privacidade" className="hover:text-amber-800 transition-colors">
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link href="/termos" className="hover:text-amber-800 transition-colors">
              Termos de Uso
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-amber-800 transition-colors">
              Login
            </Link>
          </div>
          <p className="text-[11px] text-stone-400">
            © {new Date().getFullYear()} Basenji Brasil · Comunidade sem fins lucrativos de tutores da raça Basenji.
          </p>
        </footer>
      </div>
    </div>
  );
}
