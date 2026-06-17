/**
 * Raya saved-answers library — the integration behind the panel's "Save".
 *
 * Persists saved Q&A locally (per-device) so saved mentor answers survive
 * reloads and can be listed later. Deliberately localStorage-backed for v0; a
 * per-user backend store is the future step (see eim-mvp-redesign.md). Kept
 * tiny and defensive — never throws into the UI.
 */

const KEY = 'eim_raya_saved';
const MAX = 100;

export interface SavedRayaAnswer {
  id: string;
  lens: string;
  lensLabel: string;
  question: string;
  answer: string;
  savedAt: number;
}

export function getRayaLibrary(): SavedRayaAnswer[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as SavedRayaAnswer[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Save one Q&A. Returns false if an identical (lens+question) entry already
 *  exists (so the caller can say "already saved"). */
export function saveRayaAnswer(item: {
  lens: string;
  lensLabel: string;
  question: string;
  answer: string;
}): boolean {
  try {
    const lib = getRayaLibrary();
    const dup = lib.some((e) => e.lens === item.lens && e.question === item.question);
    if (dup) return false;
    const entry: SavedRayaAnswer = {
      // Stable-ish id without Date.now collisions across rapid saves.
      id: `${item.lens}:${item.question.slice(0, 40)}:${lib.length}`,
      ...item,
      savedAt: Date.now(),
    };
    const next = [entry, ...lib].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function removeRayaAnswer(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(getRayaLibrary().filter((e) => e.id !== id)));
  } catch {
    /* ignore */
  }
}
