/**
 * Chat History — localStorage-backed utility.
 * Persists recent chats across sessions and broadcasts changes
 * via the `nk-chat-history-change` custom event for real-time sidebar sync.
 */

export interface ChatHistoryItem {
  id: string;
  title: string;
  subject: string;
  unit: string;
  mode: 'sprint' | 'deep-dive';
  timestamp: number; // epoch ms
}

const STORAGE_KEY = 'nk-chat-history';
const MAX_ITEMS = 30;

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nk-chat-history-change'));
  }
}

export function getChatHistory(): ChatHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatHistoryItem[];
  } catch {
    return [];
  }
}

/**
 * Save / upsert a chat session.
 * If an item with the same id exists it is updated in-place; otherwise
 * it is prepended so the newest always comes first.
 */
export function saveChatSession(item: ChatHistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getChatHistory();
    const existingIdx = list.findIndex((c) => c.id === item.id);
    let updated: ChatHistoryItem[];
    if (existingIdx >= 0) {
      // update title / timestamp if the session already exists
      updated = list.map((c, i) => (i === existingIdx ? { ...c, ...item } : c));
    } else {
      updated = [item, ...list];
    }
    // Keep most recent MAX_ITEMS
    if (updated.length > MAX_ITEMS) updated = updated.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatch();
  } catch {
    // quota exceeded – silently ignore
  }
}

export function deleteChatSession(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = getChatHistory().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatch();
  } catch {
    /* empty */
  }
}

export function clearChatHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  dispatch();
}

/** Friendly relative timestamp for display */
export function formatChatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
