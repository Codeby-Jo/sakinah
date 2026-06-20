/**
 * Screen — "Is it halal?" company screener. EIM v-redesign (Phase 5, 2026-06-09):
 * the mockup "Screen" pillar promoted to first-class. Wired to the REAL in-house
 * Shariah screener (`fetchShariahScreen` / `searchStocks`, same backend the global
 * /screener uses) — verdict pill + pass/fail screen rows + a synthesized Raya note,
 * with a deep-link into the Ulama scholar-views browser. Ungated (Screen is open);
 * AuthGuard on the shell covers auth. Spec: zaryah-brain/projects/eim-mvp-redesign.md.
 */

import { useState, useRef, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  Check,
  X,
  Warning,
  ArrowsClockwise,
  Scales,
  Eye,
  CaretRight,
  CaretLeft,
} from '@phosphor-icons/react';
import { fetchShariahScreen, searchStocks } from '@/features/chatbot/services/chatbotService';
import type { ShariahScreenResult, RatioResult } from '@/features/chatbot/types/chatbot.types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useRayaPanel } from '../stores/rayaPanel.store';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const STANDARDS = ['AAOIFI', 'TASIS'] as const;
type Standard = (typeof STANDARDS)[number];
const CHIPS = ['Reliance', 'TCS', 'HDFC Bank'];

type RowStatus = 'pass' | 'fail';
type ScreenRow = { status: RowStatus; label: string; desc: string; val: string };

function ratioRow(label: string, r: RatioResult | undefined): ScreenRow {
  if (!r) return { status: 'fail', label, desc: 'No data', val: '—' };
  return {
    status: r.passed ? 'pass' : 'fail',
    label,
    desc: `vs ${r.limit_str} limit`,
    val: r.percent_str,
  };
}

function buildRows(s: ShariahScreenResult): ScreenRow[] {
  return [
    {
      status: s.business_screen_passed ? 'pass' : 'fail',
      label: 'Line of business',
      desc: s.business_reason || (s.business_screen_passed ? 'Permissible activity' : 'Impermissible core business'),
      val: s.business_screen_passed ? 'Permissible' : 'Impermissible',
    },
    ratioRow('Interest-bearing debt', s.debt_ratio),
    ratioRow('Impure (interest) income', s.interest_ratio),
    ratioRow('Liquidity / receivables', s.receivables_ratio),
  ];
}

type Verdict = 'ok' | 'warn' | 'no';
function verdictOf(s: ShariahScreenResult): { v: Verdict; label: string } {
  if (!s.is_compliant) return { v: 'no', label: 'Not compliant' };
  if (s.warnings?.length) return { v: 'warn', label: 'Needs review' };
  return { v: 'ok', label: 'Likely compliant' };
}

function rayaNoteOf(s: ShariahScreenResult): string {
  if (s.issues?.length) return s.issues.join(' ');
  if (s.warnings?.length) return s.warnings.join(' ');
  if (s.is_compliant) {
    return `${s.name}'s core business${s.sector ? ` (${s.sector.toLowerCase()})` : ''} is permissible, and its debt, interest income and receivables all sit within the ${s.standard} thresholds.`;
  }
  return `${s.name} does not pass the ${s.standard} screen — see the flagged rows above for what tips it over.`;
}

