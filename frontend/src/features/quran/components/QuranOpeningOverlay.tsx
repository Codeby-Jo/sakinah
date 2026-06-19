/**
 * QuranOpeningOverlay — a calm, dignified full-screen transition shown for a
 * moment when the user opens the Qur'an reader (e.g. from a Raya answer).
 *
 * A soft fade to night, an expanding gold halo, and (optionally) the Basmala
 * settling into place — a beat of sakīnah (stillness) before the Word. The
 * caller shows this, waits a beat, then navigates. All Framer Motion (no CSS
 * transitions) so it stays smooth.
 *
 * `showBasmala` (default true) toggles the Arabic Basmala + gold underline:
 *   • Mushaf entry  → full version (Basmala + halo + caption).
 *   • Raya answers  → halo + caption only (showBasmala={false}).
 */

import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

export function QuranOpeningOverlay({ showBasmala = true }: { showBasmala?: boolean }) {
  // Render into <body> via a portal so the full-screen overlay escapes the page's
  // transition wrapper and the scrollable <main>. A `position: fixed` element is
  // positioned relative to any transformed ancestor (MainLayout's page-transition
  // motion.div), which clipped/offset it — the portal fixes that cleanly.
  return createPortal(
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      // Cover the screen INSTANTLY (opacity 1 from frame 1) so the page never
      // peeks through at the start; only fade OUT at the end. The halo + Basmala
      // still animate in on top for the transition feel.
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(212,168,83,0.16), transparent 60%), #06080D',
      }}
    >
      {/* Expanding gold halo rings — gentle, outward, like light spreading. */}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-[#D4A853]/40"
          style={{ width: 120, height: 120 }}
          initial={{ scale: 0.5, opacity: 0.55 }}
          animate={{ scale: 3.4, opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: i * 0.4, repeat: Infinity }}
        />
      ))}

      {showBasmala && (
        <>
          {/* The Basmala — settles in with a soft glow. */}
          <motion.p
            className="font-arabic relative px-6 text-center text-3xl text-[#F5E8C7] sm:text-4xl"
            style={{ textShadow: '0 0 26px rgba(212,168,83,0.5)' }}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.p>

          {/* A thin gold line draws in beneath it. */}
          <motion.span
            className="mt-4 block h-px bg-gradient-to-r from-transparent via-[#D4A853] to-transparent"
            style={{ width: 220 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          />
        </>
      )}

      {/* Quiet caption — shown only in the halo-only variant (Raya). The Mushaf
          entry shows the Basmala alone, with no caption. */}
      {!showBasmala && (
        <motion.p
          className="mt-5 text-xs uppercase tracking-[0.25em] text-[#C9C0A8]/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Opening the Qur&rsquo;an
        </motion.p>
      )}
    </motion.div>,
    document.body,
  );
}
