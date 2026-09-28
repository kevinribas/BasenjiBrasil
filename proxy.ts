import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.startsWith('/login');
  const isApiRoute = url.pathname.startsWith('/api');
  const isCallbackRoute =
    url.pathname.startsWith('/auth/callback') ||
    url.pathname.startsWith('/api/auth/callback');
  const isPublicRoute =
    url.pathname === '/privacidade' ||
    url.pathname.startsWith('/privacidade/') ||
    url.pathname === '/termos' ||
    url.pathname.startsWith('/termos/');
  const isOnboarding = url.pathname.startsWith('/onboarding');

  // Redireciona usuários não autenticados para login, transferindo todos os cookies de sessão
  if (!user && !isAuthRoute && !isApiRoute && !isCallbackRoute && !isPublicRoute) {
    url.pathname = '/login';
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Redireciona usuários autenticados para fora de /login, transferindo todos os cookies de sessão
  if (user && isAuthRoute) {
    url.pathname = '/feed';
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

