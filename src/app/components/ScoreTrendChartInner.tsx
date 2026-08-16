'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const SCORE_DATA = [
  { session: 'Jul 22', score: 58, subject: 'Data Structures' },
  { session: 'Jul 23', score: 63, subject: 'DBMS' },
  { session: 'Jul 24', score: 55, subject: 'OS' },
  { session: 'Jul 25', score: 71, subject: 'DBMS' },
  { session: 'Jul 26', score: 68, subject: 'Web Dev' },
  { session: 'Jul 27', score: 74, subject: 'Data Structures' },
  { session: 'Jul 28', score: 70, subject: 'OS' },
  { session: 'Jul 29', score: 82, subject: 'DBMS' },
];

interface TooltipPayloadItem {
  value: number;
  payload: { subject: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2.5 shadow-card text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-text-primary font-semibold">
        Score: <span className="text-primary tabular-nums">{payload[0].value}%</span>
      </p>
      <p className="text-text-muted mt-0.5">{payload[0].payload.subject}</p>
    </div>
  );
}

export default function ScoreTrendChartInner() {
  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Quiz Score Trend</h3>
          <p className="text-xs text-text-muted mt-0.5">Last 8 sessions</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <TrendingUp size={12} className="text-success" />
          <span className="text-xs font-semibold text-success">+24pts</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={SCORE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="session"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'var(--border-hover)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ fill: 'var(--primary)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
