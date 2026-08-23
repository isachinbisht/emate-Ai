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
  Plus,
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
  Folder,
  BookMarked,
  User,
  Sun,
  Moon,
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [appearance, setAppearance] = useState<'Light' | 'Dark'>('Light');
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

  const [isGeneralWorkspaceActive, setIsGeneralWorkspaceActive] = useState(false);
  useEffect(() => {
    const handleSyncGeneralChat = () => {
      const active = localStorage.getItem('nk-general-chat-active') === 'true';
      setIsGeneralWorkspaceActive(active);
    };
    handleSyncGeneralChat();
    window.addEventListener('nk-general-chat-change', handleSyncGeneralChat);
    return () => {
      window.removeEventListener('nk-general-chat-change', handleSyncGeneralChat);
    };
  }, []);

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
        background: theme === 'dark' ? '#080809' : '#f9f9fb',
        borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
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
          <a
            href="/ai-topper-chat"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
            style={{
              background: isGeneralWorkspaceActive
                ? (theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)')
                : (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
              color: isGeneralWorkspaceActive
                ? (theme === 'dark' ? '#93c5fd' : '#2563eb')
                : (theme === 'dark' ? '#f4f4f5' : '#09090b'),
              border: isGeneralWorkspaceActive
                ? (theme === 'dark' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(59,130,246,0.2)')
                : '1px solid transparent'
            }}
          >
            <PenSquare size={14} />
            <span>{isGeneralWorkspaceActive ? 'General Workspace' : 'New chat'}</span>
          </a>

          <button
            type="button"
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: theme === 'dark' ? '#71717a' : '#71717a' }}
          >
            <Search size={14} />
            <span>Search</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: theme === 'dark' ? '#71717a' : '#71717a' }}
          >
            <BookOpen size={14} />
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
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5 px-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: theme === 'dark' ? '#3f3f46' : '#a1a1aa' }}>Notebooks</p>
            <button
              onClick={() => setShowManageModal(true)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md transition hover:opacity-80"
              style={{ color: theme === 'dark' ? '#71717a' : '#71717a', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
            >
              Manage
            </button>
          </div>
          <button
            type="button"
            onClick={handleCreateNotebook}
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors mb-1"
            style={{ color: theme === 'dark' ? '#52525b' : '#a1a1aa', border: theme === 'dark' ? '1px dashed rgba(255,255,255,0.08)' : '1px dashed rgba(0,0,0,0.1)' }}
          >
            <Plus size={13} />
            <span>New notebook</span>
          </button>

          <div className="mt-1 space-y-0.5">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group flex items-center rounded-lg px-3 py-2 transition-colors"
                style={{
                  background: selectedSubject === subject.name
                    ? (theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
                    : 'transparent',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSelectNotebook(subject.name)}
                  className="flex-1 text-left text-xs font-medium truncate flex items-center gap-2"
                  style={{ color: selectedSubject === subject.name ? (theme === 'dark' ? '#e4e4e7' : '#09090b') : (theme === 'dark' ? '#71717a' : '#71717a') }}
                >
                  <Folder size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
                  {subject.name}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { handleStartRename(subject); setShowManageModal(true); }}
                    className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition"
                    title="Rename"
                  >
                    <Edit2 size={10} style={{ color: '#a1a1aa' }} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(subject.id)}
                    className="p-1 rounded-md hover:bg-red-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 size={10} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent chats */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5 px-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: theme === 'dark' ? '#3f3f46' : '#a1a1aa' }}>Recent</p>
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
            <div className="space-y-0.5">
              {chatHistory.slice(0, 15).map((chat) => (
                <div
                  key={chat.id}
                  className="group relative w-full rounded-lg px-3 py-2 text-left transition-colors"
                  style={{ background: 'transparent' }}
                >
                  <div className="flex items-center justify-between gap-2 pr-4">
                    <span className="text-xs font-medium line-clamp-1" style={{ color: theme === 'dark' ? '#a1a1aa' : '#52525b' }}>{chat.title}</span>
                    <span className="text-[9px] shrink-0" style={{ color: theme === 'dark' ? '#3f3f46' : '#d4d4d8' }}>{formatChatTime(chat.timestamp)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChatSession(chat.id); }}
                    className="absolute right-2 top-1.5 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition"
                    title="Remove"
                  >
                    <Trash2 size={10} style={{ color: '#ef4444' }} />
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
          <div
            className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
            style={{
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
              background: theme === 'dark' ? '#111113' : '#ffffff',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div className="flex min-h-[460px]">
              {/* Left tab rail */}
              <div
                className="w-44 shrink-0 flex flex-col p-3 gap-0.5"
                style={{
                  borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                }}
              >
                <p className="text-[9px] font-mono uppercase tracking-widest px-3 pt-2 pb-1.5" style={{ color: '#52525b' }}>Settings</p>
                {([
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'context', label: 'Study Context', icon: Compass },
                  { id: 'notebook', label: 'My Notebook', icon: BookOpen },
                  { id: 'account', label: 'Account', icon: User },
                ] as { id: typeof activeTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all"
                    style={{
                      background: activeTab === id
                        ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                        : 'transparent',
                      color: activeTab === id
                        ? (theme === 'dark' ? '#f4f4f5' : '#09090b')
                        : (theme === 'dark' ? '#71717a' : '#71717a'),
                    }}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Right content panel */}
              <div className="flex-1 flex flex-col p-6">
                {/* Panel header */}
                <div className="flex items-center justify-between mb-5 shrink-0">
                  <h2 className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#f4f4f5' : '#09090b' }}>
                    {activeTab === 'general' ? 'General' : activeTab === 'context' ? 'Study Context' : activeTab === 'notebook' ? `${selectedSubject} Notebook` : 'Account'}
                  </h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-md transition"
                    style={{
                      color: '#71717a',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* ── General tab ── */}
                {activeTab === 'general' && (
                  <div className="space-y-5">
                    {/* Appearance */}
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl"
                      style={{
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                      }}
                    >
                      <div>
                        <p className="text-xs font-semibold" style={{ color: theme === 'dark' ? '#e4e4e7' : '#18181b' }}>Appearance</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#71717a' }}>Interface colour scheme</p>
                      </div>
                      <div
                        className="flex items-center p-0.5 rounded-lg gap-0.5"
                        style={{
                          background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        {(['Light', 'Dark'] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setAppearance(opt);
                              const newTheme = opt === 'Light' ? 'light' : 'dark';
                              localStorage.setItem('nk-theme', newTheme);
                              applyTheme(newTheme);
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
                            style={{
                              background: appearance === opt
                                ? (theme === 'dark' ? '#27272a' : '#ffffff')
                                : 'transparent',
                              color: appearance === opt
                                ? (theme === 'dark' ? '#f4f4f5' : '#09090b')
                                : '#71717a',
                              boxShadow: appearance === opt ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            }}
                          >
                            {opt === 'Light' ? <Sun size={11} /> : <Moon size={11} />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div
                      className="p-3.5 rounded-xl"
                      style={{
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                      }}
                    >
                      <p className="text-xs font-semibold mb-0.5" style={{ color: theme === 'dark' ? '#e4e4e7' : '#18181b' }}>Language</p>
                      <p className="text-[11px] mb-3" style={{ color: '#71717a' }}>AI response language</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Auto-detect', 'English', 'Hindi', 'Spanish', 'French', 'German'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                            style={{
                              background: language === lang
                                ? (theme === 'dark' ? '#27272a' : '#09090b')
                                : (theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                              color: language === lang
                                ? (theme === 'dark' ? '#f4f4f5' : '#ffffff')
                                : (theme === 'dark' ? '#a1a1aa' : '#71717a'),
                              border: language === lang
                                ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)')
                                : (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)'),
                            }}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guide */}
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl"
                      style={{
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                      }}
                    >
                      <div>
                        <p className="text-xs font-semibold" style={{ color: theme === 'dark' ? '#e4e4e7' : '#18181b' }}>Interactive Guide</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#71717a' }}>Learn e-Mate's advanced features</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowSettingsModal(false);
                          window.dispatchEvent(new Event('nk-launch-guide'));
                        }}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition hover:opacity-85"
                        style={{ background: theme === 'dark' ? '#ffffff' : '#09090b', color: theme === 'dark' ? '#000000' : '#ffffff' }}
                      >
                        Launch Guide
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Study Context tab ── */}
                {activeTab === 'context' && (
                  <div className="space-y-5 flex-1 overflow-y-auto">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#71717a' }}>Syllabus Subject</p>
                      <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto pr-1">
                        {subjects.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedSubject(s.name);
                              const firstUnit = s.units[0]?.name ?? '';
                              if (firstUnit) setSelectedUnit(firstUnit);
                              localStorage.setItem('nk-subject', s.name);
                              if (firstUnit) localStorage.setItem('nk-unit', firstUnit);
                              window.dispatchEvent(new Event('nk-context-change'));
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all"
                            style={{
                              background: selectedSubject === s.name
                                ? (theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
                                : 'transparent',
                              color: selectedSubject === s.name
                                ? (theme === 'dark' ? '#f4f4f5' : '#09090b')
                                : (theme === 'dark' ? '#71717a' : '#71717a'),
                              border: selectedSubject === s.name
                                ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)')
                                : '1px solid transparent',
                            }}
                          >
                            {s.name}
                            {selectedSubject === s.name && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#71717a' }} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#71717a' }}>Unit / Topic</p>
                      <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto pr-1">
                        {(subjects.find(s => s.name === selectedSubject)?.units ?? []).map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setSelectedUnit(u.name);
                              localStorage.setItem('nk-unit', u.name);
                              window.dispatchEvent(new Event('nk-context-change'));
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all"
                            style={{
                              background: selectedUnit === u.name
                                ? (theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
                                : 'transparent',
                              color: selectedUnit === u.name
                                ? (theme === 'dark' ? '#f4f4f5' : '#09090b')
                                : (theme === 'dark' ? '#71717a' : '#71717a'),
                              border: selectedUnit === u.name
                                ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)')
                                : '1px solid transparent',
                            }}
                          >
                            {u.name}
                            {selectedUnit === u.name && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#71717a' }} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Notebook tab ── */}
                {activeTab === 'notebook' && (
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#71717a' }}>Notes ({notebookNotes.length})</span>
                        {notebookNotes.length > 0 && (
                          <button
                            onClick={() => { clearNotebook(selectedSubject); setNotebookNotes([]); }}
                            className="text-[11px] text-red-500 hover:text-red-400 font-semibold transition"
                          >Clear All</button>
                        )}
                      </div>
                      {notebookNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-36 rounded-xl border border-dashed" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                          <p className="text-[11px] text-zinc-500 text-center px-4">No notes yet. Notes are auto-saved when you chat.</p>
                        </div>
                      ) : notebookNotes.map((note) => (
                        <div key={note.id} className="group flex items-start justify-between gap-3 p-3 rounded-xl border" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>{note.content}</p>
                            <span className="text-[10px] text-zinc-500 block mt-1">{note.timestamp} · {note.source === 'ai' ? 'Auto-saved' : 'Manual'}</span>
                          </div>
                          <button onClick={() => { deleteNotebookEntry(selectedSubject, note.id); setNotebookNotes(prev => prev.filter(n => n.id !== note.id)); }} className="text-zinc-500 hover:text-red-500 transition p-1" title="Delete"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t shrink-0" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Add a study preference or note..."
                          className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none transition"
                          style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)', color: theme === 'dark' ? '#ffffff' : '#000000' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newNoteText.trim()) {
                              appendToNotebook(selectedSubject, newNoteText.trim(), 'user');
                              setNotebookNotes(getNotebook(selectedSubject).entries);
                              setNewNoteText('');
                            }
                          }}
                        />
                        <button
                          onClick={() => { if (newNoteText.trim()) { appendToNotebook(selectedSubject, newNoteText.trim(), 'user'); setNotebookNotes(getNotebook(selectedSubject).entries); setNewNoteText(''); } }}
                          disabled={!newNoteText.trim()}
                          className="px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-40"
                          style={{ background: theme === 'dark' ? '#27272a' : '#09090b', color: theme === 'dark' ? '#f4f4f5' : '#ffffff', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.12)' }}
                        >Add</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Account tab ── */}
                {activeTab === 'account' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: theme === 'dark' ? '#27272a' : '#f4f4f5', color: theme === 'dark' ? '#f4f4f5' : '#09090b' }}>
                        {avatarLabel}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: theme === 'dark' ? '#f4f4f5' : '#09090b' }}>{profileName}</p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: '#71717a' }}>{profileSubtitle}</p>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 shrink-0" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)', color: theme === 'dark' ? '#a1a1aa' : '#52525b' }}>
                        {isGuest ? 'Guest' : 'Pro'}
                      </span>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all hover:bg-red-500/8 active:scale-[0.99]"
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                    >
                      <LogOut size={13} />
                      Sign Out of e-Mate
                    </button>
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
