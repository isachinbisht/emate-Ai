'use client';

import React, { useEffect, useState } from 'react';

const LOADING_STEPS = [
  'Initializing AI Topper...',
  'Loading IPU BCA syllabus...',
  'Fetching PYQ patterns...',
  'Calibrating study context...',
  'Ready to study!',
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 2400;
    const stepDuration = totalDuration / LOADING_STEPS?.length;

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < LOADING_STEPS?.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5;
      });
    }, totalDuration / 66);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#212121' }}
    >
      {/* Logo mark */}
      <div className="loading-fade-up" style={{ animationDelay: '0ms' }}>
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer ring */}
          <div
            className="absolute w-20 h-20 rounded-full loading-spin"
            style={{
              border: '1.5px solid transparent',
              borderTopColor: 'rgba(16,163,127,0.6)',
              borderRightColor: 'rgba(16,163,127,0.2)',
            }}
          />
          {/* Inner glow circle */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center loading-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(16,163,127,0.2) 0%, rgba(16,163,127,0.05) 100%)',
              border: '1px solid rgba(16,163,127,0.3)',
            }}
          >
            {/* e-Mate logomark */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4z"
                stroke="rgba(16,163,127,0.4)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M9 14h10M9 10.5h6M9 17.5h8"
                stroke="#10a37f"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* Brand name */}
      <div className="loading-fade-up text-center" style={{ animationDelay: '150ms', opacity: 0 }}>
        <h1
          className="text-2xl font-semibold tracking-tight mb-1"
          style={{ color: '#ececec', letterSpacing: '-0.02em' }}
        >
          e-Mate
        </h1>
        <p className="text-sm" style={{ color: '#8e8ea0' }}>
          AI Academic Copilot
        </p>
      </div>
      {/* Loading dots */}
      <div
        className="flex items-center gap-1.5 mt-10 loading-fade-up"
        style={{ animationDelay: '300ms', opacity: 0 }}
      >
        <div className="loading-dot w-1.5 h-1.5 rounded-full" style={{ background: '#10a37f' }} />
        <div className="loading-dot w-1.5 h-1.5 rounded-full" style={{ background: '#10a37f' }} />
        <div className="loading-dot w-1.5 h-1.5 rounded-full" style={{ background: '#10a37f' }} />
      </div>
      {/* Progress bar */}
      <div
        className="mt-8 loading-fade-up"
        style={{ animationDelay: '400ms', opacity: 0, width: '200px' }}
      >
        <div
          className="h-0.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #10a37f, #34d399)',
            }}
          />
        </div>
      </div>
      {/* Step text */}
      <div
        className="mt-4 loading-fade-up"
        style={{ animationDelay: '500ms', opacity: 0, height: '20px' }}
      >
        <p key={stepIndex} className="text-xs loading-fade-in" style={{ color: '#8e8ea0' }}>
          {LOADING_STEPS?.[stepIndex]}
        </p>
      </div>
    </div>
  );
}
