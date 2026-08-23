import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

export async function GET() {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const cookieStore = await cookies();
  cookieStore.set('openrouter_verifier', verifier, {
    maxAge: 600, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/openrouter/callback`;
  const openRouterAuthUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${challenge}&code_challenge_method=S256`;

  return NextResponse.redirect(openRouterAuthUrl);
}
