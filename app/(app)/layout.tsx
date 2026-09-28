import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    /* Fundo neutro visível apenas no desktop, atrás da moldura */
    <div className="min-h-screen bg-stone-100">
      {/*
        Moldura do app: centralizada, largura máxima de telefone.
        bg-[#FFFDF7] = creme suave, shadow-xl = profundidade no desktop,
        border-x = bordas laterais sutis para separar do fundo cinza.
      */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#FFFDF7] shadow-xl border-x border-amber-100/60">
        <TopBar showLogo />
        <main className="flex-1 safe-bottom overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
