import React from 'react';

export default function StreamingIndicator() {
  return (
    <div className="flex items-center gap-2 py-3 text-zinc-400 fade-in-up">
      <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
      <span className="text-xs font-medium text-zinc-400">Thinking...</span>
    </div>
  );
}
