import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const hasKey = !!cookieStore.get('user_openrouter_key')?.value;
  return NextResponse.json({ connected: hasKey });
}
