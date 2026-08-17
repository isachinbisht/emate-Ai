'use client';

import React, { useState } from 'react';
import { Copy, Check, Zap, BookOpen, RotateCcw, BookMarked } from 'lucide-react';
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
          className="my-3 rounded-xl overflow-hidden"
          style={{ 
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', 
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' 
          }}
        >
          {lang && (
            <div className="px-4 py-2" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
              <span className="text-xs font-mono" style={{ color: isDark ? '#8e8ea0' : '#71717a' }}>
                {lang}
              </span>
            </div>
          )}
          <pre className="px-4 py-3 overflow-x-auto">
            <code className="text-xs font-mono leading-relaxed" style={{ color: isDark ? '#b4b4b4' : '#27272a' }}>
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
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-4">
          {bullets.map((b, bi) => (
            <li
              key={`li-${i}-${bi}`}
              className="text-sm leading-relaxed flex items-start gap-2"
              style={{ color: isDark ? '#b4b4b4' : '#27272a' }}
            >
              <span
                className="w-1 h-1 rounded-full mt-2 shrink-0"
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
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-4 list-decimal list-inside">
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
      result.push(<div key={`br-${i}`} className="h-1" />);
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
  const strongColor = isDark ? '#ececec' : '#000000';
  const emColor = isDark ? '#b4b4b4' : '#52525b';
  const codeBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const codeColor = isDark ? '#a78bfa' : '#6d28d9';

  return text
    .replace(/\*\*(.+?)\*\*/g, `<strong style="font-weight:600;color:${strongColor}">$1</strong>`)
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

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2 fade-in-up">
        <div className="chat-message-width flex justify-end">
          <div
            className="max-w-[75%] xl:max-w-[65%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{
              background: isDark ? '#2f2f2f' : '#f4F4f6',
              color: isDark ? '#ececec' : '#000000',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 fade-in-up group transition-colors" style={{ borderBottom: isDark ? 'none' : '1px solid rgba(0,0,0,0.03)' }}>
      <div className="chat-message-width">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: 'rgba(16,163,127,0.15)',
              border: '1px solid rgba(16,163,127,0.25)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 28 28" fill="none">
              <path
                d="M9 14h10M9 10.5h6M9 17.5h8"
                stroke="#10a37f"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold" style={{ color: isDark ? '#ececec' : '#000000' }}>
                AI Topper
              </span>
              {message.mode === 'sprint' ? (
                <span className="inline-flex items-center gap-1 text-xs sprint-badge px-2 py-0.5 rounded-full font-medium">
                  <Zap size={9} />
                  Sprint
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs deep-dive-badge px-2 py-0.5 rounded-full font-medium">
                  <BookOpen size={9} />
                  Deep
                </span>
              )}
              <span className="text-xs" style={{ color: isDark ? '#8e8ea0' : '#71717a' }}>
                {message.timestamp}
              </span>
            </div>

            <div className="prose-sm max-w-none">{renderMarkdown(message.content, theme)}</div>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handleCopy}
                title="Copy response"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150 hover:bg-white/6"
                style={{ color: '#8e8ea0' }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleSaveToNotebook}
                title="Save to Subject Notebook"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150 hover:bg-white/6"
                style={{ color: '#8e8ea0' }}
              >
                {saved ? <Check size={12} className="text-emerald-500" /> : <BookMarked size={12} />}
                <span className={saved ? 'text-emerald-500 font-medium' : ''}>{saved ? 'Saved to Notebook' : 'Save to Notebook'}</span>
              </button>
              <button
                title="Regenerate"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150 hover:bg-white/6"
                style={{ color: '#8e8ea0' }}
              >
                <RotateCcw size={12} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
