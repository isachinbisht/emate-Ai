import React from 'react';
import { ArrowRight, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';

const SUBJECTS = [
  {
    id: 'subj-001',
    name: 'Data Structures & Algorithms',
    code: 'BCA-401',
    units: 8,
    covered: 6,
    avgScore: 71,
    probBadge: 'High Probability',
    probType: 'high' as const,
    examIn: '3 days',
    color: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.2)',
  },
  {
    id: 'subj-002',
    name: 'Database Management Systems',
    code: 'BCA-402',
    units: 7,
    covered: 5,
    avgScore: 68,
    probBadge: 'Repeated PYQ',
    probType: 'repeated' as const,
    examIn: '1 day',
    color: 'rgba(139,92,246,0.1)',
    borderColor: 'rgba(139,92,246,0.2)',
  },
  {
    id: 'subj-003',
    name: 'Operating Systems',
    code: 'BCA-403',
    units: 6,
    covered: 3,
    avgScore: 54,
    probBadge: 'Concept Anchor',
    probType: 'medium' as const,
    examIn: '5 days',
    color: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'subj-004',
    name: 'Web Technologies',
    code: 'BCA-404',
    units: 5,
    covered: 4,
    avgScore: 82,
    probBadge: 'High Probability',
    probType: 'high' as const,
    examIn: '7 days',
    color: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.2)',
  },
  {
    id: 'subj-005',
    name: 'Computer Networks',
    code: 'BCA-405',
    units: 7,
    covered: 2,
    avgScore: 47,
    probBadge: 'Concept Anchor',
    probType: 'medium' as const,
    examIn: '9 days',
    color: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)',
  },
  {
    id: 'subj-006',
    name: 'Software Engineering',
    code: 'BCA-406',
    units: 6,
    covered: 5,
    avgScore: 76,
    probBadge: 'Repeated PYQ',
    probType: 'repeated' as const,
    examIn: '11 days',
    color: 'rgba(20,184,166,0.1)',
    borderColor: 'rgba(20,184,166,0.2)',
  },
];

const PROB_BADGE_CLASSES = {
  high: 'prob-high',
  medium: 'prob-medium',
  repeated: 'prob-repeated',
};

export default function SubjectsGrid() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Your Subjects</h2>
          <p className="text-xs text-text-muted mt-0.5">IPU BCA Sem 4 · 6 subjects</p>
        </div>
        <button className="btn-ghost text-xs py-1.5 px-3">View Syllabus</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-4">
        {SUBJECTS.map((subject) => {
          const coverPct = Math.round((subject.covered / subject.units) * 100);
          return (
            <Link
              key={subject.id}
              href="/ai-topper-chat"
              className="glass-card glass-card-hover p-5 block group transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{
                      background: subject.color,
                      border: `1px solid ${subject.borderColor}`,
                    }}
                  >
                    <BookOpen size={16} className="text-text-secondary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">{subject.code}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PROB_BADGE_CLASSES[subject.probType]}`}
                  >
                    {subject.probBadge}
                  </span>
                  <span className="text-xs text-text-muted">Exam in {subject.examIn}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-muted">
                    {subject.covered}/{subject.units} units covered
                  </span>
                  <span className="text-xs tabular-nums font-medium text-text-secondary">
                    {coverPct}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${coverPct}%`,
                      background: `linear-gradient(90deg, var(--primary), var(--accent))`,
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-warning" />
                  <span className="text-xs tabular-nums font-medium text-text-secondary">
                    {subject.avgScore}% avg score
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
