'use client';

import React, { useState } from 'react';
import { Copy, Check, Zap, BookOpen, RotateCcw, BookMarked, Sparkles } from 'lucide-react';
import type { ChatMessage } from './AITopperChatScreen';
import { appendToNotebook } from '@/lib/notebook';
import { toast } from 'sonner';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  theme?: 'light' | 'dark';
}

function renderMarkdown(text: string, theme: 'light' | 'dark' = 'dark'): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  const isDark = theme === 'dark';

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <div
          key={`code-${i}`}
          className="relative my-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-sm shadow-md"
        >
          <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-sans">
            <span>{lang || 'code'}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeLines.join('\n'));
                toast.success('Code copied to clipboard!');
              }}
              className="hover:text-zinc-200 transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto bg-transparent text-zinc-100 whitespace-pre scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <code className="text-xs font-mono leading-relaxed bg-transparent overflow-x-auto whitespace-pre">
              {codeLines.join('\n')}
            </code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
          .filter((l) => !l.match(/^\|[-\s|]+\|$/))
          .map((l) =>
            l
              .split('|')
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              .map((cell) => cell.trim())
          );
      if (rows.length > 0) {
        result.push(
          <div
            key={`table-${i}`}
            className="my-3 overflow-x-auto rounded-xl"
            style={{ border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}
          >
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                  {rows[0].map((cell, ci) => (
                    <th
                      key={`th-${ci}`}
                      className="px-3 py-2 text-left font-semibold"
                      style={{ color: isDark ? '#ececec' : '#000000', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr
                    key={`tr-${ri}`}
                    style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)' }}
                    className="last:border-0"
                  >
                    {row.map((cell, ci) => (
                      <td key={`td-${ri}-${ci}`} className="px-3 py-2" style={{ color: isDark ? '#b4b4b4' : '#27272a' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (line.startsWith('## ')) {
      result.push(
        <h2
          key={`h2-${i}`}
          className="text-base font-semibold mt-4 mb-2"
          style={{ color: isDark ? '#ececec' : '#000000' }}
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      result.push(
        <h3
          key={`h3-${i}`}
          className="text-sm font-semibold mt-3 mb-1.5"
          style={{ color: isDark ? '#ececec' : '#000000' }}
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bullets: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <ul key={`ul-${i}`} className="my-2 space-y-2 pl-4">
          {bullets.map((b, bi) => (
            <li
              key={`li-${i}-${bi}`}
              className="text-sm leading-relaxed flex items-start gap-2"
              style={{ color: isDark ? '#b4b4b4' : '#27272a' }}
            >
              <span
                className="w-1 h-1 rounded-full mt-2.5 shrink-0"
                style={{ background: '#10a37f' }}
              />
              <span dangerouslySetInnerHTML={{ __html: formatInline(b, theme) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      result.push(
        <ol key={`ol-${i}`} className="my-2 space-y-2 pl-4 list-decimal list-inside">
          {items.map((item, ii) => (
            <li
              key={`oli-${i}-${ii}`}
              className="text-sm leading-relaxed"
              style={{ color: isDark ? '#b4b4b4' : '#27272a' }}
              dangerouslySetInnerHTML={{ __html: formatInline(item, theme) }}
            />
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === '') {
      result.push(<div key={`br-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    result.push(
      <p
        key={`p-${i}`}
        className="text-sm leading-relaxed"
        style={{ color: isDark ? '#b4b4b4' : '#27272a' }}
        dangerouslySetInnerHTML={{ __html: formatInline(line, theme) }}
      />
    );
    i++;
  }

  return result;
}

function formatInline(text: string, theme: 'light' | 'dark' = 'dark'): string {
  const isDark = theme === 'dark';
  const strongColor = isDark ? '#ffffff' : '#111111';
  const emColor = isDark ? '#b4b4b4' : '#52525b';
  const codeBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const codeColor = isDark ? '#a78bfa' : '#6d28d9';
  const chipBg = isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)';
  const chipBorder = isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)';

  return text
    .replace(/\*\*(.+?)\*\*/g, `<strong style="font-weight:600;color:${strongColor};background:${chipBg};border:1px solid ${chipBorder};padding:1px 5px;border-radius:4px;font-size:0.95em;margin:0 1px;">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="font-style:italic;color:${emColor}">$1</em>`)
    .replace(
      /`(.+?)`/g,
      `<code style="padding:2px 6px;border-radius:4px;font-size:0.75rem;font-family:monospace;background:${codeBg};color:${codeColor}">$1</code>`
    );
}

export default function ChatMessageBubble({ message, theme = 'dark' }: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const isUser = message.role === 'user';
  const isDark = theme === 'dark';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveToNotebook = () => {
    const activeSubj = typeof window !== 'undefined' ? localStorage.getItem('nk-subject') : null;
    const subj = message.subject || activeSubj || 'DBMS';
    appendToNotebook(subj, `Key concept: ${message.content.slice(0, 300)}${message.content.length > 300 ? '...' : ''}`, 'ai');
    setSaved(true);
    toast.success(`Saved to ${subj} Notebook!`);
    setTimeout(() => setSaved(false), 2000);
  };

  const [isProcessExpanded, setIsProcessExpanded] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end w-full fade-in-up">
        <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 rounded-2xl max-w-[80%] ml-auto text-sm leading-relaxed shadow-sm font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full fade-in-up group transition-colors flex flex-col gap-2">
      {/* Header Row — only in Study Copilot mode */}
      {!message.isGeneralChat && (
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
            <Sparkles size={12} />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Assistant
          </span>
          {message.mode === 'sprint' ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
              Sprint
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
              Deep Dive
            </span>
          )}
          <span className="text-[11px] text-zinc-400 font-normal ml-auto">
            {message.timestamp}
          </span>
        </div>
      )}

      {/* Accordion process indicator */}
      {!message.isGeneralChat && (
        <div className="my-1">
          <button
            onClick={() => setIsProcessExpanded(!isProcessExpanded)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors py-1 focus:outline-none"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Thought process finished</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-transform duration-200 ${isProcessExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isProcessExpanded && (
            <div className="mt-1.5 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-1 font-mono">
              <div>✓ Loaded subject notebook settings</div>
              <div>✓ Injected personal context summary</div>
              <div>✓ Sent request to model</div>
              <div>✓ Completed stream response successfully</div>
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed font-normal" style={{ color: isDark ? '#d4d4d8' : '#27272a' }}>
        {renderMarkdown(message.content, theme)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={handleCopy}
          title="Copy response"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: '#8e8ea0' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        {!message.isGeneralChat && (
          <button
            onClick={handleSaveToNotebook}
            title="Save to Subject Notebook"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: '#8e8ea0' }}
          >
            {saved ? <Check size={12} className="text-emerald-500" /> : <BookMarked size={12} />}
            <span className={saved ? 'text-emerald-500 font-medium' : ''}>{saved ? 'Saved to Notebook' : 'Save to Notebook'}</span>
          </button>
        )}
        <button
          title="Regenerate"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: '#8e8ea0' }}
        >
          <RotateCcw size={12} />
          <span>Regenerate</span>
        </button>
      </div>
    </div>
  );
}
