'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Zap, Shield, Users } from 'lucide-react';
import { useGeoCurrency } from '@/hooks/useGeoCurrency';
import RazorpayCheckout from '@/components/RazorpayCheckout';

/* ── Tier definitions ──────────────────────────────────────────── */

interface TierFeature {
  text: string;
  icon: React.ReactNode;
}

interface Tier {
  id: 'plus' | 'pro' | 'ultra';
  name: string;
  badge?: string;
  tagline: string;
  inr: { monthly: number; annual: number };
  usd: { monthly: number; annual: number };
  features: TierFeature[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    id: 'plus',
    name: 'e-Mate Plus',
    badge: 'RECOMMENDED',
    tagline: 'Google AI · Basic Pro Tier',
    inr: { monthly: 100, annual: 999 },
    usd: { monthly: 1.99, annual: 19.99 },
    features: [
      { text: 'Higher usage limits across Gemini Flash & GPT-4o-mini', icon: <Zap size={15} /> },
      { text: 'Access to Flash Thinking models', icon: <Sparkles size={15} /> },
      { text: '10GB notebook storage', icon: <Sparkles size={15} /> },
      { text: 'Fast RAG context search', icon: <Zap size={15} /> },
    ],
    cta: 'Get e-Mate Plus',
  },
  {
    id: 'pro',
    name: 'e-Mate Pro',
    tagline: 'Google AI Pro · Power Learner Tier',
    inr: { monthly: 489, annual: 4699 },
    usd: { monthly: 8, annual: 79 },
    features: [
      { text: 'Full access to Claude 3.5 Sonnet, DeepSeek R1 & GPT-4o', icon: <Sparkles size={15} /> },
      { text: 'Unlimited active study agents', icon: <Zap size={15} /> },
      { text: '100GB notebook and PDF storage', icon: <Sparkles size={15} /> },
      { text: 'Nitro routing & priority model queuing', icon: <Zap size={15} /> },
    ],
    cta: 'Get e-Mate Pro',
  },
  {
    id: 'ultra',
    name: 'e-Mate Ultra',
    tagline: 'Google AI Ultra · Enterprise Tier',
    inr: { monthly: 2099, annual: 19999 },
    usd: { monthly: 25, annual: 249 },
    features: [
      { text: 'Dedicated compute infrastructure', icon: <Shield size={15} /> },
      { text: 'Enterprise security & workspace controls', icon: <Shield size={15} /> },
      { text: 'Multi-seat team collaboration & shared notebooks', icon: <Users size={15} /> },
    ],
    cta: 'Get e-Mate Ultra',
  },
];

/* ── Page component ────────────────────────────────────────────── */

export default function UpgradePage() {
  const { currency, toggleCurrency, formatTierPrice } = useGeoCurrency();
  const [annual, setAnnual] = useState(false);
  const isINR = currency.currency === 'INR';

  function priceFor(tier: Tier): string {
    const prices = isINR ? tier.inr : tier.usd;
    const amount = annual ? prices.annual : prices.monthly;
    if (isINR) return amount === 0 ? '₹0' : `₹${amount.toLocaleString('en-IN')}`;
    return amount === 0 ? '$0' : `$${amount}`;
  }

  function perMonth(tier: Tier): string {
    const prices = isINR ? tier.inr : tier.usd;
    const monthlyEquiv = annual ? Math.round(prices.annual / 12) : prices.monthly;
    if (isINR) return `₹${monthlyEquiv.toLocaleString('en-IN')}`;
    return `$${monthlyEquiv}`;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link
            href="/ai-topper-chat"
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to chat
          </Link>

          {/* Currency toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium text-zinc-500">Pricing in</span>
            <button
              type="button"
              role="switch"
              aria-checked={isINR}
              onClick={toggleCurrency}
              className="relative inline-flex h-9 w-28 shrink-0 cursor-pointer items-center rounded-full bg-zinc-200/80 p-1 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-800"
            >
              <span
                className={`absolute left-1 top-1 flex h-7 w-12 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-sm transition-transform duration-200 ease-in-out ${
                  isINR ? 'translate-x-[52px]' : 'translate-x-0'
                }`}
              >
                {isINR ? 'INR' : 'USD'}
              </span>
              <span className="flex w-full items-center justify-between px-3 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                <span className={isINR ? 'opacity-0' : 'opacity-100'}>USD</span>
                <span className={isINR ? 'opacity-100' : 'opacity-0'}>INR</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
          Get more power for your{' '}
          <span className="text-blue-600 dark:text-blue-400">e-Mate AI</span> study workflows
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Choose a plan to unlock advanced reasoning models, unlimited RAG search, and priority agent execution.
        </p>

        {/* Annual / Monthly toggle */}
        <div className="mt-8 inline-flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !annual
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              annual
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Annual
            <span className="ml-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {TIERS.map((tier) => {
            const isFeatured = tier.id === 'pro';
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-200 ${
                  isFeatured
                    ? 'border-blue-500/80 dark:border-blue-400/60 bg-white dark:bg-zinc-900 shadow-xl md:-translate-y-2'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white tracking-wide shadow-md">
                    {tier.badge}
                  </span>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1 tracking-wide uppercase">
                    {tier.tagline}
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">{tier.name}</h2>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight">{priceFor(tier)}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      / mo
                    </span>
                  </div>
                  {annual && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      Billed annually · {perMonth(tier)}/mo equivalent
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mb-6" />

                {/* Features */}
                <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-snug">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {f.icon}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-300">{f.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto">
                  {isINR ? (
                    <RazorpayCheckout
                      amount={annual ? (isINR ? tier.inr.annual / 12 : tier.usd.annual) : (isINR ? tier.inr.monthly : tier.usd.monthly)}
                      planTier={tier.id === 'ultra' ? 'scale' : 'growth'}
                      className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all ${
                        isFeatured
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {tier.cta}
                    </RazorpayCheckout>
                  ) : (
                    <a
                      href="/sign-up-login-screen"
                      className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all block text-center ${
                        isFeatured
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {tier.cta}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Student offer banner ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-2xl">
              🎓
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Students get more with e-Mate AI
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Get 50% off e-Mate Pro with your verified student email.
              </p>
            </div>
          </div>
          <a
            href="/sign-up-login-screen"
            className="shrink-0 px-5 py-2.5 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            See student offers
          </a>
        </div>
      </section>
    </div>
  );
}
