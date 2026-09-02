import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Always default to /ai-topper-chat — never fall back to "/" which
  // would send authenticated users back to the public landing page.
  const next = searchParams.get('next') || '/ai-topper-chat';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Build the redirect base URL. In production, Vercel sets
      // x-forwarded-host; use it to avoid relying on env vars.
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      let baseUrl: string;
      if (isLocalEnv) {
        baseUrl = origin;
      } else if (forwardedHost) {
        baseUrl = `https://${forwardedHost}`;
      } else {
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
      }

      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Code exchange failed — send to login with error
  return NextResponse.redirect(
    `${origin}/sign-up-login-screen?error=auth_callback_failed`
  );
}
