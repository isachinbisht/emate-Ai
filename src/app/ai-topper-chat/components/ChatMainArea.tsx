'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Zap,
    BookOpen,
    RotateCcw,
    Square,
    Mic,
    Plus,
    ChevronDown,
    Brain,
    FileText,
    Lightbulb,
    Sparkles,
} from 'lucide-react';
import ChatMessageBubble from './ChatMessageBubble';
import StreamingIndicator from './StreamingIndicator';
import type { ChatMessage, SelectedContext, StudyMode } from './AITopperChatScreen';
import { applyTheme } from '@/lib/theme';
import { ModelSelector } from '@/components/ModelSelector';

const QUICK_ACTIONS = [
    {
        icon: FileText,
        label: 'Generate high-probability exam questions',
        sub: 'DBMS · Normalization',
        prompt: 'Generate 5 high-probability exam questions for DBMS Normalization (3NF/BCNF) with model answers',
    },
    {
        icon: Lightbulb,
        label: 'Summarize for last-minute revision',
        sub: 'OS · Scheduling',
        prompt: 'Give me a concise last-minute revision summary for Operating System scheduling algorithms',
    },
    {
        icon: Brain,
        label: 'Explain a concept step-by-step',
        sub: 'DSA · Linked Lists',
        prompt: 'Explain the concept of Linked Lists with a step-by-step breakdown and exam tips',
    },
    {
        icon: Zap,
        label: 'Sprint: Key formulas & rules',
        sub: 'CN · TCP/IP',
        prompt: 'Give me all key formulas and rules for TCP/IP model layers for my exam sprint',
    },
];

interface ChatMainAreaProps {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    mode: StudyMode;
    setMode: (m: StudyMode) => void;
    selectedContext: SelectedContext;
    selectedModel: string;
    setSelectedModel: (m: string) => void;
}

let msgCounter = 1;

const getTimeGreeting = (date = new Date()) => {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 14) return 'Good noon';
    if (hour >= 14 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
};

