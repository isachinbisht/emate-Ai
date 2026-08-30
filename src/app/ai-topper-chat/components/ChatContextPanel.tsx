'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  Target,
  Zap,
  Clock,
  Zap as ZapIcon,
  BookOpen as BookOpenIcon,
} from 'lucide-react';
import type { SelectedContext, ChatMessage, StudyMode } from './AITopperChatScreen';
import { getSubjects, Subject } from '@/lib/notebook';

// Subjects are loaded dynamically from localStorage

const SUGGESTED_PROMPTS = [
  { id: 'sug-001', text: 'Explain BCNF with a 2-mark exam answer', tag: 'High PYQ' },
  { id: 'sug-002', text: 'List all functional dependencies in 3NF', tag: 'Concept' },
  { id: 'sug-003', text: 'Give me 5 MCQs on normalization', tag: 'Practice' },
  { id: 'sug-004', text: 'Difference between 2NF and 3NF in table form', tag: 'Sprint' },
  { id: 'sug-005', text: "Explain Armstrong's axioms for 10 marks", tag: 'Deep Dive' },
];

interface ChatContextPanelProps {
  selectedContext: SelectedContext;
  onContextChange: (ctx: SelectedContext) => void;
  mode: StudyMode;
  messages: ChatMessage[];
}

export default function ChatContextPanel({
  selectedContext,
  onContextChange,
  mode,
  messages,
}: ChatContextPanelProps) {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nk-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
      setTheme(savedTheme || 'light');
    };
    updateTheme();
    window.addEventListener('storage', updateTheme);
    return () => window.removeEventListener('storage', updateTheme);
  }, []);

  const [subjects, setSubjects] = useState<Subject[]>(() => getSubjects());

  useEffect(() => {
    const handleSubjectsChanged = () => {
      setSubjects(getSubjects());
    };
    window.addEventListener('nk-subjects-changed', handleSubjectsChanged);
    return () => window.removeEventListener('nk-subjects-changed', handleSubjectsChanged);
  }, []);

  const currentSubject = subjects.find((s) => s.name === selectedContext.subject);
  const sessionCount = messages.filter((m) => m.role === 'user').length;

  return (
    <aside
      className="flex flex-col w-full max-w-[320px] shrink-0 border-r transition-colors duration-300 shadow-lg"
      style={{
        background: theme === 'dark' ? '#0b0b0d' : '#f7f8fb',
        borderColor: theme === 'dark' ? 'rgba(138,162,255,0.10)' : 'rgba(31,81,255,0.10)',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} style={{ color: theme === 'dark' ? '#8aa2ff' : '#1f51ff' }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
          >
            Study Context
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-medium">
              Subject
            </p>
            <button
              onClick={() => {
                setSubjectOpen(!subjectOpen);
                setUnitOpen(false);
              }}
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:scale-[1.01]"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{selectedContext.subject}</span>
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform duration-200 ${subjectOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {subjectOpen && (
              <div
                className="mt-3 space-y-2 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl absolute z-30 w-72"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  background: theme === 'dark' ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.97)',
                }}
              >
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onContextChange({ subject: s.name, unit: s.units[0].name });
                      setSubjectOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      background:
                        s.name === selectedContext.subject
                          ? theme === 'dark'
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.06)'
                          : 'transparent',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontWeight: s.name === selectedContext.subject ? '600' : '400',
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-medium">
              Unit
            </p>
            <button
              onClick={() => {
                setUnitOpen(!unitOpen);
                setSubjectOpen(false);
              }}
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:scale-[1.01]"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{selectedContext.unit}</span>
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform duration-200 ${unitOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {unitOpen && (
              <div
                className="mt-3 max-h-56 overflow-auto rounded-2xl border p-2 shadow-2xl backdrop-blur-xl absolute z-30 w-72"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  background: theme === 'dark' ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.97)',
                }}
              >
                {currentSubject?.units.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onContextChange({ ...selectedContext, unit: u.name });
                      setUnitOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      background:
                        u.name === selectedContext.unit
                          ? theme === 'dark'
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.06)'
                          : 'transparent',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontWeight: u.name === selectedContext.unit ? '600' : '400',
                    }}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="px-4 py-4 border-b"
        style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500 font-medium">
          <Target size={13} style={{ color: theme === 'dark' ? '#8aa2ff' : '#1f51ff' }} />
          <span>PYQ Signal</span>
        </div>
        <div
          className="space-y-3 text-sm"
          style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
        >
          <div
            className="flex items-center justify-between rounded-2xl px-3 py-2.5"
            style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
          >
            <span>Exam probability</span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: theme === 'dark' ? 'rgba(138,162,255,0.16)' : 'rgba(31,81,255,0.10)',
                color: theme === 'dark' ? '#8aa2ff' : '#1f51ff',
              }}
            >
              High · 87%
            </span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-zinc-500 px-1">
            <span>Appeared in PYQs</span>
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}>
              4 / last 5 years
            </span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-zinc-500 px-1">
            <span>Avg marks weightage</span>
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}>
              10–14 marks
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500 font-medium">
          <Zap size={13} style={{ color: theme === 'dark' ? '#8aa2ff' : '#1f51ff' }} />
          <span>Suggested Prompts</span>
        </div>
        <div className="space-y-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              className="w-full rounded-2xl border px-4 py-3.5 text-left text-sm transition hover:scale-[1.01]"
              style={{
                borderColor: theme === 'dark' ? 'rgba(138,162,255,0.12)' : 'rgba(31,81,255,0.12)',
                background: theme === 'dark' ? 'rgba(138,162,255,0.06)' : 'rgba(31,81,255,0.05)',
                color: theme === 'dark' ? '#d4d4d8' : '#3f3f46',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}
                >
                  {prompt.text}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0"
                  style={{
                    background:
                      theme === 'dark' ? 'rgba(138,162,255,0.16)' : 'rgba(31,81,255,0.10)',
                    color: theme === 'dark' ? '#8aa2ff' : '#1f51ff',
                  }}
                >
                  {prompt.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-medium">
          <Clock size={13} style={{ color: theme === 'dark' ? '#8aa2ff' : '#1f51ff' }} />
          <span>This Session</span>
        </div>
        <div
          className="space-y-3 text-sm"
          style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}
        >
          <div className="flex items-center justify-between">
            <span>Messages</span>
            <span
              className="font-semibold tabular-nums"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              {sessionCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Mode</span>
            <span
              className="inline-flex items-center gap-1.5 font-semibold"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              {mode === 'sprint' ? (
                <>
                  <ZapIcon size={13} style={{ color: '#1f51ff' }} /> Sprint
                </>
              ) : (
                <>
                  <BookOpenIcon size={13} style={{ color: '#1f51ff' }} /> Deep Dive
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
