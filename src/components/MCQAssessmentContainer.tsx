'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { MCQQuiz, MCQSubmission } from '@/lib/agents/types';
import { cn } from '@/lib/utils';

interface MCQAssessmentContainerProps {
  open: boolean;
  onClose: () => void;
  quiz: MCQQuiz | null;
  onSubmit: (submission: MCQSubmission) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export default function MCQAssessmentContainer({
  open,
  onClose,
  quiz,
  onSubmit,
}: MCQAssessmentContainerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const [questionStart, setQuestionStart] = useState<number>(Date.now());
  const [isDark, setIsDark] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Theme detection
  useEffect(() => {
    const read = () => setIsDark(localStorage.getItem('nk-theme') !== 'light');
    read();
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, []);

  // Reset state when quiz changes
  useEffect(() => {
    if (open && quiz) {
      setCurrentIdx(0);
      setAnswers({});
      setElapsed({});
      setQuestionStart(Date.now());
      setShowConfirm(false);
    }
  }, [open, quiz, quiz?.id]);

  // Timer — ticks every second for the current question
  useEffect(() => {
    if (!open || !quiz || showConfirm) return;
    const tick = setInterval(() => {
      const qId = quiz.questions[currentIdx]?.id;
      if (qId) {
        setElapsed((prev) => ({
          ...prev,
          [qId]: Math.floor((Date.now() - questionStart) / 1000),
        }));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [open, currentIdx, questionStart, showConfirm, quiz]);

  // Navigate to a new question — record elapsed time on the old one
  const goToQuestion = useCallback(
    (idx: number) => {
      if (!quiz) return;
      const oldQ = quiz.questions[currentIdx];
      if (oldQ) {
        const spent = Math.floor((Date.now() - questionStart) / 1000);
        setElapsed((prev) => ({ ...prev, [oldQ.id]: spent }));
      }
      setCurrentIdx(idx);
      setQuestionStart(Date.now());
    },
    [quiz, currentIdx, questionStart]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirm) setShowConfirm(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, showConfirm, onClose]);

  if (!open || !quiz) return null;

  const total = quiz.questions.length;
  const q = quiz.questions[currentIdx];
  const answered = Object.keys(answers).length;
  const isLast = currentIdx === total - 1;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    // Finalize elapsed for current question
    const finalElapsed = { ...elapsed };
    if (q) {
      finalElapsed[q.id] = Math.floor((Date.now() - questionStart) / 1000);
    }

    onSubmit({
      quizId: quiz.id,
      answers,
      timePerQuestion: finalElapsed,
      completedAt: new Date().toISOString(),
    });
    setShowConfirm(false);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="MCQ Assessment"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-150',
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-b',
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          )}
        >
          <div>
            <h3 className="text-sm font-semibold">
              {quiz.subject}
              {quiz.unit ? ` — ${quiz.unit}` : ''}
            </h3>
            <p className={cn('text-xs mt-0.5', isDark ? 'text-zinc-400' : 'text-zinc-500')}>
              Question {currentIdx + 1} of {total} · {answered} answered
            </p>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg',
              isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
            )}
          >
            <Clock size={12} />
            {formatTime(elapsed[q?.id] ?? 0)}
          </div>
        </div>

        {/* Progress bar */}
        <div className={cn('h-1', isDark ? 'bg-zinc-800' : 'bg-zinc-100')}>
          <div
            className="h-full bg-[#1f51ff] transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>

        {/* Question body */}
        <div className="px-5 py-5">
          <p className="text-sm font-medium leading-relaxed mb-5">{q.question}</p>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-150 cursor-pointer outline-none',
                    isSelected
                      ? 'bg-[#1f51ff]/10 dark:bg-[#1f51ff]/15 border-2 border-[#1f51ff] text-[#1f51ff] dark:text-[#8aa2ff]'
                      : cn(
                          'border-2 border-transparent',
                          isDark
                            ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                        )
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0',
                      isSelected
                        ? 'bg-[#1f51ff] text-white'
                        : isDark
                          ? 'bg-zinc-700 text-zinc-300'
                          : 'bg-zinc-200 text-zinc-600'
                    )}
                  >
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer navigation */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-t',
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          )}
        >
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => goToQuestion(currentIdx - 1)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer outline-none',
              currentIdx === 0
                ? 'opacity-40 pointer-events-none'
                : isDark
                  ? 'text-zinc-300 hover:bg-zinc-800'
                  : 'text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <div className="flex items-center gap-2">
            {isLast ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1f51ff] text-white hover:bg-[#1a45e0] transition-colors cursor-pointer outline-none"
              >
                <CheckCircle2 size={14} />
                Submit Quiz ({answered}/{total})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToQuestion(currentIdx + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-colors cursor-pointer outline-none"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Confirm submit overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
              className={cn(
                'rounded-2xl p-6 max-w-sm mx-4 shadow-xl border animate-in fade-in zoom-in-95 duration-150',
                isDark
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                  : 'bg-white border-zinc-200 text-zinc-900'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                {answered < total ? (
                  <XCircle size={20} className="text-amber-500" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                )}
                <h4 className="text-sm font-semibold">
                  {answered < total ? 'Incomplete Quiz' : 'Ready to Submit?'}
                </h4>
              </div>
              <p className={cn('text-xs mb-4', isDark ? 'text-zinc-400' : 'text-zinc-500')}>
                {answered < total
                  ? `You've answered ${answered} of ${total} questions. Unanswered questions will be marked as incorrect.`
                  : `You've answered all ${total} questions. Ready to see your results?`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer outline-none',
                    isDark
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  )}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1f51ff] text-white hover:bg-[#1a45e0] transition-colors cursor-pointer outline-none"
                >
                  {answered < total ? 'Submit Anyway' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
