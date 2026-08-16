'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ScoreTrendChartInner = dynamic(() => import('./ScoreTrendChartInner'), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-5 h-[280px]">
      <div className="skeleton h-5 w-40 mb-4" />
      <div className="skeleton h-full w-full rounded-lg" />
    </div>
  ),
});

export default function ScoreTrendChart() {
  return <ScoreTrendChartInner />;
}