export default function ChatMainArea({
    messages,
    setMessages,
    mode,
    setMode,
    selectedContext,
    selectedModel,
    setSelectedModel,
}: ChatMainAreaProps) {
    const [inputValue, setInputValue] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Sync theme state with localStorage
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    useEffect(() => {
        const updateTheme = () => {
            const savedTheme = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
            const t = savedTheme || 'light';
            setTheme(t);
            applyTheme(t);
        };

        updateTheme();
        window.addEventListener('storage', updateTheme);
        return () => window.removeEventListener('storage', updateTheme);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    const handleSend = async (text?: string) => {
        const content = (text ?? inputValue).trim();
        if (!content || isStreaming) return;

        const formatTimestamp = () => {
            try {
                return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (_) {
                const now = new Date();
                return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
            }
        };

        const userMsg: ChatMessage = {
            id: `msg-${String(msgCounter++).padStart(3, '0')}`,
            role: 'user',
            content,
            mode,
            timestamp: formatTimestamp(),
            subject: selectedContext.subject,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        setIsStreaming(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    mode,
                    subject: selectedContext.subject,
                    unit: selectedContext.unit,
                    model: selectedModel,
                }),
            });

            const data = await res.json();

            let replyContent = '';
            if (res.ok && data.reply) {
                replyContent = data.reply;
            } else {
                // If API key error occurs, present clear error notice or concise direct answer without rigid template
                if (data.error) {
                    replyContent = `⚠️ **Notice:** ${data.error}`;
                } else {
                    replyContent = `I am here to help! Feel free to ask any question or topic you'd like to discuss.`;
                }
            }

            const assistantMsg: ChatMessage = {
                id: `msg-${String(msgCounter++).padStart(3, '0')}`,
                role: 'assistant',
                content: replyContent,
                mode,
                timestamp: formatTimestamp(),
                subject: selectedContext.subject,
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err: any) {
            const assistantMsg: ChatMessage = {
                id: `msg-${String(msgCounter++).padStart(3, '0')}`,
                role: 'assistant',
                content: `Error generating response: ${err.message || 'Failed to connect to server.'}`,
                mode,
                timestamp: formatTimestamp(),
                subject: selectedContext.subject,
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasMessages = messages.length > 0;
    const greetingLabel = getTimeGreeting();
    const greetingText = greetingLabel;

    return (
        <div
            className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative transition-colors duration-500"
            style={{ 
              background: theme === 'dark' ? '#141414' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontFamily: "'Inter', sans-serif"
            }}
        >
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
            />
            {showFeatureModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowFeatureModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: theme === 'dark' ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.97)', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                                    Extra features
                                </p>
                                <h3 className="mt-2 text-lg font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                                    Unlock smarter study tools
                                </h3>
                                <p className="mt-2 text-sm text-zinc-400">
                                    Open quick study helpers without leaving your chat flow.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFeatureModal(false)}
                                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                                aria-label="Close features"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-5 grid gap-3">
                            {[
                                {
                                    title: 'Flashcards',
                                    desc: 'Turn any topic into bite-sized revision cards.',
                                },
                                {
                                    title: 'Practice Quiz',
                                    desc: 'Generate exam-style questions and instant answers.',
                                },
                                {
                                    title: 'Study Planner',
                                    desc: 'Build a focused plan for your next study sprint.',
                                },
                            ].map((item) => (
                                <button
                                    key={item.title}
                                    type="button"
                                    className="rounded-2xl border p-4 text-left transition-all"
                                    style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                                >
                                    <p className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{item.title}</p>
                                    <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top bar — always shown */}
            <div
                className="flex items-center justify-between gap-3 px-4 py-3 shrink-0 backdrop-blur-md z-10"
                style={{
                    borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                    background: theme === 'dark' ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.85)',
                }}
            >
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
                    {/* Mode toggle */}
                    <div
                        className="flex items-center gap-1 p-1 rounded-xl shrink-0"
                        style={{
                            background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                        }}
                    >
                        <button
                            onClick={() => setMode('deep-dive')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                mode === 'deep-dive'
                                    ? 'bg-[#1a2a4a] text-blue-400 border border-blue-500/20 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <BookOpen size={11} />
                            Deep Dive
                        </button>
                        <button
                            onClick={() => setMode('sprint')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                mode === 'sprint'
                                    ? 'bg-[#2a1a06] text-amber-400 border border-amber-500/20 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Zap size={11} />
                            Sprint
                        </button>
                    </div>
                    {/* Clickable Context label */}
                    <button
                        onClick={() => window.dispatchEvent(new Event('nk-open-settings'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer shrink-0 hover:bg-white/5"
                        style={{
                            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        }}
                        title="Change study context"
                    >
                        <span className="text-[11px]" style={{ color: theme === 'dark' ? '#a1a1aa' : '#52525b', fontWeight: '500' }}>{selectedContext.subject}</span>
                        <span className="text-[11px]" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>·</span>
                        <span className="text-[11px] truncate max-w-[120px] sm:max-w-none" style={{ color: theme === 'dark' ? '#d4d4d8' : '#27272a', fontWeight: '600' }}>{selectedContext.unit}</span>
                    </button>
                </div>

                {/* Model selector pill & action controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <ModelSelector
                        currentModel={selectedModel}
                        onSelectModel={setSelectedModel}
                        theme={theme}
                    />
                    <button
                        title="Clear conversation"
                        onClick={() => setMessages([])}
                        className="p-2 rounded-xl transition-all duration-150 text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-zinc-800 hover:bg-white/5 active:scale-95"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {!hasMessages ? (
                    /* Premium welcome screen */
                    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
                        {/* Animated logo mark */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border"
                            style={{
                                background: theme === 'dark' ? '#111111' : '#f4F4f6',
                                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                color: theme === 'dark' ? '#ffffff' : '#000000',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-current">
                              <g transform="rotate(-35 12 12)">
                                <rect x="5" y="4" width="6" height="16" rx="2" fill="currentColor" />
                                <rect x="13" y="4" width="6" height="16" rx="2" fill="currentColor" />
                              </g>
                            </svg>
                        </div>

                        <div className="mb-6 text-center">
                            <p 
                                className="text-2xl sm:text-3xl font-semibold tracking-tight transition-colors"
                                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                            >
                                {greetingText}
                            </p>
                            <p className="mt-2 text-sm text-zinc-500">How can I help you study today?</p>
                        </div>

                        {/* Input bar */}
                        <div
                            className="w-full max-w-2xl rounded-2xl px-4 py-3.5 flex items-end gap-3 mb-6 transition-all duration-200"
                            style={{
                                background: theme === 'dark' ? '#1a1a1a' : '#f4F4f6',
                                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowFeatureModal(true)}
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors mb-0.5 hover:bg-white/10"
                                style={{ 
                                    background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', 
                                    color: '#8e8ea0' 
                                }}
                                title="Open extra features"
                                aria-label="Open extra features"
                            >
                                <Plus size={14} />
                            </button>

                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about your syllabus..."
                                rows={1}
                                className="flex-1 bg-transparent text-sm resize-none focus:outline-none leading-relaxed placeholder:text-zinc-500"
                                style={{
                                    color: theme === 'dark' ? '#ffffff' : '#000000',
                                    minHeight: '24px',
                                    maxHeight: '140px',
                                }}
                            />

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                                    style={{ color: '#4a4a4a' }}
                                    title="Voice input"
                                >
                                    <Mic size={16} />
                                </button>

                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isStreaming}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                                    style={{
                                        background: inputValue.trim() && !isStreaming ? (theme === 'dark' ? '#ffffff' : '#000000') : (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                    }}
                                    aria-label="Send message"
                                >
                                    <Send
                                        size={14}
                                        style={{
                                            color: inputValue.trim() && !isStreaming ? (theme === 'dark' ? '#000000' : '#ffffff') : '#4a4a4a',
                                        }}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Personalize Your Experience button */}
                        <div className="flex justify-center w-full max-w-2xl">
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new Event('nk-open-settings'))}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                                style={{
                                    background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                                    color: theme === 'dark' ? '#ffffff' : '#000000',
                                }}
                            >
                                <Sparkles size={16} className="text-amber-400" />
                                <span>Personalize your experience</span>
                            </button>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-[11px] text-center mt-5" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                            e-Mate AI can make mistakes. Always verify important exam answers.
                        </p>
                    </div>
                ) : (
                    <div className="py-6 space-y-0">
                        {messages.map((msg) => (
                            <ChatMessageBubble key={msg.id} message={msg} theme={theme} />
                        ))}
                        {isStreaming && <StreamingIndicator mode={mode} />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input bar — shown at bottom when there ARE messages */}
            {hasMessages && (
                <div className="shrink-0 px-4 pb-5 pt-3">
                    <div className="chat-message-width">
                        <div
                            className="rounded-2xl px-4 py-3.5 flex items-end gap-3"
                            style={{
                                background: theme === 'dark' ? '#1a1a1a' : '#f4F4f6',
                                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowFeatureModal(true)}
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                                style={{ 
                                    background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', 
                                    color: '#8e8ea0' 
                                }}
                                title="Open extra features"
                                aria-label="Open extra features"
                            >
                                <Plus size={14} />
                            </button>

                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    mode === 'sprint'
                                        ? 'Ask for a quick summary, formula, or cram tip...'
                                        : 'Ask for a full explanation, proof, or derivation...'
                                }
                                rows={1}
                                className="flex-1 bg-transparent text-sm resize-none focus:outline-none leading-relaxed placeholder:text-zinc-500"
                                style={{
                                    color: theme === 'dark' ? '#ffffff' : '#000000',
                                    minHeight: '24px',
                                    maxHeight: '140px',
                                }}
                            />

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                                    style={{ color: '#4a4a4a' }}
                                >
                                    <Mic size={16} />
                                </button>

                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isStreaming}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                                    style={{
                                        background:
                                            inputValue.trim() && !isStreaming ? (theme === 'dark' ? '#ffffff' : '#000000') : (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                    }}
                                    aria-label={isStreaming ? 'Stop generation' : 'Send message'}
                                >
                                    {isStreaming ? (
                                        <Square size={12} style={{ color: '#000000' }} />
                                    ) : (
                                        <Send
                                            size={14}
                                            style={{
                                                color: inputValue.trim() && !isStreaming ? (theme === 'dark' ? '#000000' : '#ffffff') : '#4a4a4a',
                                            }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-center mt-2" style={{ color: '#3a3a3a' }}>
                            e-Mate can make mistakes. Verify important exam answers.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
