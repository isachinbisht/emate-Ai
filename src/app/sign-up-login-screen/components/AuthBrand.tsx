import React from 'react';
import { Zap, Brain, Target, TrendingUp } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const FEATURES = [
  {
    key: 'feat-sprint',
    icon: Zap,
    title: 'Study Sprints',
    desc: 'Last-minute cram mode with high-yield summaries and panic Q&A',
  },
  {
    key: 'feat-topper',
    icon: Brain,
    title: 'AI Topper Agent',
    desc: '24/7 AI tutor tuned to your university marking scheme',
  },
  {
    key: 'feat-pyq',
    icon: Target,
    title: 'PYQ Intelligence',
    desc: 'Predictive question generation based on past exam patterns',
  },
  {
    key: 'feat-trend',
    icon: TrendingUp,
    title: 'Score Analytics',
    desc: 'Track your weak spots and quiz score trends over time',
  },
];

export default function AuthBrand() {
  return (
    <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-12 relative overflow-hidden border-r border-border">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, rgba(37,99,235,0.12) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)',
        }}
      />
      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <AppLogo size={36} />
        <span className="text-xl font-bold tracking-tight text-text-primary">e-Mate</span>
      </div>
      {/* Hero text */}
      <div className="relative space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full sprint-badge text-xs font-semibold mb-2">
          <Zap size={12} />
          AI Academic Copilot
        </div>
        <h1 className="text-hero text-text-primary leading-tight">
          Ace your exams with AI precision
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
          Pre-loaded with IPU BCA syllabi, past exam patterns, and an AI agent that knows exactly
          what your university examiners want.
        </p>

        {/* Feature list */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          {FEATURES?.map((f) => {
            const Icon = f?.icon;
            return (
              <div key={f?.key} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(37,99,235,0.1)',
                    border: '1px solid rgba(37,99,235,0.2)',
                  }}
                >
                  <Icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{f?.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{f?.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Footer */}
      <div className="relative">
        <p className="text-xs text-text-muted">
          Your OpenRouter API key stays on your device. We never store it.
        </p>
      </div>
    </div>
  );
}
