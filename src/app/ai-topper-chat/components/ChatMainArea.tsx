'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Send,
    Zap,
    BookOpen,
    RotateCcw,
    Square,
    Mic,
    Plus,
    ChevronDown,
    ChevronUp,
    Brain,
    FileText,
    Lightbulb,
    Sparkles,
    Check,
    Paperclip,
    Compass,
    Folder,
    BookMarked,
    Code2,
    PenLine,
    MessageSquare,
    GraduationCap,
    Volume2,
    X,
    Key,
    ArrowRight,
    ImagePlus,
    Menu,
} from 'lucide-react';
import ChatMessageBubble from './ChatMessageBubble';
import StreamingIndicator from './StreamingIndicator';
import type { ChatMessage, SelectedContext, StudyMode } from './AITopperChatScreen';
import { applyTheme } from '@/lib/theme';
import { ModelSelector } from '@/components/ModelSelector';
import { buildNotebookContext, appendToNotebook, getSubjects, getNotebook, Subject } from '@/lib/notebook';
import { saveChatSession } from '@/lib/chatHistory';

// Study quick actions are built dynamically inside the component from selectedContext.

const GENERAL_QUICK_ACTIONS = [
    {
        icon: Code2,
        label: 'Write & debug code',
        sub: 'Get working code with explanations',
        prompt: 'Help me write and debug code for: ',
    },
    {
        icon: PenLine,
        label: 'Draft & edit text',
        sub: 'Polish essays, emails, or reports',
        prompt: 'Help me draft and improve this text: ',
    },
    {
        icon: Brain,
        label: 'Brainstorm ideas',
        sub: 'Explore angles and creative options',
        prompt: 'Help me brainstorm ideas for: ',
    },
    {
        icon: Compass,
        label: 'Explain a complex topic',
        sub: 'Clear, structured explanations',
        prompt: 'Explain this topic clearly and simply: ',
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
    const [isStudyMode, setIsStudyMode] = useState(true); // server-safe default — synced from localStorage in useEffect
    const [isOpenRouterConnected, setIsOpenRouterConnected] = useState(true); // default to true, check in client mount
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [isConnectingOpenRouter, setIsConnectingOpenRouter] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const popupRef = useRef<Window | null>(null);

    // Build study action tiles dynamically from the active notebook context
    const studyQuickActions = useMemo(() => [
        {
            icon: BookOpen,
            label: 'Generate exam questions',
            sub: `${selectedContext.subject} · ${selectedContext.unit}`,
            prompt: `Generate 5 high-probability exam questions for ${selectedContext.subject} — ${selectedContext.unit} with model answers`,
        },
        {
            icon: Sparkles,
            label: 'Last-minute revision',
            sub: `Quick summary for ${selectedContext.unit}`,
            prompt: `Give me a concise last-minute revision summary for ${selectedContext.subject} — ${selectedContext.unit}`,
        },
        {
            icon: Brain,
            label: 'Step-by-step explanation',
            sub: `Deep breakdown of ${selectedContext.unit}`,
            prompt: `Explain ${selectedContext.unit} (${selectedContext.subject}) step-by-step with examples and exam tips`,
        },
        {
            icon: Compass,
            label: 'Key formulas & rules',
            sub: `Sprint sheet for ${selectedContext.unit}`,
            prompt: `List all key formulas, rules, and definitions for ${selectedContext.subject} — ${selectedContext.unit} for my exam sprint`,
        },
    ], [selectedContext.subject, selectedContext.unit]);
    // Open OAuth in a popup window
    const handleOpenRouterConnect = () => {
        setShowConnectModal(false);
        const w = 600, h = 700;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;
        const popup = window.open(
            '/api/auth/openrouter/connect',
            'OpenRouter Auth',
            `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
        );
        popupRef.current = popup;
        setIsConnectingOpenRouter(true);

        // Poll to detect if the user manually closed the popup
        const pollTimer = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(pollTimer);
                setIsConnectingOpenRouter(false);
                popupRef.current = null;
            }
        }, 500);
    };

    const [guestQueryCount, setGuestQueryCount] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Sync study mode from localStorage after hydration
            const saved = localStorage.getItem('nk-study-mode-active');
            if (saved !== null) setIsStudyMode(saved !== 'false');

            // Sync free limit credit count
            const count = parseInt(localStorage.getItem('guest_query_count') || '0', 10);
            setGuestQueryCount(count);

            // Check if redirected from OAuth callback with ?connected=true
            const params = new URLSearchParams(window.location.search);
            if (params.get('connected') === 'true') {
                setIsOpenRouterConnected(true);
                // Clean up the URL param without reloading
                window.history.replaceState({}, '', window.location.pathname);
            } else {
                // Check server-side cookie via API (HTTP-only cookies aren't readable from JS)
                fetch('/api/auth/openrouter/status')
                    .then(res => res.json())
                    .then(data => setIsOpenRouterConnected(!!data.connected))
                    .catch(() => setIsOpenRouterConnected(false));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // runs once on mount

    // Listen for postMessage from OAuth popup callback
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'OPENROUTER_AUTH_SUCCESS') {
                setIsConnectingOpenRouter(false);
                setIsOpenRouterConnected(true);
                popupRef.current = null;
                // Show success toast
                setShowSuccessToast(true);
                setTimeout(() => setShowSuccessToast(false), 4000);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Persist the mode choice so it survives page reloads and new chats
            localStorage.setItem('nk-study-mode-active', String(isStudyMode));
            localStorage.setItem('nk-general-chat-active', String(!isStudyMode));
            window.dispatchEvent(new Event('nk-general-chat-change'));
        }
    }, [isStudyMode]);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const modelMenuRef = useRef<HTMLDivElement>(null);

    const MODELS = [
        { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', badge: 'Fastest' },
        { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Latest' },
        { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', badge: 'Efficient' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Smartest' },
    ];

    const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
                setIsModelMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('nk-sidebar-open');
        if (saved !== null) {
            setIsSidebarOpen(saved === 'true');
        }

        const handleSidebarChange = () => {
            const current = localStorage.getItem('nk-sidebar-open');
            if (current !== null) {
                setIsSidebarOpen(current === 'true');
            }
        };

        window.addEventListener('nk-sidebar-change', handleSidebarChange);
        return () => window.removeEventListener('nk-sidebar-change', handleSidebarChange);
    }, []);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const centerInputRef = useRef<HTMLTextAreaElement>(null);
    // Stable session id — created once per component mount
    const sessionIdRef = useRef<string>(`chat-${Date.now()}`);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!messages.length) {
            setTimeout(() => centerInputRef.current?.focus(), 50);
        }
    }, [messages.length]);

    // Dropdown state for study context
    const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
    const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
    const contextDropdownRef = useRef<HTMLDivElement>(null);

    // Sync subjects list
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSubjectsList(getSubjects());
        }
        const handleSync = () => {
            setSubjectsList(getSubjects());
        };
        window.addEventListener('nk-subjects-changed', handleSync);
        return () => window.removeEventListener('nk-subjects-changed', handleSync);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextDropdownRef.current && !contextDropdownRef.current.contains(event.target as Node)) {
                setIsContextDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync theme state with localStorage — server-safe: start with 'light', read localStorage after mount
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

    // ── Inline Voice Dictation implementation ──────────────────────────────
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const toggleListening = () => {
        if (typeof window === 'undefined') return;

        if (isListening) {
            stopListening();
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Please try Chrome or Safari.');
            return;
        }

        setIsListening(true);

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const activePhrase = finalTranscript || interimTranscript;
            if (activePhrase.trim()) {
                setInputValue(activePhrase);
            }

            // Stops listening automatically after 2 seconds of silence, leaving text in input
            silenceTimeoutRef.current = setTimeout(() => {
                stopListening();
            }, 2000);
        };

        rec.onerror = (e: any) => {
            console.error('Speech recognition error:', e);
            stopListening();
        };

        rec.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = rec;
        try {
            rec.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        setIsListening(false);
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
        try {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            }
        } catch (_) {}
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setAttachedFiles((prev) => [...prev, ...files]);
            
            // Create preview URLs
            const newPreviews = files.map(f => {
                if (f.type.startsWith('image/')) return URL.createObjectURL(f);
                return 'doc'; // placeholder for non-images
            });
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
            const newUrls = [...prev];
            if (newUrls[index] !== 'doc') URL.revokeObjectURL(newUrls[index]);
            newUrls.splice(index, 1);
            return newUrls;
        });
    };

    const convertFilesToBase64 = async (files: File[]): Promise<{ data: string, mimeType: string }[]> => {
        return Promise.all(
            files.map(file => {
                return new Promise<{ data: string, mimeType: string }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Strip the "data:image/jpeg;base64," prefix
                        const base64Data = result.split(',')[1];
                        resolve({ data: base64Data, mimeType: file.type });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            })
        );
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            try {
                if (recognitionRef.current) {
                    recognitionRef.current.onend = null;
                    recognitionRef.current.stop();
                }
            } catch (_) {}
        };
    }, []);

    const handleSend = async (text?: string) => {
        const content = (text ?? inputValue).trim();
        if (!content || isStreaming) return;

        // Guard: if no API key is connected, check guest freemium credit limit
        if (!isOpenRouterConnected) {
            const currentCount = parseInt(localStorage.getItem('guest_query_count') || '0', 10);
            if (currentCount >= 5) {
                setShowConnectModal(true);
                return;
            }
            // Increment guest query count
            const newCount = currentCount + 1;
            localStorage.setItem('guest_query_count', String(newCount));
            setGuestQueryCount(newCount);
        }

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
            isGeneralChat: !isStudyMode,
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        setIsStreaming(true);

        // Persist to recent chats (real-time sidebar sync)
        saveChatSession({
            id: sessionIdRef.current,
            title: content.length > 60 ? content.slice(0, 57) + '…' : content,
            subject: selectedContext.subject,
            unit: selectedContext.unit,
            mode,
            timestamp: Date.now(),
        });

        try {
            const notebookContext = isStudyMode ? buildNotebookContext(selectedContext.subject) : '';
            const base64Attachments = attachedFiles.length > 0 ? await convertFilesToBase64(attachedFiles) : [];
            const finalPayloadMessages = [...newMessages];
            
            // If we have attachments, modify the last user message to include them
            if (base64Attachments.length > 0) {
                const lastMsg = finalPayloadMessages[finalPayloadMessages.length - 1];
                // Store original string for UI, but payload will have array format
                (lastMsg as any)._attachments = base64Attachments;
            }

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: finalPayloadMessages,
                    mode,
                    subject: isStudyMode ? selectedContext.subject : undefined,
                    unit: isStudyMode ? selectedContext.unit : undefined,
                    model: selectedModel,
                    notebookContext,
                    isGeneralChat: !isStudyMode,
                    attachments: base64Attachments,
                }),
            });

            // Clear attachments immediately after sending
            setAttachedFiles([]);
            setPreviewUrls([]);

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Request failed with status ${res.status}`);
            }

            const assistantMsgId = `msg-${String(msgCounter++).padStart(3, '0')}`;
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMsgId,
                    role: 'assistant',
                    content: '',
                    mode,
                    timestamp: formatTimestamp(),
                    subject: selectedContext.subject,
                    isGeneralChat: !isStudyMode,
                },
            ]);

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response body stream available.");

            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                
                for (let line of lines) {
                    line = line.trim();
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '');
                        if (dataStr === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.error) {
                                accumulatedText += `\n\n⚠️ **Notice:** ${parsed.error}`;
                            } else {
                                accumulatedText += parsed.text || parsed;
                            }
                            setMessages((prev) => 
                                prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedText } : m)
                            );
                        } catch (e) {
                            // Fallback for raw text chunks
                            accumulatedText += dataStr;
                            setMessages((prev) => 
                                prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedText } : m)
                            );
                        }
                    }
                }
            }

            if (isStudyMode && accumulatedText) {
                appendToNotebook(
                    selectedContext.subject,
                    `Struggling/Interested in: ${content.slice(0, 150)}${content.length > 150 ? '...' : ''}`,
                    'user'
                );
            }
        } catch (err: any) {
            const errorMsg = `Error generating response: ${err.message || 'Failed to connect to server.'}`;
            const assistantMsg: ChatMessage = {
                id: `msg-${String(msgCounter++).padStart(3, '0')}`,
                role: 'assistant',
                content: errorMsg,
                mode,
                timestamp: formatTimestamp(),
                subject: selectedContext.subject,
                isGeneralChat: !isStudyMode,
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
              background: theme === 'dark' ? '#000000' : '#ffffff',
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

            {/* Top bar — sticky header scoped inside <main>, not full-viewport */}
            <header className="sticky top-0 z-40 w-full flex items-center justify-between px-8 py-4 bg-transparent gap-4">
                
                {/* Left Group: Toggle + Mode Switcher compact segmented pill */}
                <div className="flex items-center gap-3">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => {
                                localStorage.setItem('nk-sidebar-open', 'true');
                                window.dispatchEvent(new Event('nk-sidebar-change'));
                            }}
                            className="p-1.5 rounded-xl border hover:bg-gray-55/10 dark:hover:bg-zinc-800/80 transition-colors"
                            style={{
                                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                color: theme === 'dark' ? '#ffffff' : '#000000',
                            }}
                            title="Open sidebar"
                        >
                            <Menu size={16} />
                        </button>
                    )}

                    <div
                        className="inline-flex p-1 rounded-full shadow-sm bg-gray-100/90 dark:bg-zinc-800/90 backdrop-blur-md border border-gray-200/60 dark:border-zinc-700/60 items-center gap-0.5"
                    >
                        <button
                            onClick={() => setIsStudyMode(true)}
                            className={`flex items-center gap-1 transition-all rounded-full px-3 py-1 text-xs ${
                                isStudyMode
                                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-150 font-semibold shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <GraduationCap size={12} />
                            Study
                        </button>
                        <button
                            onClick={() => setIsStudyMode(false)}
                            className={`flex items-center gap-1 transition-all rounded-full px-3 py-1 text-xs ${
                                !isStudyMode
                                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-150 font-semibold shadow-sm'
                                    : 'text-gray-550 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <MessageSquare size={12} />
                            General
                        </button>
                    </div>
                </div>

                {/* Center Group: Breadcrumb Floating Pill */}
                <div className="hidden md:flex flex-1 justify-center">
                    {isStudyMode && (
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/60 dark:border-zinc-700/60 rounded-full px-4 py-1.5 shadow-sm text-xs flex items-center gap-1.5 select-none">
                            <span className="text-gray-400 dark:text-zinc-500 font-medium">{selectedContext.subject}</span>
                            <span className="text-gray-400 dark:text-zinc-500">/</span>
                            <span className="text-gray-800 dark:text-zinc-200 font-semibold">{selectedContext.unit}</span>
                        </div>
                    )}
                </div>

                {/* Right Group: Combined status and control floating pill */}
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/60 dark:border-zinc-700/60 rounded-full px-3 py-1 shadow-sm flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-650 transition-all">
                    <div className="flex gap-2 items-center h-8">
                        {/* Active connection status or limit info */}
                        {isOpenRouterConnected ? (
                            <div className="h-8 flex items-center gap-1.5 select-none text-[11px] text-gray-550 dark:text-zinc-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Connected
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 h-8">
                                <span className="text-gray-500 dark:text-zinc-400 text-[10px] h-8 flex items-center">
                                    {Math.max(0, 5 - guestQueryCount)}/5 Free
                                </span>
                                <button
                                    onClick={handleOpenRouterConnect}
                                    className="h-8 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[10px] hover:opacity-90 transition-opacity"
                                >
                                    <Key size={10} className="mr-0.5" />
                                    Connect
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Separator */}
                    <span className="w-[1px] h-3 bg-gray-200 dark:bg-zinc-800" />

                    {/* Clear Conversation Action */}
                    <button
                        title="Clear conversation"
                        onClick={() => setMessages([])}
                        className="h-8 flex items-center justify-center p-1 rounded-full transition-all duration-150 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
            </header>

            {/* Glassmorphic Connect Modal / Paywall Modal */}
            {showConnectModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                    onClick={() => setShowConnectModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm mx-4 rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                        style={{
                            background: theme === 'dark' ? 'rgba(24, 24, 27, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowConnectModal(false)}
                            className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
                            style={{ color: theme === 'dark' ? '#71717a' : '#a1a1aa' }}
                        >
                            <X size={16} />
                        </button>

                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            }}
                        >
                            <Key size={22} style={{ color: theme === 'dark' ? '#a1a1aa' : '#52525b' }} />
                        </div>

                        <div>
                            <h3
                                className="text-base font-semibold mb-1"
                                style={{ color: theme === 'dark' ? '#fafafa' : '#09090b' }}
                            >
                                {guestQueryCount >= 5 ? "You've reached your 5 free searches" : "Connect Your API Key"}
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? '#71717a' : '#a1a1aa' }}>
                                {guestQueryCount >= 5
                                    ? "Connect your OpenRouter account to unlock unlimited AI processing with full model access."
                                    : "Link your OpenRouter account to unlock AI processing. It takes one click and is completely free."}
                            </p>
                        </div>

                        <button
                            onClick={handleOpenRouterConnect}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                            style={{
                                background: theme === 'dark' ? '#fafafa' : '#09090b',
                                color: theme === 'dark' ? '#09090b' : '#fafafa',
                            }}
                        >
                            <Key size={14} />
                            Connect OpenRouter (1-Click)
                        </button>

                        <button
                            onClick={() => setShowConnectModal(false)}
                            className="text-[11px] font-medium transition-colors"
                            style={{ color: theme === 'dark' ? '#52525b' : '#a1a1aa' }}
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            )}

            {/* Linking OpenRouter — Glassmorphic Connecting Modal */}
            {isConnectingOpenRouter && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes or-pulse-ring {
                            0% { transform: scale(0.85); opacity: 0.6; }
                            50% { transform: scale(1.15); opacity: 0.2; }
                            100% { transform: scale(0.85); opacity: 0.6; }
                        }
                        @keyframes or-icon-float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-4px); }
                        }
                        @keyframes or-dots {
                            0%, 80%, 100% { opacity: 0.2; }
                            40% { opacity: 1; }
                        }
                    `}} />
                    <div
                        className="relative w-full max-w-sm mx-4 rounded-3xl p-8 flex flex-col items-center text-center gap-5"
                        style={{
                            background: theme === 'dark' ? 'rgba(14, 14, 16, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* Animated pulsing icon area */}
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            {/* Pulse rings */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    border: theme === 'dark' ? '2px solid rgba(99, 102, 241, 0.25)' : '2px solid rgba(99, 102, 241, 0.2)',
                                    animation: 'or-pulse-ring 2s ease-in-out infinite',
                                }}
                            />
                            <div
                                className="absolute rounded-full"
                                style={{
                                    inset: '-8px',
                                    border: theme === 'dark' ? '1px solid rgba(99, 102, 241, 0.12)' : '1px solid rgba(99, 102, 241, 0.08)',
                                    animation: 'or-pulse-ring 2s ease-in-out 0.5s infinite',
                                }}
                            />
                            {/* Icon container */}
                            <div
                                className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: theme === 'dark'
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))'
                                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                                    border: theme === 'dark' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.15)',
                                    animation: 'or-icon-float 3s ease-in-out infinite',
                                }}
                            >
                                <Sparkles size={24} style={{ color: '#818cf8' }} />
                            </div>
                        </div>

                        {/* Text */}
                        <div>
                            <h3
                                className="text-lg font-bold tracking-tight mb-1.5"
                                style={{ color: theme === 'dark' ? '#fafafa' : '#09090b' }}
                            >
                                Linking OpenRouter Account
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: theme === 'dark' ? '#71717a' : '#a1a1aa' }}>
                                Please complete authorization in the popup window
                                <span style={{ animation: 'or-dots 1.4s infinite 0s', display: 'inline-block' }}>.</span>
                                <span style={{ animation: 'or-dots 1.4s infinite 0.2s', display: 'inline-block' }}>.</span>
                                <span style={{ animation: 'or-dots 1.4s infinite 0.4s', display: 'inline-block' }}>.</span>
                            </p>
                        </div>

                        {/* Cancel button */}
                        <button
                            onClick={() => {
                                if (popupRef.current && !popupRef.current.closed) {
                                    popupRef.current.close();
                                }
                                popupRef.current = null;
                                setIsConnectingOpenRouter(false);
                            }}
                            className="px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80 active:scale-[0.97]"
                            style={{
                                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                                color: theme === 'dark' ? '#a1a1aa' : '#52525b',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl"
                    style={{
                        background: theme === 'dark' ? '#0f1d15' : '#ecfdf5',
                        border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(16, 185, 129, 0.3)',
                        animation: 'guide-scale-up 0.3s ease-out',
                    }}
                >
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                    >
                        <Check size={13} style={{ color: '#10b981' }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#34d399' : '#059669' }}>
                        OpenRouter connected successfully!
                    </span>
                    <button
                        onClick={() => setShowSuccessToast(false)}
                        className="ml-1 p-0.5 rounded transition-colors hover:bg-black/10"
                        style={{ color: theme === 'dark' ? '#34d399' : '#059669' }}
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Messages area — no pt-20 needed since header is no longer absolute */}
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">

                {!hasMessages ? (
                    <div className="flex flex-col items-center justify-start pt-6 pb-12 px-4 max-w-3xl mx-auto w-full text-center overflow-visible">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setInputValue((prev) => `${prev} Attached: ${e.target.files![0].name} `);
                                    setTimeout(() => centerInputRef.current?.focus(), 50);
                                }
                            }}
                        />

                        {/* Header mark */}
                        <div className="flex items-center justify-center mb-6">
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: theme === 'dark' ? '#18181b' : '#f4f4f5', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                            >
                                {isStudyMode ? <GraduationCap size={18} style={{ color: theme === 'dark' ? '#a1a1aa' : '#71717a' }} /> : <MessageSquare size={18} style={{ color: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />}
                            </div>
                        </div>

                        {/* Heading */}
                        <h1
                            className="text-3xl font-bold tracking-tight text-center mb-2"
                            style={{ color: theme === 'dark' ? '#ffffff' : '#09090b' }}
                        >
                            {isStudyMode ? 'Level up your studying' : 'What can I help you with?'}
                        </h1>
                        <p className="text-sm text-center mb-8 max-w-md leading-relaxed" style={{ color: theme === 'dark' ? '#52525b' : '#a1a1aa' }}>
                            {isStudyMode
                                ? 'Ask anything, paste notes, or trigger a study workflow below.'
                                : 'Ask anything — code, writing, analysis, or just a question.'}
                        </p>

                        {/* Elevated Command Input Card */}
                        <div
                            className="w-full mb-6 border border-gray-200 focus-within:border-gray-400 dark:border-zinc-800 dark:focus-within:border-zinc-700 focus-within:shadow-md rounded-2xl bg-white dark:bg-zinc-900/40 p-4 transition-all"
                        >
                            <div className="pb-2">
                                <textarea
                                    ref={centerInputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isListening ? 'Listening... Speak now...' : 'Ask anything, paste notes, or use /quiz, /flashcards...'}
                                    rows={3}
                                    className="w-full bg-transparent text-sm font-normal resize-none focus:outline-none outline-none focus:outline-none ring-0 focus:ring-0 leading-relaxed"
                                    style={{
                                        color: theme === 'dark' ? '#e4e4e7' : '#09090b',
                                        minHeight: '72px',
                                        maxHeight: '200px',
                                        caretColor: theme === 'dark' ? '#ffffff' : '#000000',
                                    }}
                                />
                            </div>
                            {/* Control bar inside card */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-1.5 rounded-lg transition-colors text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                        title="Attach materials"
                                    >
                                        <Paperclip size={15} />
                                    </button>
                                    {/* Segmented mode control */}
                                    <div
                                        className="inline-flex p-0.5 rounded-lg"
                                        style={{
                                            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        <button
                                            onClick={() => setMode('sprint')}
                                            className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                                            style={{
                                                background: mode === 'sprint' ? (theme === 'dark' ? '#27272a' : '#ffffff') : 'transparent',
                                                color: mode === 'sprint' ? (theme === 'dark' ? '#e4e4e7' : '#09090b') : (theme === 'dark' ? '#71717a' : '#71717a'),
                                                boxShadow: mode === 'sprint' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            }}
                                        >
                                            Sprint
                                        </button>
                                        <button
                                            onClick={() => setMode('deep-dive')}
                                            className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                                            style={{
                                                background: mode === 'deep-dive' ? (theme === 'dark' ? '#27272a' : '#ffffff') : 'transparent',
                                                color: mode === 'deep-dive' ? (theme === 'dark' ? '#e4e4e7' : '#09090b') : (theme === 'dark' ? '#71717a' : '#71717a'),
                                                boxShadow: mode === 'deep-dive' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            }}
                                        >
                                            Deep Dive
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={toggleListening}
                                        type="button"
                                        className={`p-1.5 rounded-lg flex items-center justify-center transition-all relative ${
                                            isListening 
                                                ? 'text-red-500 animate-pulse bg-red-500/10 before:absolute before:inset-0 before:rounded-lg before:bg-red-500/20 before:animate-ping' 
                                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                        title={isListening ? 'Stop Listening' : 'Start Voice Mode'}
                                    >
                                        <Mic size={15} />
                                        {isListening && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-zinc-900" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!inputValue.trim() || isStreaming}
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-black p-2.5"
                                        aria-label="Send"
                                    >
                                        <Send size={14} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2×2 Linear-style action tiles — swaps per mode */}
                        <div className="grid grid-cols-2 gap-3 w-full mt-6 mb-12">
                            {(isStudyMode ? studyQuickActions : GENERAL_QUICK_ACTIONS).map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={() => {
                                        if (action.prompt) {
                                            setInputValue(action.prompt);
                                            setTimeout(() => centerInputRef.current?.focus(), 50);
                                        }
                                    }}
                                    className="group text-left flex items-start gap-3 cursor-pointer transition-all border border-gray-200/80 hover:border-gray-300 hover:shadow-xs rounded-xl p-4 bg-gray-50/50 hover:bg-white dark:border-zinc-800/80 dark:hover:border-zinc-700 dark:bg-zinc-900/30 dark:hover:bg-zinc-900"
                                >
                                    <div
                                        className="p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105 bg-white dark:bg-zinc-800 border border-gray-200/60 dark:border-zinc-750 text-gray-500 dark:text-zinc-400"
                                    >
                                        <action.icon size={13} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-1">
                                        <p
                                            className="font-semibold text-slate-900 dark:text-zinc-150 text-sm leading-snug mb-0.5"
                                        >
                                            {action.label}
                                        </p>
                                        <p className="text-gray-500 dark:text-zinc-400 text-xs leading-snug">
                                            {action.sub}
                                        </p>
                                    </div>
                                    <ArrowRight size={13} className="text-gray-400 dark:text-zinc-650 self-center shrink-0 ml-auto transition-transform group-hover:translate-x-0.5" />
                                </button>
                            ))}
                        </div>

                        {/* Study notebooks section — only in Study Copilot mode */}
                        {isStudyMode && (<>
                        <div className="w-full max-w-2xl mt-8 pt-6 border-t mb-3" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
                          <span className="text-[10px] font-mono uppercase tracking-widest block mb-3" style={{ color: theme === 'dark' ? '#52525b' : '#71717a' }}>
                            Study Notebooks
                          </span>
                        </div>

                        {/* Modern notebook cards grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-10">
                            {subjectsList.map((subj) => {
                                const notebook = getNotebook(subj.name);
                                let activeTime = 'Never';
                                if (notebook && notebook.updatedAt) {
                                    try {
                                        activeTime = new Date(notebook.updatedAt).toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    } catch (_) {
                                        activeTime = 'Recently';
                                    }
                                }
                                const topicCount = subj.units?.length || 0;
                                return (
                                    <div
                                        key={subj.id}
                                        onClick={() => {
                                            localStorage.setItem('nk-subject', subj.name);
                                            if (subj.units && subj.units.length > 0) {
                                                localStorage.setItem('nk-unit', subj.units[0].name);
                                            }
                                            window.dispatchEvent(new Event('nk-context-change'));
                                        }}
                                        className="group p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-24"
                                        style={{
                                            background: theme === 'dark' ? '#111113' : '#ffffff',
                                            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <Folder size={13} style={{ color: theme === 'dark' ? '#71717a' : '#a1a1aa', marginTop: '1px', flexShrink: 0 }} />
                                            <span
                                                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                                style={{
                                                    background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                                    color: theme === 'dark' ? '#71717a' : '#71717a',
                                                }}
                                            >
                                                {topicCount}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold leading-tight truncate" style={{ color: theme === 'dark' ? '#e4e4e7' : '#18181b' }}>
                                                {subj.name}
                                            </p>
                                            <p className="text-[10px] mt-0.5" style={{ color: theme === 'dark' ? '#52525b' : '#a1a1aa' }}>
                                                {activeTime}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        </>)}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
                        {messages.map((msg) => (
                            <ChatMessageBubble key={msg.id} message={msg} theme={theme} />
                        ))}
                        {isStreaming && <StreamingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input bar — shown at bottom only when conversation is active */}
            {hasMessages && (
                <div className="sticky bottom-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pt-2 pb-4 w-full max-w-3xl mx-auto z-10 px-4">
                    <div 
                        className="relative flex flex-col w-full max-w-3xl mx-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files) {
                                const files = Array.from(e.dataTransfer.files);
                                setAttachedFiles((prev) => [...prev, ...files]);
                                const newPreviews = files.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : 'doc');
                                setPreviewUrls((prev) => [...prev, ...newPreviews]);
                            }
                        }}
                    >
                        {/* Image & File Attachment Preview Area */}
                        {attachedFiles.length > 0 && (
                            <div className="flex items-center gap-2 pb-2 overflow-x-auto">
                                {attachedFiles.map((file, i) => (
                                    <div key={i} className="relative group shrink-0">
                                        {previewUrls[i] !== 'doc' ? (
                                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                <img src={previewUrls[i]} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 h-14 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                <Paperclip size={12} />
                                                <span className="truncate max-w-[80px]">{file.name}</span>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => removeAttachment(i)}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="flex items-start gap-3 w-full">
                            <textarea
                                ref={centerInputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    isListening
                                        ? 'Listening... Speak now...'
                                        : !isStudyMode
                                            ? 'Ask a question or request help...'
                                            : mode === 'sprint'
                                                ? 'Ask for a quick summary, formula, or cram tip...'
                                                : 'Ask for a full explanation, proof, or derivation...'
                                }
                                rows={1}
                                className="flex-1 w-full bg-transparent text-sm resize-none outline-none placeholder:text-zinc-400 py-1"
                                style={{
                                    color: theme === 'dark' ? '#ffffff' : '#000000',
                                    minHeight: '24px',
                                    maxHeight: '140px',
                                }}
                            />
                        </div>

                        {/* Bottom Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                            {/* Left Side — Attachment & Model Selector Integration */}
                            <div className="flex items-center gap-2">
                                <label className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors" title="Attach files">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                        multiple 
                                        accept="image/*,.pdf,.txt,.csv"
                                    />
                                    <ImagePlus size={16} />
                                </label>
                                
                                <div className="relative" ref={modelMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200/60 dark:border-zinc-700/60 transition-colors cursor-pointer"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-500"/>
                                        <span>{activeModel.name}</span>
                                        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5"/>
                                    </button>

                                    {isModelMenuOpen && (
                                        <div className="absolute bottom-full mb-2 left-0 z-50 w-56 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl backdrop-blur-md flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400">Select Model</div>
                                            {MODELS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => { setSelectedModel(m.id); setIsModelMenuOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                                                        selectedModel === m.id
                                                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{m.name}</span>
                                                        {m.badge && <span className="text-[9px] px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-650 dark:text-zinc-300">{m.badge}</span>}
                                                    </div>
                                                    {selectedModel === m.id && <Check className="w-3.5 h-3.5 text-indigo-500"/>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Segmented Control inside toolbar for Study Mode */}
                                {isStudyMode && (
                                    <div className="flex items-center ml-1 gap-1">
                                        <button
                                            onClick={() => setMode('sprint')}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all ${mode === 'sprint' ? 'bg-amber-100 text-amber-800 dark:bg-[#2a1a06] dark:text-amber-400' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            <Zap size={10} /> Sprint
                                        </button>
                                        <button
                                            onClick={() => setMode('deep-dive')}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all ${mode === 'deep-dive' ? 'bg-blue-100 text-blue-800 dark:bg-[#1a2a4a] dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            <BookOpen size={10} /> Deep Dive
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right Side — Execution Controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={toggleListening}
                                    type="button"
                                    className={`p-2 rounded-xl flex items-center justify-center transition-all relative ${
                                        isListening
                                            ? 'text-red-500 animate-pulse bg-red-500/10 before:absolute before:inset-0 before:rounded-xl before:bg-red-500/20 before:animate-ping'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                                    title={isListening ? 'Stop Listening' : 'Start Voice Mode'}
                                >
                                    <Mic size={16} />
                                    {isListening && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-zinc-900" />
                                    )}
                                </button>

                                <button
                                    onClick={() => isStreaming ? setIsStreaming(false) : handleSend()}
                                    disabled={!isStreaming && !inputValue.trim()}
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-black p-2.5"
                                    aria-label={isStreaming ? 'Stop generation' : 'Send message'}
                                >
                                    {isStreaming ? (
                                        <Square size={12} className="fill-current text-white" />
                                    ) : (
                                        <Send size={14} className="text-white" />
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
