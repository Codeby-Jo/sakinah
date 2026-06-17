/**
 * EimShell — the full-screen "mini-app" layout for EIM (Ethical Investment Mentor).
 *
 * EIM v-redesign (Phase 1, 2026-06-09): per the locked decisions in
 * `zaryah-brain/projects/eim-mvp-redesign.md`, EIM moves OUT of the global
 * MainLayout and becomes its own full-screen mini-app modelled on the Mizan
 * mockup. This shell intentionally HIDES the global topbar / sidebar drawer /
 * Raya orb — inside EIM you navigate via this shell's own chrome and exit
 * explicitly with the "Exit" control.
 *
 * Responsive: a left rail on desktop (≥lg), a bottom tab bar on mobile. Same
 * screens underneath. Reuses the app-wide RayaStarCanvas + gold/emerald washes
 * so the cosmic theme is continuous with the rest of the super-app.
 *
 * Identity note: we keep the EIM name (NOT "Mizan") and all `/eim` routes — the
 * mockup is a design reference, not a rebrand.
 */

import { useCallback, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  GraduationCap,
  ChartLineUp,
  Scales,
  Sparkle,
  SignOut,
  X,
} from '@phosphor-icons/react';
import { RayaStarCanvas } from '@/features/raya-home/components/RayaStarCanvas';
import { EimRayaPanel, EimRayaOrb } from './EimRayaPanel';
import { useRayaPanel } from '../stores/rayaPanel.store';
import { useEimStore } from '../stores/eim.store';

type NavItem = {
  key: string;
  label: string;
  path: string;
  icon: typeof House;
  /** Path prefixes that should light this pillar as active. */
  match: string[];
};

// The three pillars + the home hub. "Ask Raya" is a separate CTA (the lens panel
// lands in Phase 6 — for now it deep-links to the existing Mentor surface).
const NAV: NavItem[] = [
  { key: 'home', label: 'Home', path: '/eim', icon: House, match: [] },
  {
    key: 'learn',
    label: 'Learn',
    path: '/eim/library',
    icon: GraduationCap,
    match: ['/eim/library', '/eim/lesson', '/eim/playbook', '/eim/scholar-faqs'],
  },
  {
    key: 'practice',
    label: 'Practice',
    path: '/eim/practice',
    icon: ChartLineUp,
    match: [
      '/eim/practice',
      '/eim/simulator',
      '/eim/portfolio',
      '/eim/time-machine',
      '/eim/strategy-comparator',
      '/eim/scenario-lab',
      '/eim/projection',
      '/eim/pattern-lab',
      '/eim/candlesticks',
    ],
  },
  {
    key: 'screen',
    label: 'Screen',
    path: '/eim/screen',
    icon: Scales,
    match: ['/eim/screen', '/eim/ulama'],
  },
];

