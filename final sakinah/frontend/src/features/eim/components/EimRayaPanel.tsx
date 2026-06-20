/**
 * EimRayaPanel — the EIM-scoped Raya mentor slide-over.
 *
 * Wired to the real Raya backend via `streamMessage` (POST /chat/stream). The
 * panel carries THREE always-visible analysis lenses — Raya · Value Investor ·
 * Islamic Investor (the prior persona trio; "Raya" replaces the old "Compass").
 * Each lens re-frames the same question and the answer is streamed + cached per
 * lens, so switching lenses is instant once fetched. The Islamic Investor lens
 * is explicitly multi-madhhab (classical four schools + contemporary/AAOIFI),
 * never a single-madhhab ruling, and never a fatwa.
 *
 * Footer: Save (persists the Q&A to the local library) + Screen + Simulate.
 * No Share. Persona analysis + chat history remain reachable as links.
 * Spec: zaryah-brain/projects/eim-mvp-redesign.md.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Info,
  BookmarkSimple,
  Scales,
  ChartLineUp,
  PaperPlaneRight,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { streamMessage } from '@/features/chatbot/services/chatbotService';
import type { ChatRequest } from '@/features/chatbot/types/chatbot.types';
import { useRayaPanel } from '../stores/rayaPanel.store';
import { saveRayaAnswer } from '../services/rayaLibrary';
import { Markdownish } from './Markdownish';

const SERIF = "'Cormorant Garamond', Georgia, serif";
type Lens = 'raya' | 'value' | 'islamic';
const LENSES: { key: Lens; label: string; desc: string }[] = [
  {
    key: 'raya',
    label: 'Raya',
    desc: 'Your default mentor — warm, plain-language guidance grounded in your situation. No particular school; she reaches for whichever angle helps.',
  },
  {
    key: 'value',
    label: 'Value Investor',
    desc: 'Reads your question like a long-term value buyer: durable moats, margin of safety, intrinsic value vs. price, business quality over hype (the Graham/Buffett tradition — framework, not advice).',
  },
  {
    key: 'islamic',
    label: 'Islamic Investor',
    desc: 'Reads it through Shariah compliance — the classical four madhāhib AND the contemporary/AAOIFI view, showing where scholars agree and differ. Multi-madhhab, never a fatwa.',
  },
];

// Each lens re-frames the same question. "raya" is the default warm voice
// (no framing). The Islamic lens is deliberately multi-madhhab.
function framePrompt(lens: Lens, q: string): string {
  switch (lens) {
    case 'value':
      return `Answer through a value-investor lens — durable competitive moats, margin of safety, intrinsic value and long-term ownership (the Graham/Buffett tradition, described as frameworks, not personal advice):\n\n${q}`;
    case 'islamic':
      return `Answer through an Islamic-finance lens. Show the scholarly spread — the classical four-madhhab view AND the contemporary / AAOIFI view — and state clearly where scholars agree and where they differ. Do NOT restrict the answer to a single madhhab, and do not issue a fatwa; this is educational:\n\n${q}`;
    case 'raya':
    default:
      return q;
  }
}

type Exchange = { text: string; streaming: boolean; error: string | null; loaded: boolean; suggestions: string[] };
const EMPTY: Exchange = { text: '', streaming: false, error: null, loaded: false, suggestions: [] };

// Starter prompts shown before the first question (clickable).
const STARTERS = ['Is Tesla halal?', 'Sukuk vs bonds?', 'How do I start investing?', 'Zakat on my stocks?'];

export function EimRayaPanel() {
  const navigate = useNavigate();
  const { open, seed, nonce, close } = useRayaPanel();
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.displayName);

  const [question, setQuestion] = useState('');
  const [input, setInput] = useState('');
  const [lens, setLens] = useState<Lens>('raya');
  const [showInfo, setShowInfo] = useState(false);
  // Per-lens answer cache for the current question.
  const [answers, setAnswers] = useState<Record<Lens, Exchange>>({
    raya: EMPTY,
    value: EMPTY,
    islamic: EMPTY,
  });
  const [toast, setToast] = useState<string | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sessionId = useRef(`eim-raya-${userId ?? 'anon'}`);

  const showToast = useCallback((m: string) => {
    setToast(m);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const patchLens = useCallback((l: Lens, patch: Partial<Exchange>) => {
    setAnswers((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));
  }, []);

  // Stream one lens's framed answer for a question.
  const streamLens = useCallback(
    async (l: Lens, q: string) => {
      if (!userId) {
        patchLens(l, { error: 'Please sign in to ask Raya.', streaming: false, loaded: true });
        return;
      }
      patchLens(l, { text: '', streaming: true, error: null, loaded: true });
      const req: ChatRequest = {
        user_id: userId,
        session_id: sessionId.current,
        message: framePrompt(l, q),
        user_name: userName,
        context: { surface: 'eim_raya_panel', lens: l },
      };
      let acc = '';
      try {
        await streamMessage(
          req,
          (chunk) => { acc += chunk; patchLens(l, { text: acc, streaming: true }); },
          (event) => patchLens(l, {
            text: acc,
            streaming: false,
            suggestions: Array.isArray(event.suggestions) ? event.suggestions.slice(0, 4) : [],
          }),
        );
      } catch (e) {
        patchLens(l, {
          streaming: false,
          error: e instanceof Error ? e.message : 'Raya could not answer right now. Try again.',
        });
      }
    },
    [userId, userName, patchLens],
  );

  // Ask a fresh question: reset all lens caches, run the active lens.
  const ask = useCallback(
    (q: string, activeLens: Lens) => {
      const query = q.trim();
      if (!query) return;
      setQuestion(query);
      setAnswers({ raya: EMPTY, value: EMPTY, islamic: EMPTY });
      void streamLens(activeLens, query);
    },
    [streamLens],
  );

  // On open (or re-open via nonce): reset and run the seed under the Raya lens.
  useEffect(() => {
    if (!open) return;
    setLens('raya');
    setInput('');
    setQuestion('');
    setAnswers({ raya: EMPTY, value: EMPTY, islamic: EMPTY });
    if (seed.trim()) ask(seed, 'raya');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seed once per open/nonce
  }, [open, nonce]);

  // Switching lens: lazily fetch that lens for the current question.
  const selectLens = (l: Lens) => {
    setLens(l);
    if (question && !answers[l].loaded) void streamLens(l, question);
  };

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const goto = (path: string) => { close(); navigate(path); };
  const current = answers[lens];

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close Raya"
        onClick={close}
        tabIndex={open ? 0 : -1}
        className={[
          'fixed inset-0 z-[60] bg-[#020204]/60 backdrop-blur-[3px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Panel */}
      <aside
        className={[
          'fixed top-0 right-0 bottom-0 z-[61] w-[540px] max-w-[92vw] flex flex-col',
          'bg-gradient-to-b from-[#0c0c10] to-[#08080b] border-l border-[#F5E8C7]/[0.11]',
          'shadow-[-30px_0_80px_rgba(0,0,0,0.5)] transition-transform duration-[400ms]',
          open ? 'translate-x-0' : 'translate-x-[102%]',
        ].join(' ')}
        style={{ transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)' }}
      >
        {/* Top */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[#F5E8C7]/[0.07]">
          <div className="w-9 h-9 rounded-full shrink-0 bg-[radial-gradient(circle_at_38%_32%,#f3d488,#D4A853_55%,#9a7424)] shadow-[0_0_22px_rgba(212,168,83,0.16)]" />
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-[#a98842]">EIM mentor</div>
            <div className="text-[20px] font-medium text-[#F5E8C7] leading-tight" style={{ fontFamily: SERIF }}>
              Ask Raya
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="w-9 h-9 rounded-[9px] border border-[#F5E8C7]/[0.07] grid place-items-center text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.16] transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Lens tabs — always visible, with an info toggle. */}
        <div className="flex items-end gap-1 px-5 pt-3 border-b border-[#F5E8C7]/[0.07]">
          {LENSES.map((l) => (
            <button
              key={l.key}
              onClick={() => selectLens(l.key)}
              className={[
                'px-3.5 py-2.5 text-[13px] rounded-t-lg border-b-2 transition-colors whitespace-nowrap',
                lens === l.key
                  ? 'text-[#D4A853] border-[#D4A853]'
                  : 'text-[#8d897c] border-transparent hover:text-[#F5E8C7]',
              ].join(' ')}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => setShowInfo((v) => !v)}
            aria-label="What do these lenses mean?"
            aria-expanded={showInfo}
            className={[
              'ml-auto mb-1.5 w-7 h-7 rounded-lg grid place-items-center transition-colors',
              showInfo ? 'text-[#D4A853] bg-[rgba(212,168,83,0.1)]' : 'text-[#5a574e] hover:text-[#F5E8C7]',
            ].join(' ')}
          >
            <Info size={16} weight={showInfo ? 'fill' : 'regular'} />
          </button>
        </div>

        {/* Active-lens descriptor — passively tells the user what this lens means. */}
        <div className="px-5 py-2.5 border-b border-[#F5E8C7]/[0.05] text-[11.5px] text-[#8d897c] leading-snug">
          <b className="text-[#C9C0A8] font-medium">{LENSES.find((l) => l.key === lens)!.label}:</b>{' '}
          {LENSES.find((l) => l.key === lens)!.desc}
        </div>

        {/* Info toggle — all three side by side so the differences are clear. */}
        {showInfo && (
          <div className="px-5 py-3.5 border-b border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.015] space-y-2.5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#a98842] font-medium">
              Three lenses · same question, three readings
            </div>
            {LENSES.map((l) => (
              <div key={l.key} className="text-[12px] text-[#8d897c] leading-snug">
                <b className="text-[#F5E8C7] font-medium">{l.label}</b> — {l.desc}
              </div>
            ))}
            <div className="text-[10.5px] text-[#5a574e] italic pt-0.5">
              Switch tabs to re-read the same question through each lens.
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {question && (
            <div className="mb-4 text-[15px] text-[#F5E8C7] italic" style={{ fontFamily: SERIF }}>
              “{question}”
            </div>
          )}

          {current.error ? (
            <div className="rounded-xl border border-[rgba(176,74,85,0.3)] bg-[rgba(176,74,85,0.08)] p-3.5 text-[13px] text-[#d79aa1]">
              {current.error}
            </div>
          ) : current.text ? (
            <div className="text-[14.5px] text-[#d6d1c4] leading-[1.72] font-light">
              <Markdownish text={current.text} />
              {current.streaming && <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-[#D4A853] animate-pulse" />}
            </div>
          ) : current.streaming || (question && !current.loaded) ? (
            <div className="flex items-center gap-2 text-[13px] text-[#8d897c]">
              <ArrowsClockwise size={15} className="animate-spin text-[#D4A853]" />
              Raya is thinking…
            </div>
          ) : (
            <div className="text-[13px] text-[#8d897c] leading-relaxed">
              Ask about halal investing — “is Tesla halal?”, “sukuk vs bonds?”, “how do I start?”.
              Pick a lens above to change the perspective, or tap{' '}
              <Info size={13} weight="fill" className="inline align-[-2px] text-[#a98842]" /> to see how they
              differ.
            </div>
          )}

          {/* Suggestion chips — starters before the first question; backend
              follow-ups after an answer. Clicking asks under the current lens. */}
          {!current.streaming &&
            (current.text ? current.suggestions.length > 0 : !question && !current.error) && (
              <div className="mt-4">
                {current.text && (
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#5a574e] mb-2">
                    Follow up
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {(current.text ? current.suggestions : STARTERS).map((s) => (
                    <button
                      key={s}
                      onClick={() => { ask(s, lens); }}
                      className="text-left text-[12px] px-3 py-1.5 rounded-full border border-[rgba(212,168,83,0.22)] bg-[rgba(212,168,83,0.06)] text-[#D4A853] hover:bg-[rgba(212,168,83,0.12)] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Persona analysis / history — kept reachable via Raya. */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => goto('/eim/mentor')}
              className="text-[11.5px] px-3 py-1.5 rounded-full border border-[#F5E8C7]/[0.07] text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.16] transition-colors"
            >
              Run a persona analysis
            </button>
            <button
              onClick={() => goto('/eim/history')}
              className="text-[11.5px] px-3 py-1.5 rounded-full border border-[#F5E8C7]/[0.07] text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.16] transition-colors"
            >
              Chat history
            </button>
          </div>
        </div>

        {/* Ask input */}
        <div className="px-5 py-3 border-t border-[#F5E8C7]/[0.07]">
          <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-2xl bg-[#F5E8C7]/[0.04] border border-[#F5E8C7]/[0.11] focus-within:border-[rgba(212,168,83,0.45)] transition-colors">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !current.streaming) { ask(input, lens); setInput(''); }
              }}
              placeholder="Ask Raya…"
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#F5E8C7] placeholder:text-[#5a574e] py-2"
            />
            <button
              onClick={() => { ask(input, lens); setInput(''); }}
              disabled={current.streaming || !input.trim()}
              aria-label="Send"
              className="w-9 h-9 rounded-xl grid place-items-center bg-[#D4A853] hover:bg-[#e2b863] disabled:opacity-50 text-[#1a1407] transition-colors"
            >
              <PaperPlaneRight size={16} weight="fill" />
            </button>
          </div>
        </div>

        {/* Footer actions — Save · Screen · Simulate (no Share) */}
        <div className="flex gap-1.5 px-5 py-3 border-t border-[#F5E8C7]/[0.07] bg-white/[0.012]">
          <FootBtn
            icon={<BookmarkSimple size={17} />}
            label="Save"
            gold
            onClick={() => {
              if (!question || !current.text || current.streaming) {
                showToast('Nothing to save yet');
                return;
              }
              const ok = saveRayaAnswer({ lens, lensLabel: LENSES.find((l) => l.key === lens)!.label, question, answer: current.text });
              showToast(ok ? 'Saved to your library' : 'Already in your library');
            }}
          />
          <FootBtn icon={<Scales size={17} />} label="Screen" onClick={() => goto('/eim/screen')} />
          <FootBtn icon={<ChartLineUp size={17} />} label="Simulate" onClick={() => goto('/eim/practice')} />
        </div>

        {toast && (
          <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-[#0c0c10] border border-[rgba(212,168,83,0.3)] text-[13px] text-[#F5E8C7] shadow-[0_14px_40px_rgba(0,0,0,0.5)] whitespace-nowrap">
            {toast}
          </div>
        )}
      </aside>
    </>
  );
}

function FootBtn({ icon, label, onClick, gold }: { icon: ReactNode; label: string; onClick: () => void; gold?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-transparent transition-colors',
        gold
          ? 'text-[#8d897c] hover:text-[#D4A853] hover:border-[rgba(212,168,83,0.3)] hover:bg-[#F5E8C7]/[0.02]'
          : 'text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.07] hover:bg-[#F5E8C7]/[0.02]',
      ].join(' ')}
    >
      {icon}
      <span className="text-[10.5px]">{label}</span>
    </button>
  );
}

/** Floating Raya orb — desktop only (mobile uses the bottom "Raya" tab). */
export function EimRayaOrb() {
  const openAsk = useRayaPanel((s) => s.openAsk);
  const open = useRayaPanel((s) => s.open);
  if (open) return null;
  return (
    <button
      onClick={() => openAsk()}
      aria-label="Ask Raya"
      title="Ask Raya"
      className="hidden lg:block fixed bottom-7 right-7 z-[55] w-[58px] h-[58px] rounded-full bg-[radial-gradient(circle_at_38%_30%,#f6db8f,#D4A853_52%,#8f6c20)] shadow-[0_0_0_1px_rgba(212,168,83,0.4),0_0_30px_rgba(212,168,83,0.16)] hover:scale-105 transition-transform"
    />
  );
}

export default EimRayaPanel;
