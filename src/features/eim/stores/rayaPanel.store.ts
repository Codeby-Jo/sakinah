/**
 * Raya panel store — controls the EIM-scoped Raya mentor slide-over.
 *
 * Any EIM surface (shell CTA, Home ask-bar, a Screen verdict, a lesson) opens
 * Raya via `openAsk(seed?)`. The panel itself carries the three analysis lenses
 * (Raya · Value Investor · Islamic Investor) — see EimRayaPanel.
 */

import { create } from 'zustand';

interface RayaPanelState {
  open: boolean;
  /** Seed question, auto-run on open when non-empty. */
  seed: string;
  /** Bumped on every openAsk so the panel re-seeds even with the same text. */
  nonce: number;
  openAsk: (seed?: string) => void;
  close: () => void;
}

export const useRayaPanel = create<RayaPanelState>((set) => ({
  open: false,
  seed: '',
  nonce: 0,
  openAsk: (seed = '') => set((s) => ({ open: true, seed, nonce: s.nonce + 1 })),
  close: () => set({ open: false }),
}));
