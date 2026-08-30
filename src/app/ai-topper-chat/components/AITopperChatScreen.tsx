'use client';

import React, { useState, useEffect } from 'react';
import ChatMainArea from './ChatMainArea';
import { 
  Sparkles, 
  BookOpen, 
  PanelLeft, 
  Compass, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  X 
} from 'lucide-react';

export type StudyMode = 'deep-dive' | 'sprint';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: StudyMode;
  timestamp: string;
  subject?: string;
  isGeneralChat?: boolean;
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
  
  // Onboarding Guide State
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Read initial theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nk-theme');
      setTheme(savedTheme === 'dark' ? 'dark' : 'light');
      
      // Auto-trigger guide for new users
      const guideCompleted = localStorage.getItem('nk-guide-completed');
      if (!guideCompleted) {
        setShowGuide(true);
      }
    }
  }, []);

  useEffect(() => {
    const syncContext = () => {
      const savedSubject = localStorage.getItem('nk-subject');
      const savedUnit = localStorage.getItem('nk-unit');
      if (savedSubject && savedUnit) {
        setSelectedContext({ subject: savedSubject, unit: savedUnit });
      } else {
        localStorage.setItem('nk-subject', 'DBMS');
        localStorage.setItem('nk-unit', 'Normalization (3NF/BCNF)');
      }
    };
    syncContext();
    window.addEventListener('nk-context-change', syncContext);
    
    // Listen to theme changes for dynamic guide themes
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('nk-theme');
      setTheme(savedTheme === 'dark' ? 'dark' : 'light');
    };
    window.addEventListener('storage', syncTheme);

    // Support launching guide anytime
    const handleLaunchGuide = () => {
      setCurrentStep(0);
      setShowGuide(true);
    };
    window.addEventListener('nk-launch-guide', handleLaunchGuide);

    return () => {
      window.removeEventListener('nk-context-change', syncContext);
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('nk-launch-guide', handleLaunchGuide);
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCloseGuide();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCloseGuide = () => {
    localStorage.setItem('nk-guide-completed', 'true');
    setShowGuide(false);
  };

  const steps = [
    {
      title: "Welcome to e-Mate AI",
      description: "Your advanced AI Academic Copilot. e-Mate is designed to customize its explanations based on your active syllabus subject, context unit, and notes.",
      icon: Sparkles,
      color: "#1f51ff",
      badge: "Getting Started"
    },
    {
      title: "Dynamic Subject Notebooks",
      description: "Each subject gets an isolated notebook. e-Mate automatically remembers key points from your chat history to personalize answers. Manage your notebooks from the sidebar using '+ New notebook' and the 'Manage' panel.",
      icon: BookOpen,
      color: "#365aff",
      badge: "Personalization"
    },
    {
      title: "Real-time Resizable Sidebar",
      description: "Need more screen space? Drag the divider line on the right side of the sidebar to dynamically resize it to your perfect working width.",
      icon: PanelLeft,
      color: "#5470ff",
      badge: "Interface"
    },
    {
      title: "Locked Study Context",
      description: "Ensure precise replies by selecting your subject and unit from the 'Study Context' panel. e-Mate will base its knowledge on your syllabus constraints.",
      icon: Compass,
      color: "#6f86ff",
      badge: "Exam Precision"
    },
    {
      title: "Real-time Recent Chats",
      description: "Your conversations are saved and synced in real-time in the sidebar, allowing you to instantly rename, delete, or resume previous chats.",
      icon: Clock,
      color: "#8aa2ff",
      badge: "Productivity"
    }
  ];

  const ActiveIcon = steps[currentStep].icon;

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

      {/* Dynamic Onboarding Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
        >
          {/* Keyframe Animations */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes guide-scale-up {
              0% { transform: scale(0.95); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes content-slide-in {
              0% { transform: translateY(10px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            .guide-modal-glow {
              box-shadow: 0 0 40px rgba(31, 81, 255, 0.10), inset 0 1px 1px rgba(138, 162, 255, 0.12);
            }
            .mesh-grad {
              background-image: radial-gradient(at 0% 0%, rgba(31, 81, 255, 0.08) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(138, 162, 255, 0.05) 0, transparent 50%);
            }
            button { cursor: pointer; }
            button:disabled { cursor: not-allowed; }
            @media (prefers-reduced-motion: reduce){ *,*::before,*::after { animation:none !important; transition:none !important } }
          `}} />

          <div
            className="relative w-full max-w-lg rounded-[32px] overflow-hidden transition-all duration-500 guide-modal-glow animate-[guide-scale-up_0.35s_ease-out]"
            style={{
              background: theme === 'dark' ? '#141417' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(138,162,255,0.18)' : '1px solid rgba(31,81,255,0.16)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Glowing background accent behind the icon */}
            <div 
              className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-[80px]" 
              style={{ background: steps[currentStep].color + '15' }}
            />

            {/* Decorative Banner with Mesh Gradient */}
            <div
              className="h-36 flex items-center justify-center relative mesh-grad border-b"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                background: `linear-gradient(180deg, ${steps[currentStep].color}18 0%, transparent 100%)`
              }}
            >
              <div 
                className="h-20 w-20 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-300 transform scale-110 relative"
                style={{ 
                  background: theme === 'dark' ? '#1b1b20' : '#f4f5fb',
                  border: theme === 'dark' ? '1px solid rgba(138,162,255,0.12)' : '1px solid rgba(31,81,255,0.10)'
                }}
              >
                <div className="absolute inset-0 rounded-[24px] blur-md opacity-40" style={{ background: steps[currentStep].color }} />
                <ActiveIcon size={36} className="relative z-10" style={{ color: steps[currentStep].color }} />
              </div>
              <button
                onClick={handleCloseGuide}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 z-20"
                style={{ 
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                  color: theme === 'dark' ? '#a1a1aa' : '#71717a' 
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-8 space-y-8 relative z-10">
              <div className="space-y-3 text-center animate-[content-slide-in_0.4s_ease-out]">
                <span 
                  className="text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full inline-block"
                  style={{ 
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
                  }}
                >
                  {steps[currentStep].badge}
                </span>
                <h3 className="text-2xl font-black tracking-tight mt-2" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: theme === 'dark' ? '#a1a1aa' : '#52525b' }}>
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center items-center gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: currentStep === idx ? '28px' : '6px',
                      background: currentStep === idx
                        ? (theme === 'dark' ? '#8aa2ff' : '#1f51ff')
                        : (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                    }}
                  />
                ))}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-2xl border transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                  style={{ 
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: theme === 'dark' ? '#ffffff' : '#000000' 
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{
                    background: theme === 'dark' ? '#8aa2ff' : '#1f51ff',
                    color: theme === 'dark' ? '#0b0b0d' : '#ffffff',
                    boxShadow: theme === 'dark' ? '0 8px 24px rgba(31,81,255,0.35)' : '0 8px 24px rgba(31,81,255,0.28)'
                  }}
                >
                  <span>{currentStep === steps.length - 1 ? 'Start Learning' : 'Continue'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
