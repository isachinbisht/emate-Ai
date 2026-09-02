import { NextResponse, NextRequest } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
  const baseUrl = isLocal
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const callbackUrl = `${baseUrl}/api/auth/openrouter/callback`;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const openRouterAuthUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  const response = NextResponse.redirect(openRouterAuthUrl);

  // Prevent Vercel CDN from caching this redirect (which would strip Set-Cookie)
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  // Cross-site cookie: OpenRouter redirects back from a different origin,
  // so SameSite=None is required in production for the browser to send the
  // cookie on the callback navigation. Lax only works for same-site top-level
  // GETs; the OpenRouter auth server makes this a cross-site redirect.
  response.cookies.set('openrouter_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
