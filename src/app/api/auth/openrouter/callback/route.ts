import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieStore = await cookies();
  const verifier = cookieStore.get('openrouter_verifier')?.value;

  if (!code || !verifier) {
    return NextResponse.json(
      { error: 'Missing code or verifier. Authentication failed.' },
      { status: 400 }
    );
  }

  try {
    const exchangeRes = await fetch('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        code_challenge_method: 'S256',
      }),
    });

    const data = await exchangeRes.json();
    if (!exchangeRes.ok || !data.key) {
      return NextResponse.json(
        { error: data.error || 'Failed to exchange key with OpenRouter.' },
        { status: exchangeRes.status }
      );
    }

    const openrouterKey = data.key;

    // Save key in a secure HTTP-only cookie
    cookieStore.set('user_openrouter_key', openrouterKey, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Clear verifier cookie
    cookieStore.delete('openrouter_verifier');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/ai-topper-chat?connected=true`);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
