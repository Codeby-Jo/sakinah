/**
 * EIM Home hub — landing page for the Ethical Investment Mentor.
 *
 * EIM v-redesign (Phase 2, 2026-06-09): reskinned to the Mizan mockup layout —
 * a serif head-row, a single "Continue your path" hero, three pillars
 * (Learn / Practice / Screen), a "Your money" strip (simulated portfolios + live
 * niṣāb), an Ask-Raya bar, the premium Mizan Mirror entry, and the Tarbiyah
 * verse. Renders inside the full-screen EimShell (see EimShell.tsx); the shell
 * owns the rail/tab navigation. Doctrine unchanged: sim-only, no real trades.
 * Spec: zaryah-brain/projects/eim-mvp-redesign.md.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkle,
  GraduationCap,
  ChartLineUp,
  Scales,
  PlayCircle,
  CheckCircle,
  CaretRight,
  ArrowRight,
  Plus,
  Newspaper,
} from '@phosphor-icons/react';
import { EIM_MIRROR_ENABLED } from '@/app/flags';
import { CurrencyPicker } from '@/lib/currency/CurrencyPicker';
import { eimTrack } from '../analytics';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { EimWelcome } from '../components/EimWelcome';
import { NisabCard } from '../components/NisabCard';
import { StreakCard } from '../components/StreakCard';
import { TarbiyahCard } from '../components/TarbiyahCard';
import { useEimStreakHeartbeat } from '../hooks/useEimStreakHeartbeat';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';
import { useRayaPanel } from '../stores/rayaPanel.store';
import type { Lesson, LessonLevel } from '../types/eim.types';

const DAILY_VERSE = {
  arabic: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ',
  translation: 'Give full measure and weight in justice.',
  citation: "Surah Al-An'am 6:152",
};

const MAINLINE_TOTAL = 5;

type Pillar = {
  key: string;
  icon: typeof GraduationCap;
  title: string;
  desc: string;
  sub: string;
  path: string;
  iconBg: string;
  iconColor: string;
};

const PILLARS: Pillar[] = [
  {
    key: 'learn',
    icon: GraduationCap,
    title: 'Learn',
    desc: 'Five levels, plain language. Lessons, famous playbooks read through a halal lens, and a scholar deep-track.',
    sub: 'Course · Playbooks · Scholar FAQ',
    path: '/eim/library',
    iconBg: 'rgba(82,126,158,0.14)',
    iconColor: '#8fb4d4',
  },
  {
    key: 'practice',
    icon: ChartLineUp,
    title: 'Practice',
    desc: 'Simulate decades in minutes. Replay real history, live a market crisis, learn to read charts — risk-free.',
    sub: 'Simulator · Scenarios · Patterns',
    path: '/eim/practice',
    iconBg: 'rgba(212,168,83,0.13)',
    iconColor: '#D4A853',
  },
  {
    key: 'screen',
    icon: Scales,
    title: 'Screen',
    desc: 'Is it halal? Screen any company against the standards — and see where the scholars agree and differ.',
    sub: 'Stock screening · Ulamāʾ views',
    path: '/eim/screen',
    iconBg: 'rgba(42,157,111,0.14)',
    iconColor: '#5bc093',
  },
];

const SERIF = "'Cormorant Garamond', Georgia, serif";

export function EimHomePage() {
  const navigate = useNavigate();
  const portfolios = useEimStore((s) => s.portfolios);
  const lessonProgress = useEimStore((s) => s.lessonProgress);
  const currentLevelTitle = useEimStore((s) => s.currentLevelTitle);
  const setCurrentLevelTitle = useEimStore((s) => s.setCurrentLevelTitle);
  const openRayaAsk = useRayaPanel((s) => s.openAsk);
  const [askValue, setAskValue] = useState('');

  // Fire-and-forget streak heartbeat on home mount — idempotent within a day.
  useEimStreakHeartbeat();

  // P10 analytics — count home-page opens.
  useEffect(() => {
    eimTrack('eim_home_opened');
  }, []);

  const { data: levels } = useQuery({
    queryKey: ['eim', 'levels'],
    queryFn: eimService.getLevels,
    staleTime: 5 * 60_000,
  });

  const { data: lessons } = useQuery({
    queryKey: ['eim', 'lessons', 'all'],
    queryFn: () => eimService.getLessons(),
    staleTime: 5 * 60_000,
  });

  // Derive current level + progression percentage from completed lessons.
  // Current level = first mainline level (by order) not fully completed.
  const [currentLevel, setCurrentLevel] = useState<LessonLevel | undefined>();
  const [nextLevel, setNextLevel] = useState<LessonLevel | undefined>();
  const [progressPct, setProgressPct] = useState(0);
  const [resumeLesson, setResumeLesson] = useState<Lesson | undefined>();
  const [resumeLessonIdx, setResumeLessonIdx] = useState<number>(0);
  const [resumeLessonTotal, setResumeLessonTotal] = useState<number>(0);
  const [allMainlineDone, setAllMainlineDone] = useState(false);

  useEffect(() => {
    if (!levels || !lessons) return;
    const sorted = [...levels]
      .filter((l) => !l.is_specialization)
      .sort((a, b) => a.order - b.order);
    if (sorted.length === 0) return;

    let pickedIdx = sorted.length - 1;
    let pickedPct = 100;
    let everythingDone = true;
    for (let i = 0; i < sorted.length; i++) {
      const lvl = sorted[i];
      const total = lessons.filter((l) => l.level_id === lvl.id).length;
      const done = lessons.filter(
        (l) => l.level_id === lvl.id && lessonProgress[l.id]?.completedAt,
      ).length;
      const pct = total > 0 ? (done / total) * 100 : 0;
      if (pct < 100) {
        pickedIdx = i;
        pickedPct = pct;
        everythingDone = false;
        break;
      }
    }

    const lvl = sorted[pickedIdx];
    setCurrentLevel(lvl);
    setNextLevel(sorted[pickedIdx + 1]);
    setProgressPct(pickedPct);
    setAllMainlineDone(everythingDone);
    if (lvl && lvl.title_en !== currentLevelTitle) {
      setCurrentLevelTitle(lvl.title_en);
    }

    const lvlLessons = lessons.filter((l) => l.level_id === lvl.id);
    const unfinishedIdx = lvlLessons.findIndex(
      (l) => !lessonProgress[l.id]?.completedAt,
    );
    if (unfinishedIdx >= 0) {
      setResumeLesson(lvlLessons[unfinishedIdx]);
      setResumeLessonIdx(unfinishedIdx);
    } else {
      setResumeLesson(undefined);
      setResumeLessonIdx(0);
    }
    setResumeLessonTotal(lvlLessons.length);
  }, [levels, lessons, lessonProgress, currentLevelTitle, setCurrentLevelTitle]);

  // Resume deep-links straight into the next unfinished lesson.
  const handleResume = () => {
    if (resumeLesson) {
      navigate(`/eim/lesson/${resumeLesson.id}`);
    } else if (allMainlineDone) {
      navigate('/eim/library/halal_mastery');
    } else if (currentLevel) {
      navigate(`/eim/library/${currentLevel.id}`);
    } else {
      navigate('/eim/library');
    }
  };

  // Ask Raya — open the EIM Raya panel, seeded with the typed query.
  const askRaya = () => {
    openRayaAsk(askValue.trim());
    setAskValue('');
  };

  return (
    <>
      <EimWelcome />
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 pt-6 pb-10">
        {/* ── Head row ── */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#a98842] font-medium">
              الميزان · the balance
            </div>
            <h1
              className="text-[34px] sm:text-[42px] font-medium text-[#F5E8C7] leading-[1.04] mt-2"
              style={{ fontFamily: SERIF, letterSpacing: '-0.01em' }}
            >
              Invest the halal way.
            </h1>
            <p className="text-[14px] text-[#8d897c] mt-2.5 max-w-[52ch] leading-relaxed">
              A simulator, a learning library, and a mentor — bounded by the Sharīʿah.
              Never a brokerage. No real trades, ever.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <CurrencyPicker />
          </div>
        </div>

        <DisclaimerBanner />

        {/* ── HERO — continue your path ── */}
        <div className="mt-6 rounded-[18px] border border-[#F5E8C7]/[0.07] overflow-hidden bg-[#F5E8C7]/[0.02]">
          <div
            className="px-6 sm:px-7 pt-6 pb-5 border-b border-[#F5E8C7]/[0.07]"
            style={{
              background:
                'radial-gradient(130% 130% at 0 0, rgba(212,168,83,0.06), transparent 55%)',
            }}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#a98842]">
              {currentLevel
                ? `Your path · Level ${Math.min(currentLevel.order, MAINLINE_TOTAL)} of ${MAINLINE_TOTAL}`
                : 'Your path'}
            </div>
            <div
              className="text-[28px] sm:text-[32px] font-medium text-[#F5E8C7] mt-1"
              style={{ fontFamily: SERIF }}
            >
              {currentLevel?.title_en ?? 'Foundations'}
            </div>
            {currentLevel?.description && (
              <div className="text-[13px] text-[#8d897c] mt-2 max-w-[62ch] leading-relaxed">
                {currentLevel.description}
              </div>
            )}
            <div className="h-[5px] rounded-full bg-white/[0.07] mt-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(2, Math.min(100, progressPct))}%`,
                  background: 'linear-gradient(90deg, #a98842, #D4A853)',
                }}
              />
            </div>
            <div className="text-[12px] text-[#5a574e] mt-2.5">
              {Math.round(progressPct)}% complete
              {!allMainlineDone && (resumeLesson || nextLevel) && (
                <>
                  {' · next up: '}
                  <span className="text-[#8d897c] font-medium">
                    {resumeLesson?.title ?? nextLevel?.title_en}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleResume}
            className="w-full flex items-center gap-4 px-6 sm:px-7 py-5 text-left hover:bg-[rgba(42,157,111,0.05)] transition-colors"
          >
            <div className="w-[46px] h-[46px] rounded-[13px] grid place-items-center bg-[rgba(42,157,111,0.14)] text-[#2A9D6F] shrink-0">
              {allMainlineDone ? (
                <CheckCircle size={22} weight="fill" />
              ) : (
                <PlayCircle size={22} weight="fill" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-[#8d897c]">
                {allMainlineDone ? 'Mainline complete' : 'Continue learning'}
              </div>
              <div
                className="text-[18px] sm:text-[20px] font-medium text-[#F5E8C7] mt-0.5 truncate"
                style={{ fontFamily: SERIF }}
              >
                {allMainlineDone
                  ? 'Explore the Halal Mastery specialization'
                  : (resumeLesson?.title ?? 'Begin your first lesson')}
              </div>
              <div className="text-[12.5px] text-[#5a574e] mt-0.5 truncate">
                {allMainlineDone
                  ? 'AAOIFI · Classical Hanafi · Contemporary'
                  : `Lesson ${resumeLessonIdx + 1} of ${resumeLessonTotal || 1} · ${currentLevel?.title_en ?? 'Foundations'}`}
              </div>
            </div>
            <ArrowRight size={22} className="text-[#F5E8C7]/50 shrink-0" />
          </button>
        </div>

        {/* Learning streak — kept under the hero. */}
        <div className="mt-4">
          <StreakCard />
        </div>

        {/* Today — Halal Lens on the News (shared daily digest). */}
        <button
          onClick={() => navigate('/eim/news')}
          className="w-full mt-4 text-left rounded-2xl border border-[rgba(82,126,158,0.25)] bg-gradient-to-br from-[rgba(82,126,158,0.10)] to-transparent hover:border-[rgba(82,126,158,0.5)] transition-all p-4 flex items-center gap-3.5"
        >
          <div className="w-[46px] h-[46px] rounded-[13px] grid place-items-center bg-[rgba(82,126,158,0.16)] text-[#8fb4d4] shrink-0">
            <Newspaper size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-[#8d897c]">Today</div>
            <div className="text-[18px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
              Halal lens on the news
            </div>
            <div className="text-[12.5px] text-[#5a574e] mt-0.5">
              A few stories that matter — with the Islamic angle. Refreshed daily.
            </div>
          </div>
          <ArrowRight size={20} className="text-[#8fb4d4] shrink-0" />
        </button>

        {/* ── THREE PILLARS ── */}
        <SectionLabel>Three ways in</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => navigate(p.path)}
                className="text-left rounded-[18px] border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] hover:border-[#F5E8C7]/[0.14] hover:-translate-y-[3px] transition-all p-6"
              >
                <div
                  className="w-12 h-12 rounded-[13px] grid place-items-center mb-4"
                  style={{ background: p.iconBg, color: p.iconColor }}
                >
                  <Icon size={23} />
                </div>
                <div className="text-[22px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                  {p.title}
                </div>
                <div className="text-[13px] text-[#8d897c] mt-1.5 leading-relaxed">{p.desc}</div>
                <div className="text-[12px] text-[#5a574e] mt-3.5">{p.sub}</div>
              </button>
            );
          })}
        </div>

        {/* ── YOUR MONEY ── */}
        <SectionLabel>Your money</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-4">
          {/* Simulated portfolios */}
          <div className="rounded-2xl border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-[#a98842]">
                Simulated portfolios
              </span>
              <button
                onClick={() => navigate('/eim/simulator')}
                className="text-[12px] text-[#5a574e] hover:text-[#D4A853]"
              >
                See all →
              </button>
            </div>
            {portfolios.slice(0, 2).map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/eim/portfolio/${p.id}`)}
                className="w-full flex items-center justify-between py-2.5 border-b border-[#F5E8C7]/[0.07] last:border-0 text-left"
              >
                <div>
                  <div className="text-[18px] text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                    {p.name}
                  </div>
                  <div className="text-[12px] text-[#5a574e]">
                    {p.positions.length} position{p.positions.length === 1 ? '' : 's'} · paper money
                  </div>
                </div>
                <span className="text-[10px] text-[#5bc093] border border-[rgba(42,157,111,0.3)] px-2 py-0.5 rounded-full">
                  simulation
                </span>
              </button>
            ))}
            <button
              onClick={() => navigate('/eim/simulator')}
              className="w-full flex items-center gap-2 py-2.5 text-left"
            >
              <Plus size={16} className="text-[#D4A853]" weight="bold" />
              <div>
                <div className="text-[15px] text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                  New portfolio
                </div>
                <div className="text-[12px] text-[#5a574e]">Practice building a halal allocation</div>
              </div>
            </button>
          </div>

          {/* Live niṣāb */}
          <NisabCard />
        </div>

        {/* ── ASK RAYA ── */}
        <div className="mt-7 flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-2xl bg-[#F5E8C7]/[0.04] border border-[#F5E8C7]/[0.11] focus-within:border-[rgba(212,168,83,0.45)] focus-within:shadow-[0_0_28px_rgba(212,168,83,0.16)] transition-all">
          <Sparkle size={18} weight="fill" className="text-[#D4A853] shrink-0" />
          <input
            value={askValue}
            onChange={(e) => setAskValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') askRaya();
            }}
            placeholder='Ask Raya — "is Tesla halal?", "sukuk vs bonds?", "how do I start?"'
            className="flex-1 bg-transparent outline-none text-[15px] text-[#F5E8C7] placeholder:text-[#5a574e] py-3"
          />
          <button
            onClick={askRaya}
            className="bg-[#D4A853] hover:bg-[#e2b863] text-[#1a1407] font-semibold text-[13.5px] px-[18px] py-[11px] rounded-xl transition-colors"
          >
            Ask
          </button>
        </div>

        {/* ── MIZAN MIRROR — own premium entry ── */}
        {EIM_MIRROR_ENABLED && (
          <button
            onClick={() => navigate('/eim/mirror')}
            className="w-full mt-4 text-left rounded-2xl border border-[rgba(212,168,83,0.30)] bg-gradient-to-br from-[rgba(212,168,83,0.10)] to-[rgba(168,85,247,0.04)] hover:border-[rgba(212,168,83,0.5)] transition-all p-5 flex items-center gap-4"
          >
            <div className="w-[46px] h-[46px] rounded-[13px] grid place-items-center bg-[rgba(212,168,83,0.18)] text-[#D4A853] shrink-0">
              <Scales size={22} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                  Mizan Mirror
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[rgba(212,168,83,0.18)] text-[#D4A853] text-[9px] font-semibold uppercase tracking-wider">
                  Premium
                </span>
              </div>
              <div className="text-[12.5px] text-[#8d897c] mt-0.5">
                Muhasaba for your trading · a behavioural self-audit, not a market predictor.
              </div>
            </div>
            <CaretRight size={18} className="text-[#D4A853] shrink-0" />
          </button>
        )}

        {/* ── TARBIYAH ── */}
        <div className="mt-7">
          <TarbiyahCard verse={DAILY_VERSE} />
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-[#5a574e] mt-9 mb-4">
      {children}
      <span className="flex-1 h-px bg-[#F5E8C7]/[0.07]" />
    </div>
  );
}

export default EimHomePage;
