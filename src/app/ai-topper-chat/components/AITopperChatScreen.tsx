'use client';

import React, { useState, useEffect } from 'react';
import ChatMainArea from './ChatMainArea';

export type StudyMode = 'deep-dive' | 'sprint';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: StudyMode;
  timestamp: string;
  subject?: string;
}

export interface SelectedContext {
  subject: string;
  unit: string;
}

export default function AITopperChatScreen() {
  const [mode, setMode] = useState<StudyMode>('sprint');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({
    subject: 'DBMS',
    unit: 'Normalization (3NF/BCNF)',
  });
  const [selectedModel, setSelectedModel] = useState('openrouter/auto');

  useEffect(() => {
    const syncContext = () => {
      const savedSubject = localStorage.getItem('nk-subject');
      const savedUnit = localStorage.getItem('nk-unit');
      if (savedSubject && savedUnit) {
        setSelectedContext({ subject: savedSubject, unit: savedUnit });
      } else {
        // Initialize if empty
        localStorage.setItem('nk-subject', 'DBMS');
        localStorage.setItem('nk-unit', 'Normalization (3NF/BCNF)');
      }
    };
    syncContext();
    window.addEventListener('nk-context-change', syncContext);
    return () => window.removeEventListener('nk-context-change', syncContext);
  }, []);

  return (
    <div className="flex h-screen min-h-screen overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col overflow-hidden">
          <ChatMainArea
            messages={messages}
            setMessages={setMessages}
            mode={mode}
            setMode={setMode}
            selectedContext={selectedContext}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>
      </div>
    </div>
  );
}

