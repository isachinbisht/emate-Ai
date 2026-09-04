'use client';

import { useState, useEffect, useCallback } from 'react';

interface CurrencyConfig {
  country: string;
  currency: string;
  symbol: string;
  /** 1 USD = rate local currency */
  rate: number;
}

const USD: CurrencyConfig = { country: 'US', currency: 'USD', symbol: '$', rate: 1 };
const INR: CurrencyConfig = { country: 'IN', currency: 'INR', symbol: '₹', rate: 83 };

/** USD base prices for each tier */
const BASE_PRICES = { free: 0, growth: 8, scale: 25 } as const;

/** Pre-computed INR prices (rounded to nearest 99 for psychological pricing) */
const INR_PRICES = { free: 0, growth: 699, scale: 2099 } as const;

function formatPrice(amount: number, cfg: CurrencyConfig): string {
  if (cfg.currency === 'INR') {
    return amount === 0 ? '₹0' : `₹${amount.toLocaleString('en-IN')}`;
  }
  return amount === 0 ? '$0' : `$${amount}`;
}

function tierPrice(
  tier: 'free' | 'growth' | 'scale',
  cfg: CurrencyConfig
): string {
  if (cfg.currency === 'INR') {
    return formatPrice(INR_PRICES[tier], cfg);
  }
  return formatPrice(BASE_PRICES[tier], cfg);
}

export function useGeoCurrency() {
  const [config, setConfig] = useState<CurrencyConfig>(USD);
  const [manualOverride, setManualOverride] = useState<CurrencyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-detect on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error('geo lookup failed');
        const data = await res.json();
        if (!cancelled && data.country_code === 'IN') {
          setConfig(INR);
        }
      } catch {
        // Silently keep USD default
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const active = manualOverride ?? config;

  const toggleCurrency = useCallback(() => {
    setManualOverride((prev) => {
      if (prev?.currency === 'INR') return USD;
      if (prev?.currency === 'USD') return INR;
      // First toggle: flip from whatever auto-detected
      return active.currency === 'INR' ? USD : INR;
    });
  }, [active.currency]);

  const formatTierPrice = useCallback(
    (tier: 'free' | 'growth' | 'scale') => tierPrice(tier, active),
    [active]
  );

  return {
    /** Active currency config (auto-detected or manually overridden) */
    currency: active,
    /** Whether geo-detection is still in progress */
    loading,
    /** Switch between USD ↔ INR */
    toggleCurrency,
    /** Get formatted price string for a tier */
    formatTierPrice,
    /** Whether user is in India (based on auto-detection, ignores manual override) */
    isIndia: config.country === 'IN',
  };
}
