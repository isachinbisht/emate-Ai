import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const verifier = request.cookies.get("openrouter_verifier")?.value;

  if (!code || !verifier) {
    return NextResponse.json(
      { error: "Missing authorization code or PKCE verifier cookie." },
      { status: 400 }
    );
  }

  try {
    const tokenRes = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        code_challenge_method: "S256",
      }),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.key) {
      return NextResponse.json(
        { error: data.error || "Failed to exchange key with OpenRouter." },
        { status: tokenRes.status }
      );
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");
    const baseUrl = isLocal
      ? "http://localhost:3000"
      : "https://emate-ai.vercel.app";

    const response = NextResponse.redirect(`${baseUrl}/ai-topper-chat?connected=true`);

    // Save key in a secure HTTP-only cookie
    response.cookies.set("user_openrouter_key", data.key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Clear verifier cookie
    response.cookies.delete("openrouter_verifier");

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

