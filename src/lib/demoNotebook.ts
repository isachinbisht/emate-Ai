/**
 * Demo notebook for guest users.
 *
 * Guests can't upload their own files, so the "Try Demo Notebook" button loads
 * these pre-written Operating Systems study notes into the active subject's
 * notebook. From there the existing `buildNotebookContext` / `appendToNotebook`
 * pipeline personalizes AI answers with the sample content.
 *
 * Uses the existing `saveNotebook` helper from `@/lib/notebook` so it syncs via
 * the same `nk-notebook-change` event already listened for across the app.
 */

import { getNotebook, saveNotebook, type NotebookEntry } from '@/lib/notebook';

export const DEMO_SUBJECT = 'Operating Systems';

const DEMO_NOTES: string[] = [
  '⭐ OS = software that manages hardware & provides services for application programs (resource manager + extended/virtual machine).',
  '📌 Process vs. Thread: process = program in execution with its own address space; thread = lightweight unit of execution within a process, shares address space.',
  'Scheduling: FCFS (non-preemptive, convoy effect), SJF (min avg waiting, starvation), Round Robin (time quantum, preemptive), Priority (may starve — fix with aging), Multilevel Queue.',
  '⭐ Turnaround time = completion − arrival; Waiting time = turnaround − burst; Response time = first response − arrival.',
  'Context switch overhead matters — small time quantum → more switches, lower throughput.',
  '📌 Memory management: contiguous vs. paging vs. segmentation. Paging = fixed-size frames/pages, no external fragmentation, page table per process.',
  'TLB (Translation Lookaside Buffer) caches recent page translations — hit ratio directly affects effective access time.',
  'Deadlock 4 conditions: mutual exclusion, hold & wait, no preemption, circular wait. Prevention (break one), Avoidance (Banker’s algorithm / safe state), Detection & Recovery.',
  '⭐ Banker’s algorithm: check if a resource request leaves the system in a SAFE state before granting.',
  'Virtual memory: demand paging, page faults, thrashing (excessive paging) — fix via working set / locality. Page replacement: FIFO (Belady’s anomaly), LRU, Optimal.',
  '📌 Synchronization: critical section problem; semaphores (counting) & mutex (binary). Producer-consumer, readers-writers, dining philosophers.',
  'Filesystems: directories (tree/DAG), allocation (contiguous, linked, indexed), free-space management (bitmap, free list).',
  'RAID levels: RAID 0 (striping, no redundancy), RAID 1 (mirroring), RAID 5 (striping + distributed parity).',
  'Exam tip: always define terms, draw a diagram (state diagram for processes), and state the scheduling formula before computing.',
];

/**
 * Load the sample OS notes into the given subject's notebook.
 * Existing entries are preserved — the demo content is appended as user-sourced
 * notes so `buildNotebookContext` will include them in subsequent answers.
 */
export function loadDemoNotebook(subject: string): void {
  if (typeof window === 'undefined') return;

  const entries: NotebookEntry[] = DEMO_NOTES.map((content, i) => ({
    id: `demo-${i}`,
    content,
    timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    source: 'user',
  }));

  // Preserve any existing notes for this subject, then prepend the demo ones.
  const existing = getNotebook(subject);
  saveNotebook(subject, {
    subject,
    entries: [...entries, ...existing.entries].slice(0, 50),
    updatedAt: new Date().toISOString(),
  });
}
