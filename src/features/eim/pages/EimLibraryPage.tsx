/**
 * Learn — course landing. EIM v-redesign (Phase 3, 2026-06-09): reskinned to the
 * Mizan mockup "Learn" view — a 5-level ladder, a "Beyond the course" pair
 * (Investor Playbooks + Scholar FAQ Archive), and the Halal Mastery deep-track.
 * The Playbooks tab is preserved as an in-page sub-view (the ?tab=playbook
 * deep-link still works). Route stays /eim/library. Renders inside EimShell.
 * Spec: zaryah-brain/projects/eim-mvp-redesign.md.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Books,
  GraduationCap,
} from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { EimLoading } from '../components/EimLoading';
import { FeatureIntro } from '../components/FeatureIntro';
import { FetchError } from '../components/FetchError';
import { PLAYBOOKS } from '../data/knowledge-bank';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';

type CourseTab = 'lessons' | 'playbook';

const SERIF = "'Cormorant Garamond', Georgia, serif";

export function EimLibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonProgress = useEimStore((s) => s.lessonProgress);
  const initialTab: CourseTab = searchParams.get('tab') === 'playbook' ? 'playbook' : 'lessons';
  const [tab, setTab] = useState<CourseTab>(initialTab);

  const levelsQ = useQuery({
    queryKey: ['eim', 'levels'],
    queryFn: eimService.getLevels,
  });
  const lessonsQ = useQuery({
    queryKey: ['eim', 'lessons'],
    queryFn: () => eimService.getLessons(),
  });
  const levels = levelsQ.data;
  const lessons = lessonsQ.data;
  const isLoading = levelsQ.isLoading;
  const error = levelsQ.error ?? lessonsQ.error;

  const lessonsByLevel = (levelId: string) =>
    (lessons ?? []).filter((l) => l.level_id === levelId);
  const completedInLevel = (levelId: string) =>
    lessonsByLevel(levelId).filter((l) => lessonProgress[l.id]?.completedAt).length;

  const mainlineLevels = (levels ?? [])
    .filter((l) => !l.is_specialization)
    .sort((a, b) => a.order - b.order);
  const specializations = (levels ?? []).filter((l) => l.is_specialization);
  const currentLevelId = mainlineLevels.find((l) => {
    const t = lessonsByLevel(l.id).length;
    return t === 0 || completedInLevel(l.id) < t;
  })?.id;

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 pt-6 pb-10">
      <button
        onClick={() => navigate('/eim')}
        className="flex items-center gap-2 text-[13px] text-[#8d897c] hover:text-[#F5E8C7] transition-colors mb-4"
      >
        <CaretLeft size={15} weight="bold" /> Back to Home
      </button>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#a98842] font-medium">
            EIM · the school
          </div>
          <h1
            className="text-[34px] sm:text-[40px] font-medium text-[#F5E8C7] leading-[1.05] mt-1.5"
            style={{ fontFamily: SERIF }}
          >
            Learn
          </h1>
          <p className="text-[13px] text-[#8d897c] mt-1.5 max-w-[58ch] leading-relaxed">
            Five levels from apprentice to portfolio craft — every framework read through a halal lens.
          </p>
        </div>
        <div className="shrink-0 pt-1">
          <FeatureIntro featureId="course" />
        </div>
      </div>

      <DisclaimerBanner />

      {tab === 'playbook' ? (
        /* ── PLAYBOOK SUB-VIEW ── */
        <div className="mt-6">
          <button
            onClick={() => setTab('lessons')}
            className="flex items-center gap-2 text-[13px] text-[#8d897c] hover:text-[#F5E8C7] transition-colors mb-4"
          >
            <CaretLeft size={15} weight="bold" /> Back to the course
          </button>
          <p className="text-[12.5px] text-[#8d897c] leading-relaxed mb-4 max-w-[64ch]">
            Famous investors' applied processes — overlaid with the Halal Lens (what applies as-is,
            what needs modification, what is forbidden). The framework is the lesson; the personal
            portfolio is not endorsed.
          </p>
          <div className="space-y-2.5">
            {PLAYBOOKS.map((pb) => (
              <button
                key={pb.id}
                onClick={() => navigate(`/eim/playbook/${pb.id}`)}
                className="w-full text-left rounded-2xl border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] hover:border-[#F5E8C7]/[0.16] transition-all p-4 flex items-center gap-4"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(212,168,83,0.30)] text-[#F5E8C7] font-medium text-[20px]"
                  style={{
                    fontFamily: SERIF,
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(42,157,111,0.08))',
                  }}
                >
                  {pb.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-[#a98842] font-medium mb-0.5">
                    {pb.years_active}
                  </div>
                  <div className="text-[17px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                    {pb.name}
                  </div>
                  <div className="text-[12px] text-[#8d897c] mt-0.5 line-clamp-2">{pb.framework}</div>
                  <div className="text-[10.5px] text-[#5a574e] mt-1.5">
                    {pb.minutes} min · {pb.principles.length} principles · {pb.case_studies.length} cases
                  </div>
                </div>
                <CaretRight size={15} weight="bold" className="text-[#5a574e] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── LESSONS LADDER ── */
        <>
          {error && (
            <FetchError
              error={error}
              retry={() => {
                void levelsQ.refetch();
                void lessonsQ.refetch();
              }}
              context="the learning library"
            />
          )}
          {isLoading && (
            <div className="mt-6">
              <EimLoading label="Opening the Madrasa — laying out your levels…" rows={4} />
            </div>
          )}

          <div className="mt-6 space-y-3">
            {mainlineLevels.map((lvl) => {
              const total = lessonsByLevel(lvl.id).length;
              const done = completedInLevel(lvl.id);
              const isComplete = total > 0 && done === total;
              const isCurrent = lvl.id === currentLevelId;
              const status = isComplete
                ? 'Done'
                : isCurrent
                  ? done > 0
                    ? 'In progress'
                    : 'Start here'
                  : `${done}/${total || '–'}`;
              return (
                <button
                  key={lvl.id}
                  onClick={() => navigate(`/eim/library/${lvl.id}`)}
                  className={[
                    'w-full text-left flex items-center gap-4 rounded-2xl border p-5 transition-all',
                    isCurrent
                      ? 'border-[rgba(212,168,83,0.3)] bg-gradient-to-br from-[rgba(212,168,83,0.06)] to-transparent hover:border-[rgba(212,168,83,0.5)]'
                      : 'border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] hover:border-[#F5E8C7]/[0.16]',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'w-[42px] h-[42px] rounded-xl grid place-items-center shrink-0 border relative',
                      isCurrent
                        ? 'border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.08)] text-[#D4A853]'
                        : 'border-[#F5E8C7]/[0.11] text-[#8d897c]',
                    ].join(' ')}
                    style={{ fontFamily: SERIF, fontSize: '20px' }}
                  >
                    {lvl.order}
                    {isComplete && (
                      <span className="absolute -top-1.5 -right-1.5">
                        <CheckCircle size={17} weight="fill" color="#22C55E" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[20px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                      {lvl.title_en}
                    </div>
                    <div className="text-[13px] text-[#8d897c] mt-0.5 line-clamp-2">{lvl.description}</div>
                  </div>
                  <div
                    className={[
                      'self-center text-[12px] flex items-center gap-1.5 shrink-0',
                      isCurrent ? 'text-[#D4A853]' : 'text-[#5a574e]',
                    ].join(' ')}
                  >
                    {status}
                    {isCurrent && <ArrowRight size={13} weight="bold" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Beyond the course ── */}
          <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-[#5a574e] mt-9 mb-4">
            Beyond the course
            <span className="flex-1 h-px bg-[#F5E8C7]/[0.07]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setTab('playbook')}
              className="text-left rounded-2xl border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] hover:border-[#F5E8C7]/[0.16] hover:-translate-y-0.5 transition-all p-5"
            >
              <div className="w-11 h-11 rounded-xl grid place-items-center mb-3.5 bg-white/[0.05] text-[#D4A853]">
                <BookOpen size={21} />
              </div>
              <div className="text-[21px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                Investor Playbooks
              </div>
              <div className="text-[13px] text-[#8d897c] mt-1.5 leading-relaxed">
                Famous frameworks — value, growth, index — each annotated with where it does and doesn't
                sit with the Sharīʿah.
              </div>
            </button>
            <button
              onClick={() => navigate('/eim/scholar-faqs')}
              className="text-left rounded-2xl border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] hover:border-[#F5E8C7]/[0.16] hover:-translate-y-0.5 transition-all p-5"
            >
              <div className="w-11 h-11 rounded-xl grid place-items-center mb-3.5 bg-[rgba(42,157,111,0.14)] text-[#5bc093]">
                <Books size={21} />
              </div>
              <div className="text-[21px] font-medium text-[#F5E8C7]" style={{ fontFamily: SERIF }}>
                Scholar FAQ Archive
              </div>
              <div className="text-[13px] text-[#8d897c] mt-1.5 leading-relaxed">
                Long-form, sourced answers to the questions people actually ask — crypto, options,
                mortgages, insurance.
              </div>
            </button>
          </div>

          {/* ── Halal Mastery deep-track ── */}
          {specializations.map((lvl) => {
            const total = lessonsByLevel(lvl.id).length;
            const done = completedInLevel(lvl.id);
            const isComplete = total > 0 && done === total;
            return (
              <button
                key={lvl.id}
                onClick={() => navigate(`/eim/library/${lvl.id}`)}
                className="w-full text-left mt-4 flex items-center gap-4 rounded-2xl border border-[rgba(42,157,111,0.2)] bg-gradient-to-br from-[rgba(42,157,111,0.08)] to-transparent hover:border-[rgba(42,157,111,0.4)] transition-all p-5"
              >
                <div className="w-[46px] h-[46px] rounded-[13px] grid place-items-center bg-[rgba(42,157,111,0.14)] text-[#5bc093] shrink-0 relative">
                  <GraduationCap size={22} weight="bold" />
                  {isComplete && (
                    <span className="absolute -top-1.5 -right-1.5">
                      <CheckCircle size={17} weight="fill" color="#22C55E" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[21px] font-medium text-[#5bc093]" style={{ fontFamily: SERIF }}>
                    {lvl.title_en} — Specialization
                  </div>
                  <div className="text-[12.5px] text-[#8d897c] mt-0.5 line-clamp-2">
                    {lvl.description}
                  </div>
                </div>
                <ArrowRight size={20} className="text-[#5bc093] shrink-0" />
              </button>
            );
          })}

          <p className="text-center text-[12px] text-[#5a574e] mt-10 pt-6 border-t border-[#F5E8C7]/[0.07]">
            Lessons and scholar content are reviewed by qualified scholars before publishing.
            Raya tutors — she never issues fatwa.
          </p>
        </>
      )}
    </div>
  );
}

export default EimLibraryPage;