export function EimShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const openRayaAsk = useRayaPanel((s) => s.openAsk);

  const isActive = useCallback(
    (item: NavItem) => {
      if (item.key === 'home') return pathname === '/eim';
      return item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`) || pathname.startsWith(m));
    },
    [pathname],
  );

  // Ask Raya — opens the EIM-scoped Raya mentor panel (free-form ask).
  const openRaya = useCallback(() => openRayaAsk(), [openRayaAsk]);
  const exitEim = useCallback(() => navigate('/'), [navigate]);

  // First-run "you can exit here" coachmark. EIM is a full-screen mini-app that
  // hides the global Zaryah+ chrome, so first-timers don't realise they must
  // Exit to return. Show the hint once, then persist the dismissal.
  const markExitHintSeen = useEimStore((s) => s.markExitHintSeen);
  const [showExitHint, setShowExitHint] = useState(
    () => !useEimStore.getState().exitHintSeen,
  );
  const dismissExitHint = useCallback(() => {
    setShowExitHint(false);
    markExitHintSeen();
  }, [markExitHintSeen]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#06080D] text-[#F5E8C7] font-sans">
      {/* Cosmic atmosphere — same starfield + washes as the global shell. */}
      <RayaStarCanvas />
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 8%, rgba(212,168,83,0.10), transparent 60%),' +
            'radial-gradient(ellipse 60% 60% at 92% 88%, rgba(42,157,111,0.09), transparent 65%),' +
            'radial-gradient(ellipse 50% 50% at 6% 92%, rgba(212,168,83,0.05), transparent 70%)',
        }}
      />

      {/* ── Desktop left rail (≥lg) ─────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[248px] z-30 flex-col gap-1.5 px-4 pt-6 pb-4 border-r border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.008] backdrop-blur-[6px]">
        {/* Brand */}
        <button
          onClick={() => navigate('/eim')}
          className="flex items-baseline gap-2 px-2.5 pt-1.5 pb-1 text-left"
        >
          <span
            className="text-[26px] font-medium text-[#F5E8C7]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            EIM
          </span>
          <span className="font-arabic text-[14px] text-[#4A4639]">ٱلْمِيزَان</span>
        </button>
        <div className="px-2.5 pb-5 text-[11px] tracking-[0.16em] uppercase text-[#4A4639]">
          Ethical Investment Mentor · Zaryah+
        </div>

        <div className="px-2.5 pb-1.5 text-[10.5px] tracking-[0.18em] uppercase text-[#4A4639]">
          Portal
        </div>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={[
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] transition-colors text-left',
                active
                  ? 'text-[#D4A853] bg-gradient-to-r from-[rgba(212,168,83,0.12)] to-[rgba(212,168,83,0.02)]'
                  : 'text-[#C9C0A8] hover:text-[#F5E8C7] hover:bg-[#F5E8C7]/[0.04]',
              ].join(' ')}
            >
              {active && (
                <span className="absolute left-0 top-[9px] bottom-[9px] w-[2.5px] rounded bg-[#D4A853]" />
              )}
              <Icon size={18} weight={active ? 'fill' : 'regular'} />
              {item.label}
            </button>
          );
        })}

        {/* Ask Raya CTA */}
        <button
          onClick={openRaya}
          className="mt-2 flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-[rgba(212,168,83,0.22)] bg-gradient-to-br from-[rgba(212,168,83,0.14)] to-[rgba(212,168,83,0.04)] hover:border-[rgba(212,168,83,0.4)] hover:shadow-[0_0_24px_rgba(212,168,83,0.16)] transition-all text-left"
        >
          <span className="w-2 h-2 rounded-full bg-[#D4A853] shadow-[0_0_10px_#D4A853]" />
          <span>
            <span className="block text-[14px] font-medium text-[#D4A853]">Ask Raya</span>
            <span className="block text-[11px] text-[#C9C0A8]">Your halal money mentor</span>
          </span>
        </button>

        {/* Foot — exit + status */}
        <div className="mt-auto pt-3.5 border-t border-[#F5E8C7]/[0.07] space-y-2.5">
          <button
            onClick={exitEim}
            className={[
              'flex items-center gap-2.5 px-2.5 py-1 -mx-0.5 rounded-lg text-[13px] transition-colors',
              showExitHint
                ? 'text-[#D4A853] bg-[rgba(212,168,83,0.10)]'
                : 'text-[#7A7363] hover:text-[#F5E8C7]',
            ].join(' ')}
          >
            <SignOut size={16} weight="bold" />
            Exit to Zaryah+
          </button>
          <div className="flex items-center gap-2 px-2.5 text-[12.5px] text-[#C9C0A8]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#2A9D6F] shadow-[0_0_8px_#2A9D6F] animate-pulse" />
            Raya is awake
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar (<lg) — brand + exit ─────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-[54px] z-30 flex items-center justify-between px-4 border-b border-[#F5E8C7]/[0.07] bg-[#06080D]/85 backdrop-blur-[14px]">
        <button onClick={() => navigate('/eim')} className="flex items-baseline gap-2">
          <span
            className="text-[21px] font-medium text-[#F5E8C7]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            EIM
          </span>
          <span className="font-arabic text-[12px] text-[#4A4639]">ٱلْمِيزَان</span>
        </button>
        <button
          onClick={exitEim}
          aria-label="Exit to Zaryah+"
          className={[
            'flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12.5px] font-medium transition-colors',
            showExitHint
              ? 'text-[#D4A853] border border-[#D4A853]/55 bg-[rgba(212,168,83,0.10)] shadow-[0_0_18px_rgba(212,168,83,0.22)]'
              : 'text-[#C9C0A8] border border-[#F5E8C7]/10 hover:text-[#F5E8C7] hover:border-[#D4A853]/40',
          ].join(' ')}
        >
          <SignOut size={16} weight="bold" />
          Exit
        </button>
      </header>

      {/* First-run coachmark — points at the Exit control so users learn EIM is
          a mini-app they leave explicitly. Mobile anchors under the top bar;
          desktop anchors near the left-rail Exit. Dismiss persists. */}
      {showExitHint && (
        <>
          {/* Mobile: caret + card tucked under the top-right Exit button. */}
          <div className="lg:hidden fixed top-[58px] right-3 z-[60] w-[230px]">
            <div className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 bg-[#101a2a] border-l border-t border-[rgba(212,168,83,0.35)]" />
            <div className="relative rounded-2xl border border-[rgba(212,168,83,0.35)] bg-[#101a2a] shadow-2xl p-3.5">
              <button
                onClick={dismissExitHint}
                aria-label="Dismiss"
                className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-[#5C5749] hover:text-[#F5E8C7]"
              >
                <X size={13} weight="bold" />
              </button>
              <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1 pr-5">
                You're inside EIM
              </div>
              <p className="text-[12px] text-[#D1D9E5] leading-relaxed">
                EIM is its own mini-app. Tap <span className="text-[#D4A853] font-semibold">Exit</span> up
                here anytime to return to the rest of Zaryah+.
              </p>
              <button
                onClick={dismissExitHint}
                className="mt-2.5 w-full h-9 rounded-lg text-[12px] font-bold text-[#0A0E16]"
                style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
              >
                Got it
              </button>
            </div>
          </div>

          {/* Desktop: caret + card beside the left-rail Exit (bottom-left). */}
          <div className="hidden lg:block fixed left-[256px] bottom-6 z-[60] w-[250px]">
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-[#101a2a] border-l border-b border-[rgba(212,168,83,0.35)]" />
            <div className="relative rounded-2xl border border-[rgba(212,168,83,0.35)] bg-[#101a2a] shadow-2xl p-3.5">
              <button
                onClick={dismissExitHint}
                aria-label="Dismiss"
                className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-[#5C5749] hover:text-[#F5E8C7]"
              >
                <X size={13} weight="bold" />
              </button>
              <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1 pr-5">
                You're inside EIM
              </div>
              <p className="text-[12px] text-[#D1D9E5] leading-relaxed">
                EIM is its own mini-app. Use <span className="text-[#D4A853] font-semibold">Exit to
                Zaryah+</span> down here anytime to return to the rest of the app.
              </p>
              <button
                onClick={dismissExitHint}
                className="mt-2.5 w-full h-9 rounded-lg text-[12px] font-bold text-[#0A0E16]"
                style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Scrollable stage ────────────────────────────────────────────── */}
      <main className="fixed inset-x-0 bottom-0 top-[54px] lg:top-0 lg:left-[248px] z-[5] overflow-y-auto overflow-x-hidden pb-[68px] lg:pb-0">
        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar (<lg) ─────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[64px] grid grid-cols-5 border-t border-[#F5E8C7]/[0.07] bg-[#06080D]/90 backdrop-blur-[14px]">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={[
                'flex flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-[#D4A853]' : 'text-[#7A7363]',
              ].join(' ')}
            >
              <Icon size={20} weight={active ? 'fill' : 'regular'} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={openRaya}
          className="flex flex-col items-center justify-center gap-1 text-[#D4A853]"
        >
          <Sparkle size={20} weight="fill" />
          <span className="text-[10px]">Raya</span>
        </button>
      </nav>

      {/* Raya mentor — floating orb (desktop) + slide-over panel. */}
      <EimRayaOrb />
      <EimRayaPanel />
    </div>
  );
}

export default EimShell;
