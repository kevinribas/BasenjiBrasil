import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/feed';

  // Garante que o redirecionamento permaneça no domínio real de produção
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const currentOrigin = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Contexto de Server Component / Route Handler
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Valida se o perfil do utilizador já tem cidade e estado preenchidos
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('cidade, estado')
          .eq('id', user.id)
          .maybeSingle();

        const destination = !profile?.cidade || !profile?.estado ? '/onboarding' : next;
        return NextResponse.redirect(`${currentOrigin}${destination}`);
      }

      return NextResponse.redirect(`${currentOrigin}${next}`);
    }

    console.error('Erro ao trocar código por sessão no Supabase:', error);
  }

  return NextResponse.redirect(`${currentOrigin}/login?error=auth_callback_failed`);
}
