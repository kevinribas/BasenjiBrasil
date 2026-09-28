import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <TopBar showLogo />
      <main className="flex-1 safe-bottom">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
