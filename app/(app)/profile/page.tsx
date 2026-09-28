'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Basenji } from '@/types';
import Image from 'next/image';
import { LogOut, MapPin, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BasenjiCard from '@/components/features/feed/BasenjiCard';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [basenjis, setBasenjis] = useState<Basenji[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setUserId(user.id);

      const [{ data: profileData }, { data: basenjiData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('basenjis').select('*').eq('dono_id', user.id).order('created_at', { ascending: false }),
      ]);

      setProfile(profileData);
      setBasenjis(basenjiData ?? []);
      setLoading(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl h-36 animate-pulse mb-4" />
        <div className="bg-white rounded-2xl h-56 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 relative rounded-full overflow-hidden bg-amber-100 shrink-0 border-2 border-amber-200">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.nome} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-stone-800 text-lg leading-tight truncate">{profile?.nome}</h2>
            <p className="text-sm text-stone-500 truncate">{profile?.email}</p>
            {profile?.cidade && profile.estado && (
              <div className="flex items-center gap-1 text-xs text-amber-700 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.cidade}, {profile.estado}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-xs text-stone-400 bg-stone-100 px-2.5 py-1.5 rounded-lg active:bg-stone-200 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </div>

      {/* My Basenjis */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-stone-700 text-sm">
          Meus Basenjis ({basenjis.length})
        </h3>
        <Link
          href="/basenjis/new"
          className="flex items-center gap-1 text-xs text-amber-600 font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          Adicionar
        </Link>
      </div>

      {basenjis.length === 0 ? (
        <div className="text-center py-10 text-stone-400">
          <p className="text-3xl mb-2">🐕</p>
          <p className="text-sm font-medium">Você ainda não cadastrou nenhum Basenji</p>
          <Link href="/basenjis/new" className="text-amber-600 text-sm font-semibold mt-2 block">
            Cadastrar agora →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {basenjis.map((b) => (
            <BasenjiCard
              key={b.id}
              basenji={{ ...b, profiles: profile ?? undefined }}
              currentUserId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
