import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const origin = isLocalEnv
    ? requestUrl.origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : requestUrl.origin;

  // Redirecionamento permanente 307 para a rota canônica /api/auth/callback preservando searchParams
  const targetUrl = new URL(`/api/auth/callback${requestUrl.search}`, origin);
  return NextResponse.redirect(targetUrl, 307);
}
