import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

export async function GET(request: Request) {
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

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";

  // Ensure localhost is only used if explicitly running on a local development server
  const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");
  const baseUrl = isLocal
    ? "http://localhost:3000"
    : "https://emate-ai.vercel.app";

  const callbackUrl = `${baseUrl}/api/auth/openrouter/callback`;
  const openRouterAuthUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${challenge}&code_challenge_method=S256`;

  return NextResponse.redirect(openRouterAuthUrl);
}
