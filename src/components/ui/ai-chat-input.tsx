'use client';

import * as React from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
interface Attachment {
  id: string;
  file: File;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------
function MorphingText({ text }: { text: string }) {
  const [width, setWidth] = useState<number | 'auto'>('auto');
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      setWidth(spanRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      style={{ width }}
    >
      <span ref={spanRef} className="invisible whitespace-nowrap px-1">
        {text}
      </span>
      <span
        key={text}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300"
      >
        {text}
      </span>
    </span>
  );
}

function ModelSparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"
        fill="currentColor"
      />
      <path
        d="M18 14l.8 1.9 1.9.8-1.9.8L18 19.4l-.8-1.9-1.9-.8 1.9-.8L18 14z"
        fill="currentColor"
      />
    </svg>
  );
}

function ModelIcon({ model, className }: { model: string; className?: string }) {
  const brandIcons: Record<string, string> = {
    'Gemini 2.0 Flash':
      'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/google-gemini-icon_l6kk5q.svg',
    'Gemini 2.5 Flash':
      'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/google-gemini-icon_l6kk5q.svg',
    'GPT-4o Mini':
      'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695269/openai-icon_zozuib.svg',
    'Claude 3.5 Sonnet':
      'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/Claude_AI_symbol_yqfzlc.svg',
  };

  if (brandIcons[model]) {
    return <img src={brandIcons[model]} alt={model} className={cn('object-contain', className)} />;
  }

  return <ModelSparkleIcon />;
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 2.5V11.5M2.5 7H11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DynamicBarsIcon({ level }: { level: string }) {
  const bars =
    level === 'Deep' || level === 'Max Effort'
      ? 3
      : level === 'Balanced' || level === 'Medium'
        ? 2
        : 1;

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect
        x="1.5"
        y="8"
        width="2.5"
        height="4.5"
        rx="1"
        fill="currentColor"
        className="transition-opacity duration-300"
        opacity={bars >= 1 ? 1 : 0.3}
      />
      <rect
        x="5.75"
        y="5"
        width="2.5"
        height="7.5"
        rx="1"
        fill="currentColor"
        className="transition-opacity duration-300"
        opacity={bars >= 2 ? 1 : 0.3}
      />
      <rect
        x="10"
        y="2"
        width="2.5"
        height="10.5"
        rx="1"
        fill="currentColor"
        className="transition-opacity duration-300"
        opacity={bars >= 3 ? 1 : 0.3}
      />
    </svg>
  );
}

// ----------------------------------------------------------------------
// Attachment Thumbnail
// ----------------------------------------------------------------------
function AttachmentThumb({
  attachment,
  index,
  onRemove,
  onOpen,
  registerRef,
}: {
  attachment: Attachment;
  index: number;
  onRemove: (id: string) => void;
  onOpen: (attachment: Attachment, rect: DOMRect) => void;
  registerRef: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={(el) => {
        btnRef.current = el;
        registerRef(attachment.id, el);
      }}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (btnRef.current) {
          onOpen(attachment, btnRef.current.getBoundingClientRect());
        }
      }}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: 'backwards' }}
      className={cn(
        'group relative size-12 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 outline-none',
        'transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96]',
        'animate-in fade-in zoom-in-90 duration-300'
      )}
      aria-label={`Open preview of ${attachment.name}`}
    >
      <img
        src={attachment.url}
        alt={attachment.name}
        className="size-full object-cover"
        draggable={false}
      />
      <span
        className={cn(
          'absolute inset-0 flex items-start justify-end bg-black/0 transition-colors duration-200',
          isHovered && 'bg-black/25'
        )}
      >
        <span
          role="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(attachment.id);
          }}
          className={cn(
            'm-1 flex size-4 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 shadow-sm transition-all duration-200 hover:scale-110',
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
          )}
          aria-label={`Remove ${attachment.name}`}
        >
          <CloseIcon />
        </span>
      </span>
    </button>
  );
}

