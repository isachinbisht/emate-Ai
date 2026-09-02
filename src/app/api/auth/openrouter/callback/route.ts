import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const stateVerifier = request.nextUrl.searchParams.get("state");
  const cookieVerifier = request.cookies.get("openrouter_verifier")?.value;

  // Use cookie verifier first, fall back to URL state verifier
  const verifier = cookieVerifier || stateVerifier;

  if (!code || !verifier) {
    return NextResponse.json(
      { error: "Missing authorization code or PKCE verifier. Please try connecting again." },
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

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.key) {
      throw new Error(tokenData?.error?.message || "Failed to exchange key");
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");
    const baseUrl = isLocal
      ? "http://localhost:3000"
      : (process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`);

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

    // Store user key and clear temporary verifier cookie
    response.cookies.set("user_openrouter_key", tokenData.key, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.delete("openrouter_verifier");

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to exchange PKCE authorization key" },
      { status: 500 }
    );
  }
}

