/**
 * "What Raya Remembers" — the user's own knowledge-graph, rendered on a fixed
 * plane you can orbit around. Owner-only; data comes decrypted from the backend
 * (`GET /raya/memory/graph`). The heavy three.js viewer is lazy-loaded so it
 * only ships to users who open this page.
 *
 * While `graph_memory_enabled` is off (dark launch) the endpoint returns
 * `enabled:false` and we show a "coming online" state with a sample-data
 * preview so the experience can be demoed before the flag flips.
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Sparkle } from '@phosphor-icons/react';

import { authGet } from '@/lib/api';
import type { MemoryGraphData } from '../components/memory-graph/_graphLayout';

const RayaMemoryGraph = lazy(() => import('../components/memory-graph/RayaMemoryGraph'));

/** Small illustrative graph for previewing the viewer before real data exists. */
const SAMPLE_GRAPH: MemoryGraphData = {
  enabled: true,
  nodes: [
    { id: 'user', label: 'You', type: 'user' },
    { id: 'madrid', label: 'Madrid', type: 'place' },
    { id: 'london', label: 'London', type: 'place' },
    { id: 'marta', label: 'Marta', type: 'person' },
    { id: 'carlos', label: 'Carlos', type: 'person' },
    { id: 'yusuf', label: 'Yusuf', type: 'person' },
  ],
  links: [
    { source: 'user', target: 'london', predicate: 'LIVES_IN', label: 'lived in', valid_from: '2024-01-01', valid_to: '2026-03-01', open: false },
    { source: 'user', target: 'madrid', predicate: 'LIVES_IN', label: 'lives in', valid_from: '2026-03-01', valid_to: null, open: true },
    { source: 'marta', target: 'carlos', predicate: 'IS_MANAGER_OF', label: 'manages', valid_from: '2025-06-01', valid_to: null, open: true },
    { source: 'user', target: 'marta', predicate: 'WORKS_WITH', label: 'works with', valid_from: '2025-06-01', valid_to: null, open: true },
    { source: 'yusuf', target: 'user', predicate: 'INTRODUCED', label: 'introduced', valid_from: '2025-09-01', valid_to: null, open: true },
    { source: 'yusuf', target: 'marta', predicate: 'INTRODUCED', label: 'introduced', valid_from: '2025-09-01', valid_to: null, open: true },
  ],
  attrs: [
    { node: 'marta', kind: 'relation', value: 'manager', open: true },
    { node: 'yusuf', kind: 'valence', value: 'warm', open: true },
  ],
};

type Status = 'loading' | 'ready' | 'empty' | 'disabled' | 'error';

export function RayaMemoryPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<MemoryGraphData | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let alive = true;
    authGet<MemoryGraphData>('/raya/memory/graph')
      .then((res) => {
        if (!alive) return;
        if (!res.enabled) setStatus('disabled');
        else if (!res.nodes?.length) setStatus('empty');
        else {
          setData(res);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  const shown = preview ? SAMPLE_GRAPH : data;

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-[#0b0e17]">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-[#D4A853]/15 px-4 py-3">
        <button onClick={() => navigate('/profile')} className="rounded-lg p-1.5 text-[#9aa3bd] hover:bg-white/5" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <Brain size={20} weight="duotone" className="text-[#D4A853]" />
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-[#F5E8C7]">What Raya Remembers</h1>
          <p className="text-[11px] text-[#5C5749]">Your relationships & memories, mapped over time</p>
        </div>
      </div>

      {/* body */}
      <div className="relative flex-1">
        {(status === 'ready' || preview) && shown ? (
          <Suspense fallback={<Centered>Loading the map…</Centered>}>
            <RayaMemoryGraph data={shown} />
          </Suspense>
        ) : status === 'loading' ? (
          <Centered>Loading…</Centered>
        ) : (
          <Centered>
            <div className="max-w-sm text-center">
              <Sparkle size={32} weight="duotone" className="mx-auto mb-3 text-[#D4A853]" />
              <h2 className="mb-1 text-base font-semibold text-[#F5E8C7]">
                {status === 'error' ? 'Could not load your memory map' : 'Raya is still getting to know you'}
              </h2>
              <p className="mb-5 text-[13px] leading-relaxed text-[#9aa3bd]">
                {status === 'error'
                  ? 'Something went wrong fetching your graph. Please try again later.'
                  : status === 'empty'
                    ? 'As you chat with Raya, the people, places and moments you mention will appear here as a living map.'
                    : 'This view comes online as Raya builds her memory of your conversations. Take a look at how it works:'}
              </p>
              {status !== 'error' && (
                <button
                  onClick={() => setPreview(true)}
                  className="rounded-xl border border-[#D4A853]/35 bg-[#D4A853]/12 px-4 py-2.5 text-[13px] font-semibold text-[#D4A853] hover:bg-[#D4A853]/20"
                >
                  Preview with sample data
                </button>
              )}
            </div>
          </Centered>
        )}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center p-6 text-[13px] text-[#9aa3bd]">{children}</div>;
}

export default RayaMemoryPage;
