import React from 'react';
import type { StudyMode } from './AITopperChatScreen';

interface StreamingIndicatorProps {
  mode: StudyMode;
}

export default function StreamingIndicator({ mode }: StreamingIndicatorProps) {
  return (
    <div className="px-4 py-4 fade-in-up">
      <div className="chat-message-width">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: 'rgba(16,163,127,0.15)',
              border: '1px solid rgba(16,163,127,0.25)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 28 28" fill="none">
              <path
                d="M9 14h10M9 10.5h6M9 17.5h8"
                stroke="#10a37f"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold" style={{ color: '#ececec' }}>
                AI Topper
              </span>
              <span className="text-xs" style={{ color: '#8e8ea0' }}>
                {mode === 'sprint'
                  ? '⚡ Generating sprint answer...'
                  : '🔬 Building full explanation...'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 py-1">
              <div className="streaming-dot" style={{ background: '#10a37f' }} />
              <div className="streaming-dot" style={{ background: '#10a37f' }} />
              <div className="streaming-dot" style={{ background: '#10a37f' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
