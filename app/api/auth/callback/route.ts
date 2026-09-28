import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Garante que o redirecionamento permaneça no domínio real atual (ex: https://basenjibrasil.com)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const origin = isLocalEnv
    ? requestUrl.origin
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if onboarding is needed (cidade/estado not filled)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('cidade, estado')
          .eq('id', user.id)
          .single();

        if (!profile?.cidade || !profile?.estado) {
          return NextResponse.redirect(new URL('/onboarding', origin));
        }
      }

      // Redireciona explicitamente para /feed, limpando qualquer parâmetro residual de autenticação (code, etc.)
      return NextResponse.redirect(new URL('/feed', origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin));
}
