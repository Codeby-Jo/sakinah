/**
 * Closest to Raya — the single deepest conversation with a standout Raya quote.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quotes, Sparkle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { getDeepestConversation } from '@/features/raya-hub/services/dashboardService';

interface Moment {
  title: string;
  quote: string;
  convoId: string;
  messages: number;
}

export function ClosestMoment() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    setLoading(true);
    // Chat content is encrypted at rest and the decryption key lives only on
    // the backend — so we fetch the deepest conversation (with a standout Raya
    // quote) from the server, already decrypted, rather than reading ciphertext
    // straight from Firestore. See app/routes/raya_dashboard.py:get_deepest.
    getDeepestConversation()
      .then((res) => {
        if (!alive) return;
        setMoment(
          res.moment
            ? {
                title: res.moment.title,
                quote: res.moment.quote.trim(),
                convoId: res.moment.convoId,
                messages: res.moment.messageCount,
              }
            : null,
        );
      })
      .catch((e) => {
        if (alive) console.error('ClosestMoment load error:', e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  if (loading || !moment) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/ai-assistant?conversation=${moment.convoId}`)}
      className="w-full text-left rounded-2xl p-5 transition-all hover:scale-[1.005] active:scale-[0.995]"
      style={{
        background: 'linear-gradient(145deg, rgba(212,168,83,0.08), rgba(36,50,70,0.7))',
        border: '1px solid rgba(212,168,83,0.18)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkle size={14} weight="fill" className="text-[#D4A853]" />
        <p className="text-[#D4A853] text-[10px] font-bold uppercase tracking-widest">Your Deepest Conversation</p>
      </div>

      <div className="flex items-start gap-3">
        <Quotes size={20} weight="fill" className="text-[#D4A853]/40 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <p className="text-[#C9C0A8] text-[13px] leading-[1.7] italic line-clamp-3">
            "{moment.quote}"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
        <p className="text-[#7A7363] text-[12px] truncate pr-2">
          From: <span className="text-[#F5E8C7]">{moment.title}</span>
        </p>
        <p className="text-[#5C5749] text-[11px] flex-shrink-0">{moment.messages} messages</p>
      </div>
    </motion.button>
  );
}
