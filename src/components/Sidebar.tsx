"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isGuestModeEnabled, clearGuestModeEnabled } from '@/lib/guest-mode';
import { createClient } from '@/lib/supabase/client';
import { applyTheme } from '@/lib/theme';
import { getNotebook, saveNotebook, clearNotebook, deleteNotebookEntry, appendToNotebook, getSubjects, addSubject, deleteSubject, renameSubject, SubjectNotebook, NotebookEntry, Subject } from '@/lib/notebook';
import { getChatHistory, deleteChatSession, clearChatHistory, formatChatTime, ChatHistoryItem } from '@/lib/chatHistory';
import {
  Search,
  Image,
  PenSquare,
  Settings,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  LogOut,
  Trash2,
  PlusCircle,
  X,
  Sparkles,
  FlaskConical,
  Code2,
  Calculator,
  Globe,
  Atom,
  Edit2,
  Check,
  MoreHorizontal,
  Compass,
  Target,
  Zap,
  ArrowLeft,
} from 'lucide-react';

// Data now fetched dynamically from localStorage

interface SidebarProps {
  onToggle?: () => void;
  width?: number;
}

export default function Sidebar({ onToggle, width = 248 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  const [profileName, setProfileName] = useState('Guest');
  const [profileSubtitle, setProfileSubtitle] = useState('Guest mode');
  const [avatarLabel, setAvatarLabel] = useState('G');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nk-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });
  const [appearance, setAppearance] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nk-theme');
      if (saved === 'light') return 'Light';
    }
    return 'Dark';
  });
  const [language, setLanguage] = useState('Auto-detect');
  const [activeTab, setActiveTab] = useState<'general' | 'context' | 'notebook' | 'account'>('general');
  const [selectedSubject, setSelectedSubject] = useState('DBMS');
  const [selectedUnit, setSelectedUnit] = useState('Normalization (3NF/BCNF)');
  const [newNoteText, setNewNoteText] = useState('');
  const [notebookNotes, setNotebookNotes] = useState<NotebookEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(() => getSubjects());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectEmoji, setNewSubjectEmoji] = useState('📚');
  const [newSubjectType, setNewSubjectType] = useState('');

  // ── Study Context panel state ────────────────────────────────────────────
  const [showStudyContext, setShowStudyContext] = useState(false);
  const [subjectDropOpen, setSubjectDropOpen] = useState(false);
  const [unitDropOpen, setUnitDropOpen] = useState(false);

  const SUGGESTED_PROMPTS = [
    { id: 'p1', text: 'Explain BCNF with a 2-mark exam answer', tag: 'High PYQ' },
    { id: 'p2', text: 'List all functional dependencies in 3NF', tag: 'Concept' },
    { id: 'p3', text: 'Give me 5 MCQs on normalization', tag: 'Practice' },
    { id: 'p4', text: 'Difference between 2NF and 3NF in table form', tag: 'Sprint' },
  ];

  const SUBJECT_TYPES = [
    { label: 'Science', emoji: '🔬', icon: FlaskConical },
    { label: 'Technology', emoji: '💻', icon: Code2 },
    { label: 'Math', emoji: '📐', icon: Calculator },
    { label: 'Language', emoji: '🌐', icon: Globe },
    { label: 'Physics', emoji: '⚛️', icon: Atom },
    { label: 'General', emoji: '✨', icon: Sparkles },
  ];

  const EMOJI_PICKS = ['📚', '🔬', '💻', '📐', '🌐', '⚛️', '🧠', '📊', '🎯', '🏆', '💡', '🖊️'];

  useEffect(() => {
    const handleSubjectsChanged = () => {
      setSubjects(getSubjects());
    };
    window.addEventListener('nk-subjects-changed', handleSubjectsChanged);
    return () => window.removeEventListener('nk-subjects-changed', handleSubjectsChanged);
  }, []);

  // ── Real-time chat history sync ────────────────────────────────────────
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => getChatHistory());

  useEffect(() => {
    const handleHistoryChange = () => setChatHistory(getChatHistory());
    window.addEventListener('nk-chat-history-change', handleHistoryChange);
    // Also sync when another tab writes to localStorage
    window.addEventListener('storage', handleHistoryChange);
    return () => {
      window.removeEventListener('nk-chat-history-change', handleHistoryChange);
      window.removeEventListener('storage', handleHistoryChange);
    };
  }, []);

  const handleCreateNotebook = () => {
    setNewSubjectName('');
    setNewSubjectEmoji('📚');
    setNewSubjectType('');
    setShowCreateModal(true);
  };

  const handleConfirmCreate = () => {
    const name = newSubjectName.trim();
    if (!name) return;
    addSubject(name);
    handleSelectNotebook(name);
    setShowCreateModal(false);
  };

  // ── Manage Notebooks Modal ────────────────────────────────────────────────
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteSubject = (id: string) => {
    const updated = deleteSubject(id);
    setConfirmDeleteId(null);
    // If active subject was deleted, switch to first remaining
    const deletedSubject = subjects.find(s => s.id === id);
    if (deletedSubject && selectedSubject === deletedSubject.name) {
      const remaining = updated;
      if (remaining.length > 0) {
        handleSelectNotebook(remaining[0].name);
      }
    }
  };

  const handleStartRename = (subj: Subject) => {
    setEditingSubjectId(subj.id);
    setEditingSubjectName(subj.name);
  };

  const handleConfirmRename = (id: string) => {
    const trimmed = editingSubjectName.trim();
    if (!trimmed) return;
    renameSubject(id, trimmed);
    setEditingSubjectId(null);
  };

  useEffect(() => {
    if (showSettingsModal) {
      setNotebookNotes(getNotebook(selectedSubject).entries);
    }
  }, [showSettingsModal, selectedSubject]);

  useEffect(() => {
    const handleNotebookChange = (e: any) => {
      if (e.detail?.subject === selectedSubject) {
        setNotebookNotes(getNotebook(selectedSubject).entries);
      }
    };
    window.addEventListener('nk-notebook-change', handleNotebookChange);
    return () => window.removeEventListener('nk-notebook-change', handleNotebookChange);
  }, [selectedSubject]);

  useEffect(() => {
    const handleOpenSettings = () => {
      // Open study context panel inside sidebar instead of modal
      setShowStudyContext(true);
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

  const handleSignOut = async () => {
    clearGuestModeEnabled();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-up-login-screen');
    setShowSettingsModal(false);
  };

  const handleSelectNotebook = (subjName: string) => {
    const subj = subjects.find(s => s.name === subjName);
    const firstUnit = subj?.units?.[0]?.name ?? '';
    setSelectedSubject(subjName);
    if (firstUnit) setSelectedUnit(firstUnit);
    localStorage.setItem('nk-subject', subjName);
    if (firstUnit) localStorage.setItem('nk-unit', firstUnit);
    window.dispatchEvent(new Event('nk-context-change'));
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside
        className="relative flex flex-col shrink-0 transition-colors duration-300"
      style={{
        width: `${width}px`,
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

        {/* Logo + collapse button */}
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

        {/* Nav */}
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

          {/* ── Study Context inline accordion ── */}
          <div>
            <button
              type="button"
              onClick={() => { setShowStudyContext(!showStudyContext); setSubjectDropOpen(false); setUnitDropOpen(false); }}
              className="flex items-center justify-between w-full rounded-2xl px-2.5 py-2.5 text-sm font-medium transition"
              style={{
                background: showStudyContext ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                color: theme === 'dark' ? '#d4d4d8' : '#3f3f46',
              }}
            >
              <span className="flex items-center gap-3">
                <Compass size={18} />
                <span>Study Context</span>
              </span>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${showStudyContext ? 'rotate-180' : ''}`} />
            </button>

            {/* Accordion body */}
            {showStudyContext && (
              <div
                className="mt-2 mb-1 rounded-2xl border p-3 space-y-3"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                }}
              >
                {/* Close pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium">Context</span>
                  <button
                    onClick={() => { setShowStudyContext(false); setSubjectDropOpen(false); setUnitDropOpen(false); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full transition hover:opacity-70"
                    style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#a1a1aa' : '#71717a' }}
                    title="Close"
                  >
                    <X size={11} />
                  </button>
                </div>

                {/* Subject */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-medium mb-1">Subject</p>
                  <div className="relative">
                    <button
                      onClick={() => { setSubjectDropOpen(!subjectDropOpen); setUnitDropOpen(false); }}
                      className="w-full rounded-full border px-3 py-2 text-left text-xs font-medium transition flex items-center justify-between"
                      style={{
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        color: theme === 'dark' ? '#ffffff' : '#000000'
                      }}
                    >
                      <span className="truncate">{selectedSubject}</span>
                      <ChevronDown size={12} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${subjectDropOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {subjectDropOpen && (
                      <div
                        className="mt-1 rounded-2xl border p-1 shadow-xl z-30 w-full"
                        style={{
                          background: theme === 'dark' ? 'rgba(20,20,20,0.98)' : 'rgba(255,255,255,0.98)',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        }}
                      >
                        {subjects.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { handleSelectNotebook(s.name); setSubjectDropOpen(false); }}
                            className="w-full rounded-xl px-3 py-1.5 text-left text-xs transition"
                            style={{
                              background: s.name === selectedSubject ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
                              color: theme === 'dark' ? '#ffffff' : '#000000',
                              fontWeight: s.name === selectedSubject ? '600' : '400',
                            }}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-medium mb-1">Unit</p>
                  <div className="relative">
                    <button
                      onClick={() => { setUnitDropOpen(!unitDropOpen); setSubjectDropOpen(false); }}
                      className="w-full rounded-full border px-3 py-2 text-left text-xs font-medium transition flex items-center justify-between"
                      style={{
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        color: theme === 'dark' ? '#ffffff' : '#000000'
                      }}
                    >
                      <span className="truncate">{selectedUnit}</span>
                      <ChevronDown size={12} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${unitDropOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {unitDropOpen && (() => {
                      const curSubj = subjects.find(s => s.name === selectedSubject);
                      return (
                        <div
                          className="mt-1 rounded-2xl border p-1 shadow-xl z-30 w-full max-h-40 overflow-y-auto"
                          style={{
                            background: theme === 'dark' ? 'rgba(20,20,20,0.98)' : 'rgba(255,255,255,0.98)',
                            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          }}
                        >
                          {curSubj?.units.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setSelectedUnit(u.name);
                                localStorage.setItem('nk-unit', u.name);
                                window.dispatchEvent(new Event('nk-context-change'));
                                setUnitDropOpen(false);
                              }}
                              className="w-full rounded-xl px-3 py-1.5 text-left text-xs transition"
                              style={{
                                background: u.name === selectedUnit ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                color: theme === 'dark' ? '#ffffff' : '#000000',
                                fontWeight: u.name === selectedUnit ? '600' : '400',
                              }}
                            >
                              {u.name}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                {/* PYQ Signal */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5 text-[9px] uppercase tracking-[0.24em] text-zinc-500 font-medium">
                    <Target size={10} />
                    <span>PYQ Signal</span>
                  </div>
                  <div
                    className="flex items-center justify-between rounded-xl px-2.5 py-1.5 mb-1"
                    style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                  >
                    <span className="text-[11px]" style={{ color: theme === 'dark' ? '#a1a1aa' : '#52525b' }}>Exam probability</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>High · 87%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                    <span>Appeared in PYQs</span>
                    <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}>4 / last 5 yrs</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                {/* Suggested Prompts */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5 text-[9px] uppercase tracking-[0.24em] text-zinc-500 font-medium">
                    <Zap size={10} />
                    <span>Quick Prompts</span>
                  </div>
                  <div className="space-y-1.5">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('nk-send-prompt', { detail: { text: prompt.text } }));
                          setShowStudyContext(false);
                        }}
                        className="w-full rounded-xl border px-2.5 py-2 text-left transition hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent',
                        }}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[11px] leading-snug" style={{ color: theme === 'dark' ? '#e4e4e7' : '#27272a', fontWeight: '500' }}>{prompt.text}</span>
                          <span className="rounded-full px-1 py-0.5 text-[8px] font-semibold shrink-0" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: '#71717a' }}>{prompt.tag}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Notebooks */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Notebooks</p>
            <button
              onClick={() => setShowManageModal(true)}
              className="text-[10px] font-semibold px-3 py-1 rounded-full transition hover:opacity-80"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000', background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
            >
              Manage
            </button>
          </div>
          <button
            type="button"
            onClick={handleCreateNotebook}
            className="flex items-center gap-3 w-full rounded-2xl border px-2.5 py-2 text-sm font-semibold transition hover:scale-[1.01]"
            style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>+</span>
            <span>New notebook</span>
          </button>

          <div className="mt-2 space-y-1">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group flex items-center rounded-full px-3 py-1.5 transition"
                style={{
                  background: selectedSubject === subject.name
                    ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
                    : 'transparent',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSelectNotebook(subject.name)}
                  className="flex-1 text-left text-sm font-semibold truncate"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                >
                  📚 {subject.name}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { handleStartRename(subject); setShowManageModal(true); }}
                    className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                    title="Rename"
                  >
                    <Edit2 size={11} style={{ color: '#a1a1aa' }} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(subject.id)}
                    className="p-1 rounded-lg hover:bg-red-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 size={11} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent chats */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Recent</p>
            {chatHistory.length > 0 && (
              <button
                onClick={() => clearChatHistory()}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg transition hover:opacity-80"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
              >
                Clear
              </button>
            )}
          </div>
          {chatHistory.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs" style={{ color: '#a1a1aa' }}>No recent chats yet.</p>
              <p className="text-[11px] mt-1" style={{ color: '#71717a' }}>Start a conversation to see it here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.slice(0, 15).map((chat) => (
                <div
                  key={chat.id}
                  className="group relative w-full rounded-2xl border px-2.5 py-2.5 text-left transition hover:scale-[1.01]"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                >
                  <div className="flex items-start justify-between gap-2 pr-5">
                    <span className="text-sm font-semibold line-clamp-1" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{chat.title}</span>
                    <span className="text-[10px] shrink-0 text-zinc-500">{formatChatTime(chat.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-400">{chat.subject}</span>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                      style={{
                        background: chat.mode === 'sprint' ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.15)',
                        color: chat.mode === 'sprint' ? '#fbbf24' : '#818cf8',
                      }}
                    >
                      {chat.mode}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChatSession(chat.id); }}
                    className="absolute right-2 top-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition"
                    title="Remove"
                  >
                    <Trash2 size={11} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
          className="flex items-center justify-between rounded-2xl px-2.5 py-2 transition"
          style={{ 
            background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold" style={{ background: theme === 'dark' ? '#52525b' : '#d4d4d8', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              {avatarLabel}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="truncate text-sm font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{profileName}</p>
              <p className="truncate text-xs text-zinc-500">{profileSubtitle}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition shrink-0 ml-1"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
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
                  <button 
                    onClick={() => setActiveTab('notebook')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition" 
                    style={{ 
                      color: activeTab === 'notebook' ? (theme === 'dark' ? '#ffffff' : '#000000') : '#a1a1aa', 
                      background: activeTab === 'notebook' ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent' 
                    }}
                  >
                    Notebook Notes
                  </button>
                  <button 
                    onClick={() => setActiveTab('account')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition" 
                    style={{ 
                      color: activeTab === 'account' ? (theme === 'dark' ? '#ffffff' : '#000000') : '#a1a1aa', 
                      background: activeTab === 'account' ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent' 
                    }}
                  >
                    Account
                  </button>
                </div>
              </div>

              {/* Right content area */}
              <div className="flex-1 p-6" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    {activeTab === 'general' ? 'General Settings' : activeTab === 'context' ? 'Study Context' : activeTab === 'notebook' ? `${selectedSubject} Notebook` : 'Account Settings'}
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
                    {/* Welcome Guide */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>Interactive Guide</label>
                        <span className="text-[11px] text-zinc-500">Learn how to use e-Mate's advanced features</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowSettingsModal(false);
                          window.dispatchEvent(new Event('nk-launch-guide'));
                        }}
                        className="px-4 py-2 rounded-full text-xs font-semibold transition hover:opacity-85"
                        style={{ 
                          background: theme === 'dark' ? '#ffffff' : '#000000', 
                          color: theme === 'dark' ? '#000000' : '#ffffff' 
                        }}
                      >
                        Launch Guide
                      </button>
                    </div>
                  </div>
                )}                 {activeTab === 'context' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Syllabus Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => {
                          const subjName = e.target.value;
                          setSelectedSubject(subjName);
                          const subj = subjects.find(s => s.name === subjName);
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
                        {subjects.map(s => (
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
                        {subjects.find(s => s.name === selectedSubject)?.units.map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'notebook' && (
                  <div className="flex flex-col h-[340px] justify-between">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Saved Personalization Notes ({notebookNotes.length})</span>
                        {notebookNotes.length > 0 && (
                          <button
                            onClick={() => {
                              clearNotebook(selectedSubject);
                              setNotebookNotes([]);
                            }}
                            className="text-xs text-red-500 hover:text-red-400 font-semibold transition"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {notebookNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-44 border border-dashed rounded-xl p-4" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                          <p className="text-xs text-zinc-500 text-center">No notes collected yet. Notes are saved automatically when you chat or you can add manual notes below to personalize e-Mate!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notebookNotes.map((note) => (
                            <div
                              key={note.id}
                              className="group flex items-start justify-between gap-3 p-3 rounded-xl border"
                              style={{
                                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>{note.content}</p>
                                <span className="text-[10px] text-zinc-500 block mt-1">{note.timestamp} · {note.source === 'ai' ? 'Saved response' : 'Custom preference'}</span>
                              </div>
                              <button
                                onClick={() => {
                                  deleteNotebookEntry(selectedSubject, note.id);
                                  setNotebookNotes(prev => prev.filter(n => n.id !== note.id));
                                }}
                                className="text-zinc-500 hover:text-red-500 transition p-1"
                                title="Delete note"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t shrink-0" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1.5">Add Personalization Preference</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="e.g. Focus on coding examples, explain with analogies..."
                          className="flex-1 px-3 py-2 border rounded-xl text-xs focus:outline-none transition"
                          style={{
                            background: theme === 'dark' ? '#111111' : '#ffffff',
                            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                            color: theme === 'dark' ? '#ffffff' : '#000000'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newNoteText.trim()) {
                              const txt = newNoteText.trim();
                              appendToNotebook(selectedSubject, txt, 'user');
                              setNotebookNotes(getNotebook(selectedSubject).entries);
                              setNewNoteText('');
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newNoteText.trim()) {
                              const txt = newNoteText.trim();
                              appendToNotebook(selectedSubject, txt, 'user');
                              setNotebookNotes(getNotebook(selectedSubject).entries);
                              setNewNoteText('');
                            }
                          }}
                          disabled={!newNoteText.trim()}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-3xl border flex items-center justify-between" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                      <div>
                        <h4 className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{profileName}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{profileSubtitle}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider rounded-full px-2.5 py-0.5" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        {isGuest ? 'Guest User' : 'Authenticated'}
                      </span>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full border text-sm font-semibold text-red-500 hover:bg-red-500/10 border-red-500/20 transition-all active:scale-[0.99]"
                      >
                        <LogOut size={16} />
                        <span>Sign Out of e-Mate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: theme === 'dark' ? '#111111' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Header gradient band */}
            <div
              className="px-6 pt-6 pb-5"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.01) 100%)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={18} style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>New Study Notebook</span>
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111111' }}>
                    Set up your notebook
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#a1a1aa' }}>
                    Create a personalised notebook to track your learning and get custom AI answers.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl transition hover:opacity-70 ml-4 shrink-0"
                  style={{ color: '#a1a1aa' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Emoji + Name input */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#a1a1aa' }}>
                  Subject Name
                </label>
                <div className="flex gap-2">
                  {/* Emoji button */}
                  <div className="relative">
                    <button
                      className="h-12 w-12 rounded-2xl text-2xl flex items-center justify-center border shrink-0 transition hover:scale-105"
                      style={{
                        background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }}
                      title="Choose emoji"
                    >
                      {newSubjectEmoji}
                    </button>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Discrete Mathematics, Machine Learning…"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCreate(); }}
                    className="flex-1 h-12 rounded-full border px-5 text-sm focus:outline-none transition"
                    style={{
                      background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: newSubjectName.trim()
                        ? (theme === 'dark' ? '#ffffff' : '#000000')
                        : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                      color: theme === 'dark' ? '#ffffff' : '#111111',
                    }}
                  />
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#a1a1aa' }}>
                  Pick an Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {['📚', '🔬', '💻', '📐', '🌐', '⚛️', '🧠', '📊', '🎯', '🏆', '💡', '🖊️'].map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewSubjectEmoji(em)}
                      className="h-10 w-10 rounded-full text-xl flex items-center justify-center border transition hover:scale-110"
                      style={{
                        background: newSubjectEmoji === em
                          ? (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)')
                          : (theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                        borderColor: newSubjectEmoji === em
                          ? (theme === 'dark' ? '#ffffff' : '#000000')
                          : (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                        transform: newSubjectEmoji === em ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Type chips */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#a1a1aa' }}>
                  Subject Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Science', emoji: '🔬' },
                    { label: 'Technology', emoji: '💻' },
                    { label: 'Mathematics', emoji: '📐' },
                    { label: 'Language', emoji: '🌐' },
                    { label: 'Physics', emoji: '⚛️' },
                    { label: 'General', emoji: '✨' },
                  ].map((type) => (
                    <button
                      key={type.label}
                      onClick={() => setNewSubjectType(type.label)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition hover:scale-[1.02]"
                      style={{
                        background: newSubjectType === type.label
                          ? (theme === 'dark' ? '#ffffff' : '#000000')
                          : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                        borderColor: newSubjectType === type.label
                          ? (theme === 'dark' ? '#ffffff' : '#000000')
                          : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                        color: newSubjectType === type.label
                          ? (theme === 'dark' ? '#000000' : '#ffffff')
                          : (theme === 'dark' ? '#d4d4d8' : '#3f3f46'),
                      }}
                    >
                      <span>{type.emoji}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview card */}
              {newSubjectName.trim() && (
                <div
                  className="rounded-3xl p-4 border"
                  style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{newSubjectEmoji}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: theme === 'dark' ? '#ffffff' : '#111111' }}>
                        {newSubjectName}
                      </p>
                      <p className="text-xs" style={{ color: '#a1a1aa' }}>
                        {newSubjectType || 'Study'} Notebook · AI-personalised
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        New
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-11 rounded-full border text-sm font-semibold transition hover:opacity-80"
                  style={{
                    background: 'transparent',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                    color: theme === 'dark' ? '#a1a1aa' : '#3f3f46',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={!newSubjectName.trim()}
                  className="flex-1 h-11 rounded-full text-sm font-bold transition flex items-center justify-center gap-2"
                  style={{
                    background: newSubjectName.trim()
                      ? (theme === 'dark' ? '#ffffff' : '#000000')
                      : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                    color: newSubjectName.trim() ? (theme === 'dark' ? '#000000' : '#ffffff') : '#a1a1aa',
                    cursor: newSubjectName.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: newSubjectName.trim() ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <BookOpen size={15} />
                  Create Notebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Notebooks Modal ──────────────────────────────────────── */}
      {showManageModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowManageModal(false); setEditingSubjectId(null); } }}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: theme === 'dark' ? '#111111' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-5 flex items-start justify-between"
              style={{
                background: theme === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.02)',
                borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div>
              <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>My Notebooks</span>
                </div>
                <h2 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111111' }}>
                  Manage Notebooks
                </h2>
                <p className="text-sm mt-0.5" style={{ color: '#a1a1aa' }}>
                  Rename or delete your study notebooks.
                </p>
              </div>
              <button
                onClick={() => { setShowManageModal(false); setEditingSubjectId(null); }}
                className="p-1.5 rounded-xl transition hover:opacity-70 ml-4 shrink-0"
                style={{ color: '#a1a1aa' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Notebook list */}
            <div className="px-5 py-4 space-y-2 max-h-[420px] overflow-y-auto">
              {subjects.length === 0 && (
                <div className="text-center py-10">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" style={{ color: '#a1a1aa' }} />
                  <p className="text-sm" style={{ color: '#a1a1aa' }}>No notebooks yet. Create one to get started.</p>
                </div>
              )}

              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="rounded-2xl border px-4 py-3 flex items-center gap-3 transition group"
                  style={{
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                    background: selectedSubject === subj.name
                      ? (theme === 'dark' ? 'rgba(16,163,127,0.08)' : 'rgba(16,163,127,0.04)')
                      : (theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  }}
                >
                  {/* Emoji */}
                  <span className="text-2xl shrink-0">📚</span>

                  {/* Name / Edit input */}
                  <div className="flex-1 min-w-0">
                    {editingSubjectId === subj.id ? (
                      <input
                        autoFocus
                        className="w-full text-sm font-semibold rounded-lg px-2 py-1 focus:outline-none"
                        style={{
                          background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                          color: theme === 'dark' ? '#ffffff' : '#111111',
                          border: '1px solid #10a37f',
                        }}
                        value={editingSubjectName}
                        onChange={(e) => setEditingSubjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename(subj.id);
                          if (e.key === 'Escape') setEditingSubjectId(null);
                        }}
                      />
                    ) : (
                      <div>
                        <p className="text-sm font-semibold truncate" style={{ color: theme === 'dark' ? '#ffffff' : '#111111' }}>
                          {subj.name}
                        </p>
                        <p className="text-xs" style={{ color: '#a1a1aa' }}>
                          {getNotebook(subj.name).entries.length} saved notes
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Active badge */}
                  {selectedSubject === subj.name && editingSubjectId !== subj.id && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                      Active
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {editingSubjectId === subj.id ? (
                      <>
                        <button
                          onClick={() => handleConfirmRename(subj.id)}
                          className="p-1.5 rounded-full transition"
                          style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
                          title="Save rename"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setEditingSubjectId(null)}
                          className="p-1.5 rounded-lg transition hover:opacity-70"
                          style={{ color: '#a1a1aa' }}
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartRename(subj)}
                          className="p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                          style={{ color: '#a1a1aa' }}
                          title="Rename notebook"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(subj.id)}
                          className="p-1.5 rounded-lg transition hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                          style={{ color: '#ef4444' }}
                          title="Delete notebook"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)' }}
            >
              <button
                onClick={() => { setShowManageModal(false); handleCreateNotebook(); }}
                className="flex items-center gap-2 text-sm font-semibold transition hover:opacity-80"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                <PlusCircle size={15} />
                New Notebook
              </button>
              <button
                onClick={() => { setShowManageModal(false); setEditingSubjectId(null); }}
                className="px-5 h-9 rounded-full border text-sm font-semibold transition hover:opacity-80"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                  color: theme === 'dark' ? '#d4d4d8' : '#3f3f46',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Delete Confirmation ───────────────────────────────────── */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <Trash2 size={18} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: theme === 'dark' ? '#ffffff' : '#111111' }}>Delete Notebook?</p>
                <p className="text-xs mt-0.5" style={{ color: '#a1a1aa' }}>
                  {subjects.find(s => s.id === confirmDeleteId)?.name}
                </p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: '#a1a1aa' }}>
              All saved notes and personalization data for this notebook will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-10 rounded-xl border text-sm font-semibold transition hover:opacity-80"
                style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubject(confirmDeleteId)}
                className="flex-1 h-10 rounded-xl text-sm font-bold transition"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
