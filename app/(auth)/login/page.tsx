'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);
  const supabase = createClient();

  async function signInWithGoogle() {
    setLoading('google');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  async function signInWithFacebook() {
    setLoading('facebook');
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-36 h-36 relative rounded-full overflow-hidden shadow-2xl border-4 border-amber-300 bg-white">
          <Image
            src="/images/logo.png"
            alt="Basenji Brasil Logo"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Basenji Brasil
          </h1>
          <p className="text-amber-200 text-sm mt-1">
            A comunidade dos tutores Basenji 🐕
          </p>
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={signInWithGoogle}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 bg-white text-stone-800 font-semibold py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === 'google' ? (
            <Spinner />
          ) : (
            <GoogleIcon />
          )}
          Entrar com Google
        </button>

        <button
          onClick={signInWithFacebook}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === 'facebook' ? (
            <Spinner white />
          ) : (
            <FacebookIcon />
          )}
          Entrar com Facebook
        </button>
      </div>

      {/* Footer */}
      <p className="text-amber-300/80 text-xs text-center max-w-xs leading-relaxed">
        Ao entrar, você concorda com os nossos{' '}
        <Link href="/termos" className="underline hover:text-white font-medium transition-colors">
          Termos de Uso
        </Link>{' '}
        e{' '}
        <Link href="/privacidade" className="underline hover:text-white font-medium transition-colors">
          Política de Privacidade
        </Link>.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function Spinner({ white = false }: { white?: boolean }) {
  return (
    <svg
      className={`w-5 h-5 animate-spin ${white ? 'text-white' : 'text-stone-400'}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
