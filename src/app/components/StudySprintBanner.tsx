'use client';

import React, { useState } from 'react';
import { Zap, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StudySprintBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-warning/30 overflow-hidden fade-in-up"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(239,68,68,0.06) 100%)',
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-3xl"
        style={{ background: 'rgba(245,158,11,0.15)' }}
      />

      <div className="flex items-center gap-3 relative">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <Zap size={18} className="text-warning" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Study Sprint Mode Available</p>
          <p className="text-xs text-text-secondary mt-0.5">
            DBMS exam tomorrow · 12 high-probability questions ready · avg 4 min per Q
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 relative">
        <Link
          href="/ai-topper-chat"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-warning transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          Start Sprint
          <ArrowRight size={14} />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-150"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
