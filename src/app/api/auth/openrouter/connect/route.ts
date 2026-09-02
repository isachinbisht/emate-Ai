import { NextResponse, NextRequest } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
  const baseUrl = isLocal
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Encode the verifier in the callback URL so it survives the cross-site
  // redirect. OpenRouter forwards query parameters from callback_url back
  // to our callback route, avoiding cookie SameSite issues entirely.
  const callbackPath = '/api/auth/openrouter/callback';
  const encodedVerifier = Buffer.from(codeVerifier).toString('base64url');
  const callbackUrl = `${baseUrl}${callbackPath}?pv=${encodeURIComponent(encodedVerifier)}`;

  const openRouterAuthUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  const response = NextResponse.redirect(openRouterAuthUrl);
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  // Also set cookie as a fallback (works in same-site / local dev)
  response.cookies.set('openrouter_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
