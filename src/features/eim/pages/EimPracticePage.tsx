/**
 * Practice — the simulation hub. EIM v-redesign (Phase 4, 2026-06-09): the
 * mockup "Practice" pillar landing — a grid of the six sim tools. The hub
 * itself is ungated (browseable); each tool route keeps its own DeepKycGuard,
 * so tapping a tool is where the KYC gate (if any) applies. Renders inside
 * EimShell. Spec: zaryah-brain/projects/eim-mvp-redesign.md.
 */

import { useNavigate } from 'react-router-dom';
import {
  Rewind,
  Compass,
  ChartLineUp,
  ChartBar,
  ChartLine,
  TrendUp,
  CaretLeft,
} from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { CANDLESTICKS } from '../data/knowledge-bank/candlesticks';

const SERIF = "'Cormorant Garamond', Georgia, serif";

type Tool = {
  icon: typeof Rewind;
  title: string;
  desc: string;
  path: string;
  accent: string;
};

const TOOLS: Tool[] = [
  {
    icon: Rewind,
    title: 'Time-Machine Simulator',
    desc: 'Replay real market history, decision by decision. See how your choices would have played out — without risking a thing.',
    path: '/eim/time-machine',
    accent: '#D4A853',
  },
  {
    icon: Compass,
    title: 'Scenario Lab',
    desc: 'Live a market crisis with branching outcomes. Panic-sell or hold? Watch where each path leads, then debrief with Raya.',
    path: '/eim/scenario-lab',
    accent: '#E8A0C0',
  },
  {
    icon: ChartLineUp,
    title: 'Pattern Lab',
    desc: 'Spot patterns on real charts — before, then after. Train your eye on what actually happened, not hindsight stories.',
    path: '/eim/pattern-lab',
    accent: '#5FC986',
  },
  {
    icon: ChartBar,
    title: 'Candlestick Library',
    desc: `${CANDLESTICKS.length} patterns, one new each month. Learn what the market is saying — and what it isn't.`,
    path: '/eim/candlesticks',
    accent: '#38BDF8',
  },
  {
    icon: ChartLine,
    title: 'Strategy Comparator',
    desc: 'Lump-sum vs. DCA vs. 60/40 — run them side by side on the same history and feel the difference, not just read it.',
    path: '/eim/strategy-comparator',
    accent: '#E8C97A',
  },
  {
    icon: TrendUp,
    title: 'Projection Engine',
    desc: 'A range of possible futures and the odds of reaching a goal — clearly framed as a range, never a forecast.',
    path: '/eim/projection',
    accent: '#5bc093',
  },
];

export function EimPracticePage() {
  const navigate = useNavigate();

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
          EIM · the sandbox
        </div>
        <h1
          className="text-[34px] sm:text-[40px] font-medium text-[#F5E8C7] leading-[1.05] mt-1.5"
          style={{ fontFamily: SERIF }}
        >
          Practice
        </h1>
        <p className="text-[13px] text-[#8d897c] mt-1.5 max-w-[58ch] leading-relaxed">
          Practice with history — not your savings. Every rupee here is paper.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className="text-left rounded-2xl border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] hover:border-[#F5E8C7]/[0.16] hover:-translate-y-0.5 transition-all p-5"
            >
              <div
                className="w-11 h-11 rounded-xl grid place-items-center mb-4"
                style={{ background: `${t.accent}1f`, color: t.accent }}
              >
                <Icon size={21} />
              </div>
              <div className="text-[21px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                {t.title}
              </div>
              <div className="text-[13px] text-[#8d897c] mt-1.5 leading-relaxed">{t.desc}</div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[12px] text-[#5a574e] mt-10 pt-6 border-t border-[#F5E8C7]/[0.07]">
        All simulations use historical or modelled data for learning. Past performance is not
        indicative of future results.
      </p>
    </div>
  );
}

export default EimPracticePage;
