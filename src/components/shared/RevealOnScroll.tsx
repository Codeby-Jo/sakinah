/**
 * RevealOnScroll — the app's shared scroll-reveal building block.
 *
 * Wrap any block to give it a smooth, DIRECTION-AWARE reveal:
 *   • fades + slides into view as it scrolls onto the screen,
 *   • enters from below when scrolling down, from above when scrolling up,
 *   • re-plays every time (no `once`),
 *   • driven entirely by Framer Motion (no CSS transitions) so it stays smooth.
 *
 * Blocks already on screen at mount animate immediately, which doubles as an
 * "entry" animation — so this one component delivers both behaviours.
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Tracks scroll direction ('down' | 'up') for the nearest scrolling container.
 * Scrolling in this app happens inside MainLayout's <main> element (not the
 * window), so we listen with `capture: true` on the window — scroll events
 * don't bubble, but a capturing window listener still receives them from any
 * nested scroller. Calling setState with the same value is a no-op in React,
 * so this only re-renders when the direction actually flips — not every frame.
 */
export function useScrollDirection(): 'up' | 'down' {
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement;
      const y = el?.scrollTop ?? 0;
      if (y > lastY.current) setDirection('down');
      else if (y < lastY.current) setDirection('up');
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, []);
  return direction;
}

export function RevealOnScroll({
  children,
  className = '',
  distance = 24,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const dir = useScrollDirection();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: dir === 'down' ? distance : -distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
