'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, Target, Zap, Clock } from 'lucide-react';
import type { SelectedContext, ChatMessage, StudyMode } from './AITopperChatScreen';

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

  const currentSubject = SUBJECTS_WITH_UNITS.find((s) => s.name === selectedContext.subject);
  const sessionCount = messages.filter((m) => m.role === 'user').length;

  return (
    <aside 
      className="flex flex-col w-full max-w-[320px] shrink-0 border-r transition-colors duration-300 shadow-lg"
      style={{
        background: theme === 'dark' ? '#090909' : '#f7f7f8',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div 
        className="px-4 py-5 border-b"
        style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }} />
          <h3 className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>Study Context</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-medium">Subject</p>
            <button
              onClick={() => {
                setSubjectOpen(!subjectOpen);
                setUnitOpen(false);
              }}
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:scale-[1.01]"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{selectedContext.subject}</span>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-200 ${subjectOpen ? 'rotate-180' : ''}`} />
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
                {SUBJECTS_WITH_UNITS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onContextChange({ subject: s.name, unit: s.units[0].name });
                      setSubjectOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      background: s.name === selectedContext.subject
                        ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
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
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-medium">Unit</p>
            <button
              onClick={() => {
                setUnitOpen(!unitOpen);
                setSubjectOpen(false);
              }}
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:scale-[1.01]"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{selectedContext.unit}</span>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-200 ${unitOpen ? 'rotate-180' : ''}`} />
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
                      background: u.name === selectedContext.unit
                        ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
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
          <Target size={13} />
          <span>PYQ Signal</span>
        </div>
        <div className="space-y-3 text-sm" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>
          <div 
            className="flex items-center justify-between rounded-2xl px-3 py-2.5"
            style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
          >
            <span>Exam probability</span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500">High · 87%</span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-zinc-500 px-1">
            <span>Appeared in PYQs</span>
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}>4 / last 5 years</span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-zinc-500 px-1">
            <span>Avg marks weightage</span>
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}>10–14 marks</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500 font-medium">
          <Zap size={13} />
          <span>Suggested Prompts</span>
        </div>
        <div className="space-y-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              className="w-full rounded-2xl border px-4 py-3.5 text-left text-sm transition hover:scale-[1.01]"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                color: theme === 'dark' ? '#d4d4d8' : '#3f3f46'
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: '500' }}>{prompt.text}</span>
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-500 shrink-0">
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
          <Clock size={13} />
          <span>This Session</span>
        </div>
        <div className="space-y-3 text-sm" style={{ color: theme === 'dark' ? '#d4d4d8' : '#3f3f46' }}>
          <div className="flex items-center justify-between">
            <span>Messages</span>
            <span className="font-semibold tabular-nums" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{sessionCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Mode</span>
            <span className={`font-semibold ${mode === 'sprint' ? 'text-amber-500' : 'text-sky-500'}`}>
              {mode === 'sprint' ? '⚡ Sprint' : '🔬 Deep Dive'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
