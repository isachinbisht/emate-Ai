import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const verifier = request.cookies.get("openrouter_verifier")?.value;

  if (!code || !verifier) {
    const missing = [
      !code && "authorization code",
      !verifier && "PKCE verifier cookie",
    ].filter(Boolean).join(" and ");
    return NextResponse.json(
      { error: `Missing ${missing}. The verifier cookie may have been lost during the redirect.` },
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

    // Return an HTML page that notifies the opener window and self-closes.
    // Falls back to a redirect if opened without a popup (no window.opener).
    const html = `<!DOCTYPE html>
<html><head><title>Connecting...</title></head>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'OPENROUTER_AUTH_SUCCESS' }, '${baseUrl}');
    window.close();
  } else {
    window.location.href = '${baseUrl}/ai-topper-chat?connected=true';
  }
</script>
<noscript><meta http-equiv="refresh" content="0;url=${baseUrl}/ai-topper-chat?connected=true"></noscript>
</body></html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });

    // Save key in a secure HTTP-only cookie
    response.cookies.set("user_openrouter_key", data.key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
