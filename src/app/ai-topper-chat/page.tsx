import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import AITopperChatScreen from './components/AITopperChatScreen';

export default function AITopperPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-xs text-zinc-500">Loading workspace...</div>}>
        <AITopperChatScreen />
      </Suspense>
    </AppLayout>
  );
}

