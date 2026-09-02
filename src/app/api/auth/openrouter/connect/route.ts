import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";

  const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");
  const baseUrl = isLocal
    ? "http://localhost:3000"
    : (process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`);

  const callbackUrl = `${baseUrl}/api/auth/openrouter/callback`;

  // Generate 64-character PKCE code_verifier
  const codeVerifier = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

  // Create Base64URL SHA-256 Code Challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Pass verifier in `state` parameter as a fallback
  const openRouterAuthUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${encodeURIComponent(codeVerifier)}`;

  const response = NextResponse.redirect(openRouterAuthUrl);

  // Cross-site compatible cookie configuration for Vercel deployment
  response.cookies.set("openrouter_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  return response;
}

