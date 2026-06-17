/**
 * EIM — Halal Lens on the News. Shows the shared, once-daily digest: a few
 * finance/markets stories, each with a plain summary + the Islamic angle
 * (educational — what to weigh / where scholars differ, NOT a fatwa or a
 * buy/sell signal). "Ask Raya about this" deep-links the headline into the
 * Raya panel. Renders inside EimShell.
 * Spec: zaryah-brain/ideas/halal-news-digest.md.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowSquareOut,
  Scales,
  Sparkle,
  ArrowsClockwise,
  CaretLeft,
} from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { eimService, type NewsItem } from '../services/eim.service';
import { useRayaPanel } from '../stores/rayaPanel.store';
import { eimTrack } from '../analytics';

const SERIF = "'Cormorant Garamond', Georgia, serif";

export function EimNewsPage() {
  const navigate = useNavigate();
  const openRayaAsk = useRayaPanel((s) => s.openAsk);
  const { data, isLoading, error } = useQuery({
    queryKey: ['eim', 'news'],
    queryFn: eimService.getNewsDigest,
    staleTime: 30 * 60_000, // shared daily digest — cache hard
  });

  useEffect(() => {
    eimTrack('eim_home_opened'); // reuse an existing event (no new backend event needed yet)
  }, []);

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 pt-6 pb-10">
      <button
        onClick={() => navigate('/eim')}
        className="flex items-center gap-2 text-[13px] text-[#8d897c] hover:text-[#F5E8C7] transition-colors mb-4"
      >
        <CaretLeft size={15} weight="bold" /> Back to Home
      </button>

      <div className="mb-1">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#a98842] font-medium">
          EIM · today
        </div>
        <h1
          className="text-[34px] sm:text-[40px] font-medium text-[#F5E8C7] leading-[1.05] mt-1.5"
          style={{ fontFamily: SERIF }}
        >
          Halal Lens on the News
        </h1>
        <p className="text-[13px] text-[#8d897c] mt-1.5 max-w-[60ch] leading-relaxed">
          A few stories that matter today — each with a plain read and the Islamic angle. To
          understand, not to trade. Raya tutors; she never issues a fatwa.
        </p>
      </div>

      <DisclaimerBanner />

      {isLoading && (
        <div className="mt-8 flex items-center gap-2 text-[13px] text-[#8d897c]">
          <ArrowsClockwise size={16} className="animate-spin text-[#D4A853]" />
          Gathering today's stories…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-[rgba(176,74,85,0.3)] bg-[rgba(176,74,85,0.08)] p-4 text-[13px] text-[#d79aa1]">
          Couldn't load today's digest. Please try again shortly.
        </div>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <div className="mt-6 text-[13px] text-[#8d897c]">No stories available right now — check back soon.</div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 space-y-4">
          {data.items.map((item) => (
            <NewsCard key={item.id} item={item} onAsk={() => openRayaAsk(`Explain this and the Islamic angle: ${item.headline}`)} />
          ))}
          <p className="text-center text-[12px] text-[#5a574e] mt-8 pt-6 border-t border-[#F5E8C7]/[0.07]">
            Educational only — summaries link to the original source. The Islamic angle shows what to
            weigh and where scholars differ; it is not a fatwa or a recommendation. Confirm with a
            qualified scholar before acting.
          </p>
        </div>
      )}
    </div>
  );
}

function NewsCard({ item, onAsk }: { item: NewsItem; onAsk: () => void }) {
  const isIndia = item.region === 'india';
  return (
    <article className="rounded-[18px] border border-[#F5E8C7]/[0.07] bg-[#F5E8C7]/[0.02] overflow-hidden">
      <div className="px-5 sm:px-6 py-5">
        {/* Region + source */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={[
              'text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border',
              isIndia
                ? 'text-[#5bc093] border-[rgba(42,157,111,0.3)] bg-[rgba(42,157,111,0.08)]'
                : 'text-[#8fb4d4] border-[rgba(82,126,158,0.3)] bg-[rgba(82,126,158,0.08)]',
            ].join(' ')}
          >
            {isIndia ? 'India' : 'International'}
          </span>
          <span className="text-[11px] text-[#5a574e]">{item.source}</span>
        </div>

        {/* Headline → source */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-2"
        >
          <h2
            className="text-[20px] sm:text-[22px] font-medium text-[#F5E8C7] leading-snug group-hover:text-[#D4A853] transition-colors"
            style={{ fontFamily: SERIF }}
          >
            {item.headline}
          </h2>
          <ArrowSquareOut size={16} className="text-[#5a574e] group-hover:text-[#D4A853] mt-1.5 shrink-0 transition-colors" />
        </a>

        {item.summary && (
          <p className="text-[13.5px] text-[#c9c0a8] mt-2.5 leading-relaxed">{item.summary}</p>
        )}

        {/* Islamic angle */}
        {item.islamic_angle && (
          <div className="mt-3.5 rounded-xl border border-[rgba(42,157,111,0.2)] bg-[rgba(42,157,111,0.05)] p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Scales size={14} className="text-[#5bc093]" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#5bc093] font-medium">
                The Islamic angle
              </span>
            </div>
            <p className="text-[13px] text-[#cdc8bb] leading-relaxed">{item.islamic_angle}</p>
            {item.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {item.citations.map((c) => (
                  <span key={c} className="text-[10.5px] text-[#8d897c] border border-[#F5E8C7]/[0.1] rounded-full px-2 py-0.5">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onAsk}
          className="mt-3.5 inline-flex items-center gap-1.5 text-[12px] text-[#D4A853] hover:text-[#e2b863] transition-colors"
        >
          <Sparkle size={14} weight="fill" /> Ask Raya about this
        </button>
      </div>
    </article>
  );
}

export default EimNewsPage;
