'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
      setTheme(savedTheme || 'dark');
    };
    updateTheme();
    window.addEventListener('storage', updateTheme);
    return () => window.removeEventListener('storage', updateTheme);
  }, []);

  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ background: theme === 'dark' ? '#000000' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
      {sidebarOpen && <Sidebar onToggle={() => setSidebarOpen(!sidebarOpen)} />}
      <main className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden" style={{ background: theme === 'dark' ? '#000000' : '#ffffff' }}>
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 rounded-xl border transition"
            style={{ 
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: theme === 'dark' ? '#ffffff' : '#000000' 
            }}
            title="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
