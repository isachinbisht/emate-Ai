import React from 'react';
import { Target, Flame, Layers, AlertTriangle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

type AccentColor = 'blue' | 'orange' | 'purple' | 'red';
type DeltaType = 'positive' | 'negative' | 'neutral';

interface KPICardProps {
  label: string;
  value: string;
  delta: string;
  deltaType: DeltaType;
  sub: string;
  iconName: 'target' | 'flame' | 'layers' | 'alert';
  accentColor: AccentColor;
  isAlert?: boolean;
}

const ICONS = {
  target: Target,
  flame: Flame,
  layers: Layers,
  alert: AlertTriangle,
};

const ACCENT_CLASSES: Record<
  AccentColor,
  { icon: string; bg: string; border: string; glow: string }
> = {
  blue: {
    icon: 'text-primary',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.2)',
    glow: 'rgba(37,99,235,0.08)',
  },
  orange: {
    icon: 'text-warning',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    glow: 'rgba(245,158,11,0.08)',
  },
  purple: {
    icon: 'text-purple-400',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)',
    glow: 'rgba(139,92,246,0.08)',
  },
  red: {
    icon: 'text-danger',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    glow: 'rgba(239,68,68,0.08)',
  },
};

const DELTA_CLASSES: Record<DeltaType, string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-text-secondary',
};

export default function KPICard({
  label,
  value,
  delta,
  deltaType,
  sub,
  iconName,
  accentColor,
  isAlert = false,
}: KPICardProps) {
  const Icon = ICONS[iconName];
  const accent = ACCENT_CLASSES[accentColor];

  return (
    <div
      className={`relative glass-card glass-card-hover p-5 overflow-hidden ${
        isAlert ? 'border-danger/20' : ''
      }`}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${accent.glow} 0%, transparent 60%)`,
        }}
      />

      {/* Alert pulse */}
      {isAlert && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-danger animate-pulse" />
      )}

      <div className="relative space-y-3">
        {/* Icon + label row */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
          >
            <Icon size={15} className={accent.icon} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {label}
          </span>
        </div>

        {/* Value */}
        <div className="tabular-nums text-3xl font-bold text-text-primary tracking-tight">
          {value}
        </div>

        {/* Delta + sub */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${DELTA_CLASSES[deltaType]}`}>{delta}</span>
          <span className="text-xs text-text-muted">{sub}</span>
        </div>
      </div>
    </div>
  );
}
