import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
    // 1. Cria o objeto de resposta de redirecionamento onde os cookies serão diretamente injetados
    const targetUrl = new URL('/feed', origin);
    const response = NextResponse.redirect(targetUrl);

    // 2. Instancia createServerClient com controle síncrono e direto sobre os cookies da resposta
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. Verifica se o usuário precisa de onboarding (cidade/estado ainda não preenchidos)
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
          const onboardingResponse = NextResponse.redirect(new URL('/onboarding', origin));
          // Transfere todos os cookies de sessão injetados para a resposta de onboarding
          response.cookies.getAll().forEach((cookie) => {
            onboardingResponse.cookies.set(cookie);
          });
          return onboardingResponse;
        }
      }

      // 4. Retorna a resposta HTTP contendo os cabeçalhos Set-Cookie para garantir sincronização imediata
      return response;
    }

    console.error('[OAuth Callback] Erro na troca de código:', error);
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin));
}