// ----------------------------------------------------------------------
// Shared-Element Gallery Modal
// ----------------------------------------------------------------------
function AttachmentGalleryModal({
  attachment,
  originRect,
  onClose,
}: {
  attachment: Attachment;
  originRect: DOMRect;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    radius: number;
  } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const maxW = Math.min(window.innerWidth * 0.86, 560);
    const maxH = Math.min(window.innerHeight * 0.78, 720);

    const naturalW = attachment.width || 800;
    const naturalH = attachment.height || 600;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1.6);

    const width = naturalW * scale;
    const height = naturalH * scale;

    setTargetRect({
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height,
      radius: 20,
    });

    const raf = requestAnimationFrame(() => setPhase('open'));
    return () => cancelAnimationFrame(raf);
  }, [attachment]);

  const handleClose = useCallback(() => setPhase('closing'), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const isOpen = phase === 'open';
  const isClosing = phase === 'closing';

  const geometry =
    isOpen && targetRect
      ? targetRect
      : {
          top: originRect.top,
          left: originRect.left,
          width: originRect.width,
          height: originRect.height,
          radius: 12,
        };

  const animEasing = isClosing ? 'ease-out' : 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  const animDur = isClosing ? '0.3s' : '0.45s';
  const flipTransition = `top ${animDur} ${animEasing}, left ${animDur} ${animEasing}, width ${animDur} ${animEasing}, height ${animDur} ${animEasing}, border-radius ${animDur} ${animEasing}`;

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-400"
        style={{ opacity: isOpen ? 1 : 0 }}
      />
      <div
        style={{
          position: 'fixed',
          top: geometry.top,
          left: geometry.left,
          width: geometry.width,
          height: geometry.height,
          borderRadius: geometry.radius,
          transition: flipTransition,
          overflow: 'hidden',
          boxShadow: isOpen
            ? '0 24px 60px -12px rgb(0 0 0 / 0.35)'
            : '0 0px 0px 0px rgb(0 0 0 / 0)',
        }}
        className="bg-zinc-900"
        onTransitionEnd={() => {
          if (phase === 'closing') onClose();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imgRef}
          src={attachment.url}
          alt={attachment.name}
          className="size-full object-cover"
          draggable={false}
        />
      </div>

      <button
        type="button"
        onClick={handleClose}
        style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'scale(1)' : 'scale(0.7)' }}
        className={cn(
          'fixed right-4 top-4 flex size-9 items-center justify-center rounded-full bg-zinc-800/90 text-zinc-100 shadow-md backdrop-blur-sm',
          'transition-all duration-300 hover:bg-zinc-700',
          !isOpen && 'pointer-events-none'
        )}
      >
        <span className="scale-150">
          <CloseIcon />
        </span>
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export interface PromptInputProps {
  onSubmit?: (value: string, meta: { model: string; effort: string; attachments: File[] }) => void;
  placeholder?: string;
  className?: string;
  models?: string[];
  efforts?: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  maxAttachments?: number;
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      onSubmit,
      placeholder = 'Ask anything or type / for commands...',
      className,
      models = ['Gemini 2.0 Flash', 'Gemini 2.5 Flash', 'GPT-4o Mini', 'Claude 3.5 Sonnet'],
      efforts = ['Quick', 'Balanced', 'Deep'],
      defaultValue = '',
      value: controlledValue,
      onChange,
      maxAttachments = 6,
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(defaultValue);
    const [selectedModel, setSelectedModel] = useState(models[0]);
    const [effortIndex, setEffortIndex] = useState(0);
    const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);

    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [activeAttachment, setActiveAttachment] = useState<{
      attachment: Attachment;
      rect: DOMRect;
    } | null>(null);

    // Audio/Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(new Array(5).fill(0));

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : localValue;
    const hasValue = value.trim() !== '' || attachments.length > 0;
    const hasAttachments = attachments.length > 0;

    const valueRef = useRef(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modelSelectRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

    // Refs for Web Audio & Speech Recognition cleanup
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const demoIntervalRef = useRef<number | null>(null);
    const demoTextIntervalRef = useRef<number | null>(null);

    // Sync value ref for audio callback closure
    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const handleValueChange = useCallback(
      (val: string) => {
        if (!isControlled) setLocalValue(val);
        onChange?.(val);
      },
      [isControlled, onChange]
    );

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    };

    // Auto-adjust textarea height dynamically based on value changes
    useEffect(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value]);

    // Close model select on outside click
    useEffect(() => {
      if (!isModelSelectOpen) return;
      const handleOutsideClick = (e: MouseEvent) => {
        if (modelSelectRef.current && !modelSelectRef.current.contains(e.target as Node)) {
          setIsModelSelectOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isModelSelectOpen]);

    // --- Voice Recording Logic ---
    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (demoIntervalRef.current) {
        window.clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      if (demoTextIntervalRef.current) {
        window.clearInterval(demoTextIntervalRef.current);
        demoTextIntervalRef.current = null;
      }
      setIsRecording(false);
      setAudioData(new Array(5).fill(0));
    }, []);

    const startRecording = useCallback(async () => {
      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (err) {
        console.warn(
          'Microphone access denied or unavailable. Falling back to simulated voice mode for demo.'
        );
      }

      setIsRecording(true);

      function simulateText() {
        const fakeText = 'Explain 3NF and BCNF normalization with examples';
        const words = fakeText.split(' ');
        let i = 0;
        let currentBase = valueRef.current;
        demoTextIntervalRef.current = window.setInterval(() => {
          if (i < words.length) {
            currentBase = (currentBase ? currentBase + ' ' : '') + words[i];
            handleValueChange(currentBase);
            i++;
          } else {
            stopRecording();
          }
        }, 300);
      }

      if (stream) {
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVisualizer = () => {
          analyser.getByteFrequencyData(dataArray);
          const bands = new Array(5).fill(0);
          const step = Math.floor(dataArray.length / 5);
          for (let i = 0; i < 5; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += dataArray[i * step + j];
            }
            bands[i] = sum / step / 255;
          }
          setAudioData(bands);
          rafRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();

        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          let baseline = valueRef.current;

          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            if (finalTranscript) {
              baseline += (baseline ? ' ' : '') + finalTranscript;
            }

            handleValueChange(
              (baseline + (interimTranscript ? ' ' + interimTranscript : '')).trim()
            );
          };

          recognition.onerror = (e: any) => {
            console.error('Speech recognition error', e);
            stopRecording();
          };

          recognition.onend = () => {
            stopRecording();
          };

          recognitionRef.current = recognition;
          recognition.start();
        } else {
          simulateText();
        }
      } else {
        demoIntervalRef.current = window.setInterval(() => {
          setAudioData(Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1));
        }, 100);
        simulateText();
      }
    }, [handleValueChange, stopRecording]);

    // Keep textarea auto-scrolled to bottom while recording
    useEffect(() => {
      if (isRecording && textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, [value, isRecording]);

    // Ensure cleanup of mic/streams on unmount
    useEffect(() => {
      return () => {
        stopRecording();
        attachments.forEach((a) => URL.revokeObjectURL(a.url));
      };
    }, [stopRecording, attachments]);

    const handleSubmit = () => {
      if (value.trim() === '' && !hasAttachments) return;
      onSubmit?.(value, {
        model: selectedModel,
        effort: efforts[effortIndex],
        attachments: attachments.map((a) => a.file),
      });
      handleValueChange('');
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
      setAttachments([]);
      setIsModelSelectOpen(false);
    };

    const cycleEffort = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEffortIndex((prev) => (prev + 1) % efforts.length);
    };

    const openFileChooser = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
      e.target.value = '';

      if (files.length === 0) return;
      const room = Math.max(0, maxAttachments - attachments.length);
      const accepted = files.slice(0, room);

      for (const file of accepted) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => addAttachment(file, url, img.naturalWidth, img.naturalHeight);
        img.onerror = () => addAttachment(file, url, 800, 600);
        img.src = url;
      }
    };

    const addAttachment = (file: File, url: string, width: number, height: number) => {
      const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
      setAttachments((prev) => [...prev, { id, file, url, name: file.name, width, height }]);
    };

    const removeAttachment = (id: string) => {
      setAttachments((prev) => {
        const target = prev.find((a) => a.id === id);
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter((a) => a.id !== id);
      });
      thumbRefs.current.delete(id);
    };

    // Calculate action button states
    const showArrow = hasValue && !isRecording;
    const showStop = isRecording;
    const showMic = !hasValue && !isRecording;

    const onActionButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isRecording) {
        stopRecording();
      } else if (hasValue) {
        handleSubmit();
      } else {
        startRecording();
      }
    };

    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .prompt-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.2); border-radius: 4px; }
              .prompt-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.4); }
            `,
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChosen}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Primary Search Card Container — Clean Single-Card Layout without internal line collisions */}
        <div
          ref={ref}
          className={cn(
            'w-full max-w-2xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-md flex flex-col justify-between transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/40',
            className
          )}
        >
          {/* Top Row: Auto-resizing Text Input */}
          <div className="w-full flex-1 mb-3">
            {/* Attachment preview row if files are attached */}
            {hasAttachments && (
              <div className="flex items-center gap-2 pb-2 px-1 overflow-x-auto prompt-scrollbar">
                {attachments.map((attachment, index) => (
                  <AttachmentThumb
                    key={attachment.id}
                    attachment={attachment}
                    index={index}
                    onRemove={removeAttachment}
                    onOpen={(a, rect) => setActiveAttachment({ attachment: a, rect })}
                    registerRef={(id, el) => thumbRefs.current.set(id, el)}
                  />
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                handleInput(e);
                handleValueChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              aria-label="Prompt"
              disabled={isRecording}
              className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:text-left text-left px-1 py-1 resize-none overflow-y-auto min-h-[56px] max-h-[160px] prompt-scrollbar"
            />
          </div>

          {/* Bottom Row: Toolbar Controls */}
          <div className="flex items-center justify-between pt-1 w-full">
            {/* Left Side: Model & Network Mode */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={modelSelectRef}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModelSelectOpen((prev) => !prev);
                  }}
                  className={cn(
                    'group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors outline-none cursor-pointer text-xs font-semibold',
                    isModelSelectOpen ? 'ring-1 ring-zinc-300 dark:ring-zinc-700' : ''
                  )}
                  aria-label={`Select model. Current: ${selectedModel}`}
                >
                  <ModelIcon
                    model={selectedModel}
                    className="size-3.5 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="text-xs font-semibold select-none">
                    <MorphingText text={selectedModel} />
                  </span>
                </button>

                {isModelSelectOpen && (
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-1.5 shadow-xl backdrop-blur-md flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {models.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model);
                          setIsModelSelectOpen(false);
                        }}
                        className={cn(
                          'group flex h-8 w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer',
                          model === selectedModel
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <ModelIcon
                            model={model}
                            className="size-3.5 opacity-85 group-hover:opacity-100 transition-opacity"
                          />
                          {model}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={cycleEffort}
                className="text-xs font-medium text-zinc-500 flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer"
                aria-label={`Mode effort: ${efforts[effortIndex]}`}
              >
                <DynamicBarsIcon level={efforts[effortIndex]} />
                <span className="text-xs font-medium select-none">
                  <MorphingText text={efforts[effortIndex]} />
                </span>
              </button>
            </div>

            {/* Right Side: Action Icons (+ and Mic) */}
            <div className="flex items-center gap-2">
              {/* Audio Wave Visualizer during voice recording */}
              {isRecording && (
                <div className="flex h-8 items-center gap-[3px] px-1">
                  {audioData.map((val, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-blue-500 transition-[height] duration-75 ease-out"
                      style={{ height: `${Math.max(4, val * 20)}px` }}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={openFileChooser}
                disabled={attachments.length >= maxAttachments}
                title="Attach image"
                className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <PlusIcon />
              </button>

              {showMic && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={onActionButtonClick}
                  aria-label="Use voice input"
                  title="Voice input"
                  className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-white" />
                </button>
              )}

              {showArrow && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={onActionButtonClick}
                  aria-label="Send prompt"
                  title="Send"
                  className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-sm transition-transform active:scale-95 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-pointer"
                >
                  <ArrowUpIcon />
                </button>
              )}

              {showStop && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={onActionButtonClick}
                  aria-label="Stop recording"
                  title="Stop recording"
                  className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
                >
                  <StopIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeAttachment && (
          <AttachmentGalleryModal
            attachment={activeAttachment.attachment}
            originRect={activeAttachment.rect}
            onClose={() => setActiveAttachment(null)}
          />
        )}
      </>
    );
  }
);

PromptInput.displayName = 'PromptInput';
