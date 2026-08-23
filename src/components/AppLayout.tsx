'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(248); // server-safe default
  const [isResizing, setIsResizing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // server-safe default

  const pathname = usePathname();

  useEffect(() => {
    // Sync theme and sidebar width from localStorage after hydration
    const savedTheme = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);

    const savedWidth = localStorage.getItem('nk-sidebar-width');
    if (savedWidth) setSidebarWidth(parseInt(savedWidth, 10));

    const updateTheme = () => {
      const t = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
      setTheme(t || 'light');
    };
    window.addEventListener('storage', updateTheme);
    return () => window.removeEventListener('storage', updateTheme);
  }, []);

  // Persist last visited path so the landing page can redirect back
  useEffect(() => {
    if (pathname) {
      localStorage.setItem('nk-last-path', pathname);
    }
  }, [pathname]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(180, Math.min(e.clientX, 480));
      setSidebarWidth(newWidth);
      localStorage.setItem('nk-sidebar-width', String(newWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      className="flex min-h-screen transition-colors duration-300" 
      style={{ 
        background: theme === 'dark' ? '#000000' : '#ffffff', 
        color: theme === 'dark' ? '#ffffff' : '#000000',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {sidebarOpen && (
        <>
          <Sidebar width={sidebarWidth} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div
            onMouseDown={startResizing}
            className={`w-1 select-none cursor-col-resize hover:bg-sky-500/50 active:bg-sky-500 shrink-0 h-screen transition-colors z-40`}
            style={{
              background: isResizing ? '#0284c7' : 'transparent',
            }}
          />
        </>
      )}
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