export function EimScreenPage() {
  const navigate = useNavigate();
  const openRayaAsk = useRayaPanel((s) => s.openAsk);
  const [query, setQuery] = useState('');
  const [standard, setStandard] = useState<Standard>('AAOIFI');
  const [result, setResult] = useState<ShariahScreenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const lastQ = useRef<string>('');
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((m: string) => {
    setToast(m);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const run = useCallback(
    async (qRaw?: string, std?: Standard) => {
      const q = (qRaw ?? query).trim();
      const useStd = std ?? standard;
      if (!q) return;
      lastQ.current = q;
      setLoading(true);
      setError(null);
      try {
        let symbol = q.toUpperCase();
        try {
          const matches = await searchStocks(q);
          if (matches.length) symbol = matches[0].symbol;
        } catch {
          /* fall back to treating the query as a ticker */
        }
        const res = await fetchShariahScreen(symbol, useStd);
        setResult(res);
      } catch {
        setResult(null);
        setError('Could not screen that company. Try a ticker or name like RELIANCE, TCS, or HDFC Bank.');
      } finally {
        setLoading(false);
      }
    },
    [query, standard],
  );

  const onStandard = (s: Standard) => {
    setStandard(s);
    if (lastQ.current) void run(lastQ.current, s);
  };

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 pt-6 pb-10">
      <button
        onClick={() => navigate('/eim')}
        className="flex items-center gap-2 text-[13px] text-[#8d897c] hover:text-[#F5E8C7] transition-colors mb-4"
      >
        <CaretLeft size={15} weight="bold" /> Back to Home
      </button>

      {/* ── Header ── */}
      <div className="mb-1">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#a98842] font-medium">
          EIM · the conscience layer
        </div>
        <h1
          className="text-[34px] sm:text-[40px] font-medium text-[#F5E8C7] leading-[1.05] mt-1.5"
          style={{ fontFamily: SERIF }}
        >
          Is it halal?
        </h1>
        <p className="text-[13px] text-[#8d897c] mt-1.5 max-w-[58ch] leading-relaxed">
          Screen any company against the standards — then see where the scholars stand.
        </p>
      </div>

      <DisclaimerBanner />

      {/* ── Standard toggle ── */}
      <div className="mt-5 flex items-center gap-2">
        <Scales size={15} className="text-[#a98842]" />
        <span className="text-[11px] uppercase tracking-wider text-[#5a574e]">Standard</span>
        {STANDARDS.map((s) => (
          <button
            key={s}
            onClick={() => onStandard(s)}
            className={[
              'px-3 py-1 rounded-lg text-[12px] font-medium transition-colors',
              standard === s
                ? 'bg-[#D4A853] text-[#1a1407]'
                : 'text-[#8d897c] border border-[#F5E8C7]/[0.11] hover:text-[#F5E8C7]',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Screener input ── */}
      <div className="mt-3 flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-2xl bg-[#F5E8C7]/[0.04] border border-[#F5E8C7]/[0.11] focus-within:border-[rgba(212,168,83,0.45)] focus-within:shadow-[0_0_24px_rgba(212,168,83,0.16)] transition-all">
        <MagnifyingGlass size={18} className="text-[#8d897c] shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void run();
          }}
          placeholder="Enter a company or ticker — e.g. Reliance, TCS, a bank…"
          className="flex-1 bg-transparent outline-none text-[15px] text-[#F5E8C7] placeholder:text-[#5a574e] py-3"
        />
        <button
          onClick={() => void run()}
          disabled={loading}
          className="bg-[#D4A853] hover:bg-[#e2b863] disabled:opacity-60 text-[#1a1407] font-semibold text-[13.5px] px-5 py-[11px] rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <ArrowsClockwise size={15} className="animate-spin" /> : null}
          {loading ? 'Screening' : 'Screen'}
        </button>
      </div>

      {/* ── Example chips ── */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setQuery(c);
              void run(c);
            }}
            className="text-[12.5px] px-3.5 py-1.5 rounded-full border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.16] transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Verdict / states ── */}
      <div className="mt-6">
        {error && (
          <div className="rounded-2xl border border-[rgba(176,74,85,0.3)] bg-[rgba(176,74,85,0.08)] p-4 text-[13px] text-[#d79aa1]">
            {error}
          </div>
        )}

        {!result && !error && (
          <ScholarNote>
            Screening here is educational and follows common standards (AAOIFI / TASIS: line of
            business, interest-bearing debt, and impure-income thresholds). Scholars differ on the
            exact limits — EIM shows the spread rather than a single ruling. Try a chip above to see
            a sample screen.
          </ScholarNote>
        )}

        {result && (
          <VerdictCard
            result={result}
            navigate={navigate}
            showToast={showToast}
            askWhy={() =>
              openRayaAsk(
                `Why is ${result.name || result.symbol} screened "${verdictOf(result).label}" under ${result.standard}? Walk me through the line of business, debt, interest income and receivables.`,
              )
            }
          />
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-[84px] lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#0c0c10] border border-[rgba(212,168,83,0.3)] text-[13.5px] text-[#F5E8C7] shadow-[0_14px_40px_rgba(0,0,0,0.5)]">
          <Check size={16} className="text-[#2A9D6F]" weight="bold" />
          {toast}
        </div>
      )}
    </div>
  );
}

function VerdictCard({
  result,
  navigate,
  showToast,
  askWhy,
}: {
  result: ShariahScreenResult;
  navigate: ReturnType<typeof useNavigate>;
  showToast: (m: string) => void;
  askWhy: () => void;
}) {
  const { v, label } = verdictOf(result);
  const rows = buildRows(result);
  const pillCls =
    v === 'ok'
      ? 'bg-[rgba(42,157,111,0.14)] text-[#5bc093] border-[rgba(42,157,111,0.3)]'
      : v === 'warn'
        ? 'bg-[rgba(212,168,83,0.13)] text-[#D4A853] border-[rgba(212,168,83,0.3)]'
        : 'bg-[rgba(176,74,85,0.14)] text-[#b04a55] border-[rgba(176,74,85,0.3)]';

  return (
    <>
      <div className="rounded-[18px] border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] overflow-hidden">
        {/* Top */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-[#F5E8C7]/[0.07]">
          <div className="flex-1 min-w-0">
            <div className="text-[24px] font-medium text-[#F5E8C7] truncate" style={{ fontFamily: SERIF }}>
              {result.name || result.symbol}
            </div>
            <div className="text-[12.5px] text-[#8d897c] mt-0.5 truncate">
              {[result.sector, result.industry].filter(Boolean).join(' · ') || result.symbol}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium shrink-0 ${pillCls}`}>
            {v === 'ok' ? <Check size={15} weight="bold" /> : v === 'no' ? <X size={15} weight="bold" /> : <Warning size={15} weight="bold" />}
            {label}
          </div>
        </div>

        {/* Rows */}
        <div className="px-6 py-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3.5 py-3 border-b border-[#F5E8C7]/[0.07] last:border-0">
              <div
                className={[
                  'w-[26px] h-[26px] rounded-lg grid place-items-center shrink-0',
                  r.status === 'pass'
                    ? 'bg-[rgba(42,157,111,0.14)] text-[#5bc093]'
                    : 'bg-[rgba(176,74,85,0.14)] text-[#b04a55]',
                ].join(' ')}
              >
                {r.status === 'pass' ? <Check size={15} weight="bold" /> : <X size={15} weight="bold" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-[#F5E8C7]">{r.label}</div>
                <div className="text-[12px] text-[#5a574e] mt-0.5">{r.desc}</div>
              </div>
              <div className="text-[13px] text-[#8d897c] tabular-nums shrink-0">{r.val}</div>
            </div>
          ))}
        </div>

        {/* Raya note */}
        <div className="px-6 pb-5">
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-[#F5E8C7]/[0.02] border border-[#F5E8C7]/[0.07] text-[13px] text-[#8d897c] leading-relaxed">
            <Scales size={16} className="text-[#5bc093] shrink-0 mt-0.5" />
            <div>
              <b className="text-[#D4A853] font-medium">Raya:</b> {rayaNoteOf(result)}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2.5 px-6 py-4 border-t border-[#F5E8C7]/[0.07] bg-white/[0.012]">
          <button
            onClick={askWhy}
            className="flex-1 text-center py-2.5 rounded-xl border border-[rgba(212,168,83,0.3)] text-[13px] text-[#D4A853] hover:bg-[rgba(212,168,83,0.1)] transition-colors"
          >
            Ask Raya why
          </button>
          <button
            onClick={() => navigate('/eim/ulama')}
            className="flex-1 text-center py-2.5 rounded-xl border border-[#F5E8C7]/[0.07] text-[13px] text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.16] transition-colors"
          >
            Scholar views
          </button>
          <button
            onClick={() => showToast('Added to simulated watchlist')}
            className="flex-1 text-center py-2.5 rounded-xl border border-[#F5E8C7]/[0.07] text-[13px] text-[#8d897c] hover:text-[#F5E8C7] hover:border-[#F5E8C7]/[0.16] transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={14} /> Watch (sim)
          </button>
        </div>
      </div>

      <div className="mt-4">
        <ScholarNote>
          Thresholds shown are common screening conventions and scholars differ on the exact figures.
          This is educational only — confirm with a qualified scholar and a current screening source
          before acting.
        </ScholarNote>
      </div>
    </>
  );
}

function ScholarNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 px-4 py-3.5 rounded-xl bg-[#F5E8C7]/[0.02] border border-[#F5E8C7]/[0.07] text-[13px] text-[#8d897c] leading-relaxed">
      <CaretRight size={16} className="text-[#a98842] shrink-0 mt-0.5 rotate-90" />
      <div>{children}</div>
    </div>
  );
}

export default EimScreenPage;
