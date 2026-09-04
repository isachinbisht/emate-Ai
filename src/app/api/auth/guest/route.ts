import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    redirectUrl: '/ai-topper-chat',
  });

  response.cookies.set('is_guest_user', 'true', {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
