import React from 'react';
import KPICard from './KPICard';

// 4 cards → 2×2 on md, 4-col on lg+
export default function DashboardKPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
      <KPICard
        label="Avg Quiz Score"
        value="74%"
        delta="+6%"
        deltaType="positive"
        sub="Last 7 sessions"
        iconName="target"
        accentColor="blue"
      />
      <KPICard
        label="Study Streak"
        value="9 days"
        delta="+2 days"
        deltaType="positive"
        sub="Personal best: 14"
        iconName="flame"
        accentColor="orange"
      />
      <KPICard
        label="Units Covered"
        value="18 / 28"
        delta="64%"
        deltaType="neutral"
        sub="4 subjects · Sem 4"
        iconName="layers"
        accentColor="purple"
      />
      <KPICard
        label="Weak Topics"
        value="5 units"
        delta="Needs attention"
        deltaType="negative"
        sub="Below 50% accuracy"
        iconName="alert"
        accentColor="red"
        isAlert
      />
    </div>
  );
}
