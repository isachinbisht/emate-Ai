import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

export async function GET(request: Request) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

  // Ensure localhost is only used if explicitly running on a local development server
  const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");
  const baseUrl = isLocal
    ? "http://localhost:3000"
    : "https://emate-ai.vercel.app";

  const callbackUrl = `${baseUrl}/api/auth/openrouter/callback`;
  const openRouterAuthUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  // Set the cookie on the response so it persists across the cross-site redirect
  const response = NextResponse.redirect(openRouterAuthUrl);
  response.cookies.set("openrouter_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
