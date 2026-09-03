'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home, MessageSquare, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      <div className="text-center max-w-lg mx-auto flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
          <Image src="/asset/images/e.svg" alt="e-Mate logo" width={40} height={40} />
        </div>

        <div className="relative">
          <h1 className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-blue-600/20 dark:text-blue-400/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-600 text-white shadow-md">
              Page Not Found
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Lost in the study matrix?
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
            The page you are looking for has moved or does not exist. Let&apos;s get you back to your AI study workspace!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
          <Link
            href="/ai-topper-chat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all min-h-[44px] shadow-lg shadow-blue-500/20"
          >
            <MessageSquare size={16} />
            Go to AI Workspace
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-all min-h-[44px]"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
