import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
});

/**
 * Price IDs — configure these in your Stripe Dashboard.
 * Each price should have Adaptive Pricing enabled so Stripe
 * automatically presents local currencies & payment methods.
 */
const PRICE_IDS: Record<string, string> = {
  growth: process.env.STRIPE_PRICE_GROWTH!,
  scale: process.env.STRIPE_PRICE_SCALE!,
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, userEmail, country } = body as {
      tier?: string;
      userEmail?: string;
      country?: string;
    };

    if (!tier || !PRICE_IDS[tier]) {
      return NextResponse.json(
        { error: 'Invalid or missing tier. Must be "growth" or "scale".' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required.' },
        { status: 400 }
      );
    }

    // ── Test helper: Indian INR presentation ─────────────────────────
    // Pass test+location_IN@example.com in Stripe test mode to see INR.
    // The email pattern is logged in metadata for test verification.

    // ── Build session ────────────────────────────────────────────────
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
      mode: 'subscription',
      customer_email: userEmail,
      success_url: `${APP_URL}/ai-topper-chat?payment=success`,
      cancel_url: `${APP_URL}/?payment=cancelled`,
      metadata: { tier, country: country || 'unknown' },
    };

    // Stripe Adaptive Pricing: automatically present local currency
    // and region-specific payment methods (UPI, NetBanking, etc.)
    // Using type assertion since adaptive_pricing is a newer param
    (sessionParams as Record<string, unknown>).adaptive_pricing = { enabled: true };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Checkout session creation failed';
    console.error('[stripe/checkout]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
