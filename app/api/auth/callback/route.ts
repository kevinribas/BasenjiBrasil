import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/feed';

  // Mantém a consistência exata do origin/host que iniciou a chamada
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalhost = !forwardedHost && requestUrl.hostname.includes('localhost');
  const origin = isLocalhost
    ? requestUrl.origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      let destination = next;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('cidade, estado')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile?.cidade || !profile?.estado) {
          destination = '/onboarding';
        }
      }

      // Cria a resposta final de redirecionamento e transfere todos os cookies gravados
      const redirectResponse = NextResponse.redirect(`${origin}${destination}`);
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });

      return redirectResponse;
    }

    console.error('Erro ao trocar código por sessão:', error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
