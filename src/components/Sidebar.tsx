"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isGuestModeEnabled } from '@/lib/guest-mode';
import { createClient } from '@/lib/supabase/client';
import { applyTheme } from '@/lib/theme';
import {
  Search,
  Image,
  PenSquare,
  Settings,
  BookOpen,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface ChatHistoryItem {
  id: string;
  title: string;
  subject: string;
  mode: 'sprint' | 'deep-dive';
  time: string;
}

const CHAT_HISTORY: ChatHistoryItem[] = [
  { id: 'ch-1', title: 'BCNF Normalization explained', subject: 'DBMS', mode: 'deep-dive', time: 'Today' },
  { id: 'ch-2', title: 'Quick OS scheduling formulas', subject: 'OS', mode: 'sprint', time: 'Today' },
  { id: 'ch-3', title: 'Linked list vs array tradeoffs', subject: 'DSA', mode: 'deep-dive', time: 'Yesterday' },
  { id: 'ch-4', title: 'SQL joins cram sheet', subject: 'DBMS', mode: 'sprint', time: 'Yesterday' },
  { id: 'ch-5', title: 'TCP/IP model layers', subject: 'CN', mode: 'sprint', time: '2 days ago' },
];

const NOTEBOOKS = ['.Net developer', 'GROWTH', 'All notebooks'] as const;

const SUBJECTS_WITH_UNITS = [
  {
    id: 'subj-dbms',
    name: 'DBMS',
    units: [
      { id: 'unit-dbms-1', name: 'ER Model & Relational Algebra' },
      { id: 'unit-dbms-2', name: 'SQL Joins & Subqueries' },
      { id: 'unit-dbms-3', name: 'Normalization (3NF/BCNF)' },
      { id: 'unit-dbms-4', name: 'Transaction Management & ACID' },
      { id: 'unit-dbms-5', name: 'Indexing & Query Optimization' },
    ],
  },
  {
    id: 'subj-ds',
    name: 'Data Structures',
    units: [
      { id: 'unit-ds-1', name: 'Arrays & Linked Lists' },
      { id: 'unit-ds-2', name: 'Stacks, Queues & Deques' },
      { id: 'unit-ds-3', name: 'Binary Trees & Heaps' },
      { id: 'unit-ds-4', name: 'Graph Traversal (DFS/BFS)' },
      { id: 'unit-ds-5', name: 'Sorting & Searching Algorithms' },
    ],
  },
  {
    id: 'subj-os',
    name: 'Operating Systems',
    units: [
      { id: 'unit-os-1', name: 'Process Scheduling' },
      { id: 'unit-os-2', name: 'Deadlock Detection & Prevention' },
      { id: 'unit-os-3', name: 'Memory Management & Paging' },
      { id: 'unit-os-4', name: 'File System Implementation' },
      { id: 'unit-os-5', name: 'Page Replacement Algorithms' },
    ],
  },
  {
    id: 'subj-web',
    name: 'Web Technologies',
    units: [
      { id: 'unit-web-1', name: 'HTML5 & CSS3 Fundamentals' },
      { id: 'unit-web-2', name: 'JavaScript & DOM Manipulation' },
      { id: 'unit-web-3', name: 'React Hooks & State' },
      { id: 'unit-web-4', name: 'REST API Design Patterns' },
    ],
  },
];

interface SidebarProps {
  onToggle?: () => void;
}

export default function Sidebar({ onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isGuest, setIsGuest] = useState(false);
  const [profileName, setProfileName] = useState('Guest');
  const [profileSubtitle, setProfileSubtitle] = useState('Guest mode');
  const [avatarLabel, setAvatarLabel] = useState('G');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [appearance, setAppearance] = useState('Dark');
  const [language, setLanguage] = useState('Auto-detect');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'general' | 'context'>('general');
  const [selectedSubject, setSelectedSubject] = useState('DBMS');
  const [selectedUnit, setSelectedUnit] = useState('Normalization (3NF/BCNF)');

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettingsModal(true);
      setActiveTab('context');
    };
    window.addEventListener('nk-open-settings', handleOpenSettings);
    return () => window.removeEventListener('nk-open-settings', handleOpenSettings);
  }, []);

  useEffect(() => {
    if (showSettingsModal) {
      const savedSubject = localStorage.getItem('nk-subject') || 'DBMS';
      const savedUnit = localStorage.getItem('nk-unit') || 'Normalization (3NF/BCNF)';
      setSelectedSubject(savedSubject);
      setSelectedUnit(savedUnit);
    }
  }, [showSettingsModal]);

  useEffect(() => {
    const updateTheme = () => {
      const saved = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
      const t = saved || 'light';
      setTheme(t);
      setAppearance(t === 'light' ? 'Light' : 'Dark');
      applyTheme(t);
    };
    updateTheme();
    window.addEventListener('storage', updateTheme);
    return () => window.removeEventListener('storage', updateTheme);
  }, []);

  useEffect(() => {
    const syncProfileState = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';
        const displayName = String(fullName).trim() || 'User';

        setIsGuest(false);
        setProfileName(displayName);
        setProfileSubtitle(user.email || 'Signed in');
        setAvatarLabel(displayName.charAt(0).toUpperCase());
        return;
      }

      const guestEnabled = isGuestModeEnabled();
      setIsGuest(guestEnabled);

      if (guestEnabled) {
        setProfileName('Guest');
        setProfileSubtitle('Guest mode');
        setAvatarLabel('G');
      } else {
        setProfileName('Sign in');
        setProfileSubtitle('Access your account');
        setAvatarLabel('S');
      }
    };

    syncProfileState();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncProfileState();
    });

    window.addEventListener('storage', syncProfileState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', syncProfileState);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="relative flex flex-col shrink-0 transition-colors duration-300"
      style={{
        width: '248px',
        background: theme === 'dark' ? '#0a0a0a' : '#f7f7f8',
        borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
      />
      <div className="px-3 pt-3 pb-2 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ border: '1px solid currentColor', background: 'rgba(0,0,0,0.05)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-current">
                <g transform="rotate(-35 12 12)">
                  <rect x="5" y="4" width="6" height="16" rx="2" fill="currentColor" />
                  <rect x="13" y="4" width="6" height="16" rx="2" fill="currentColor" />
                </g>
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>e-Mate AI</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-2xl border transition"
              style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: theme === 'dark' ? '#a1a1aa' : '#71717a' }}
              onClick={onToggle}
              title="Close sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <nav className="space-y-1">
          <Link
            href="/ai-topper-chat"
            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-semibold transition"
            style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
          >
            <PenSquare size={18} />
            <span>New chat</span>
          </Link>

          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-medium transition w-full"
            style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
          >
            <Search size={18} />
            <span>Search chats</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-medium transition w-full"
            style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
          >
            <Image size={18} />
            <span>Images</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-medium transition w-full"
            style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
          >
            <BookOpen size={18} />
            <span>Library</span>
          </button>
        </nav>

        <div className="mt-4">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
            Notebooks
          </p>
          <button
            type="button"
            className="flex items-center gap-3 w-full rounded-2xl border px-2.5 py-2 text-sm font-semibold transition"
            style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              +
            </span>
            <span>New notebook</span>
          </button>

          <div className="mt-2 space-y-1.5">
            {NOTEBOOKS.map((notebook) => (
              <button
                key={notebook}
                type="button"
                className="w-full rounded-2xl px-2.5 py-2 text-left text-sm font-medium transition"
                style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
              >
                {notebook}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
            Recent
          </p>
          <div className="space-y-1">
            {CHAT_HISTORY.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className="w-full rounded-2xl border px-2.5 py-2.5 text-left transition"
                style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{chat.title}</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    {chat.time}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{chat.subject}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned settings + profile at bottom */}
      <div 
        className="mt-auto border-t p-3 space-y-2 shrink-0"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-3 w-full rounded-2xl px-2.5 py-2 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
          title="Settings"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <div 
          className="flex items-center gap-3 rounded-2xl px-2.5 py-2 transition"
          style={{ 
            background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold" style={{ background: theme === 'dark' ? '#52525b' : '#d4d4d8', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
            {avatarLabel}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{profileName}</p>
            <p className="truncate text-xs text-zinc-500">{profileSubtitle}</p>
          </div>
        </div>
      </div>
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: theme === 'dark' ? '#1a1a1a' : '#ffffff' }}>
            <div className="flex">
              {/* Left sidebar with tabs */}
              <div className="w-44 border-r p-4" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', background: theme === 'dark' ? '#0f0f0f' : '#f4f4f5' }}>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('general')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition" 
                    style={{ 
                      color: activeTab === 'general' ? (theme === 'dark' ? '#ffffff' : '#000000') : '#a1a1aa', 
                      background: activeTab === 'general' ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent' 
                    }}
                  >
                    General
                  </button>
                  <button 
                    onClick={() => setActiveTab('context')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition" 
                    style={{ 
                      color: activeTab === 'context' ? (theme === 'dark' ? '#ffffff' : '#000000') : '#a1a1aa', 
                      background: activeTab === 'context' ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent' 
                    }}
                  >
                    Study Context
                  </button>
                </div>
              </div>

              {/* Right content area */}
              <div className="flex-1 p-6" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    {activeTab === 'general' ? 'General' : 'Study Context'}
                  </h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-zinc-400 hover:text-zinc-200 transition"
                  >
                    ✕
                  </button>
                </div>

                {activeTab === 'general' && (
                  <div className="space-y-6">
                    {/* Appearance setting */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>Appearance</label>
                      <select
                        value={appearance}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAppearance(val);
                          const newTheme = val === 'Light' ? 'light' : 'dark';
                          localStorage.setItem('nk-theme', newTheme);
                          applyTheme(newTheme);
                          window.dispatchEvent(new Event('storage'));
                        }}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none transition"
                        style={{
                          background: theme === 'dark' ? '#111111' : '#ffffff',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }}
                      >
                        <option value="Dark">Dark</option>
                        <option value="Light">Light</option>
                      </select>
                    </div>

                    {/* Language setting */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none transition"
                        style={{
                          background: theme === 'dark' ? '#111111' : '#ffffff',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }}
                      >
                        <option>Auto-detect</option>
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'context' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Syllabus Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => {
                          const subjName = e.target.value;
                          setSelectedSubject(subjName);
                          const subj = SUBJECTS_WITH_UNITS.find(s => s.name === subjName);
                          if (subj && subj.units.length > 0) {
                            const firstUnit = subj.units[0].name;
                            setSelectedUnit(firstUnit);
                            localStorage.setItem('nk-subject', subjName);
                            localStorage.setItem('nk-unit', firstUnit);
                            window.dispatchEvent(new Event('nk-context-change'));
                          }
                        }}
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition"
                        style={{
                          background: theme === 'dark' ? '#111111' : '#ffffff',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }}
                      >
                        {SUBJECTS_WITH_UNITS.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Subject Unit</label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => {
                          const unitName = e.target.value;
                          setSelectedUnit(unitName);
                          localStorage.setItem('nk-unit', unitName);
                          window.dispatchEvent(new Event('nk-context-change'));
                        }}
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition"
                        style={{
                          background: theme === 'dark' ? '#111111' : '#ffffff',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }}
                      >
                        {SUBJECTS_WITH_UNITS.find(s => s.name === selectedSubject)?.units.map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
