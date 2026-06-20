/**
 * TafsirContent — renders sanitized tafsir HTML with Quran.com-style typography.
 *
 * Replaces the old single-<p> wall of text. The markup comes from
 * quranApiService.formatTafsirHtml, which has already whitelisted the tags,
 * stripped every attribute and escaped all text — so dangerouslySetInnerHTML
 * is safe here. We style the injected structure (headings, paragraphs, lists,
 * emphasis) via Tailwind arbitrary child selectors so it reads calm and
 * organized: gold section headings, spaced paragraphs, soft emphasis.
 *
 * `fontSize` (px) drives the reader's "Tafsir size" control. The body inherits
 * it directly; headings use em-relative sizes so they scale with the slider.
 * When omitted, it falls back to a sensible fixed base (so callers that don't
 * expose the control — e.g. the Daily Ayah page — keep working unchanged).
 */
export function TafsirContent({ html, fontSize }: { html: string; fontSize?: number }) {
  return (
    <div
      dir="auto"
      style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
      className={[
        'leading-relaxed text-[#C9C0A8]',
        // Fixed base only when the size control isn't wired up.
        fontSize ? '' : 'text-[13px]',
        // Reset the leading element's top margin so it hugs the divider above.
        '[&>*:first-child]:mt-0',
        // Paragraphs / blocks — the spacing that turns the wall into sections.
        '[&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_div]:mb-2.5',
        // Section headings — gold, em-relative so they scale with `fontSize`.
        '[&_h1]:mt-4 [&_h1]:mb-1.5 [&_h1]:text-[1.12em] [&_h1]:font-semibold [&_h1]:text-[#D4A853]',
        '[&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2]:text-[1.08em] [&_h2]:font-semibold [&_h2]:text-[#D4A853]',
        '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-[1.04em] [&_h3]:font-semibold [&_h3]:text-[#D4A853]/90',
        '[&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-[1em] [&_h4]:font-semibold [&_h4]:text-[#D4A853]/80',
        '[&_h5]:mt-3 [&_h5]:mb-1 [&_h5]:text-[1em] [&_h5]:font-semibold [&_h5]:text-[#D4A853]/70',
        '[&_h6]:mt-3 [&_h6]:mb-1 [&_h6]:text-[1em] [&_h6]:font-semibold [&_h6]:text-[#D4A853]/70',
        // Emphasis.
        '[&_b]:font-semibold [&_b]:text-[#F5E8C7] [&_strong]:font-semibold [&_strong]:text-[#F5E8C7]',
        '[&_i]:italic [&_em]:italic',
        // Lists.
        '[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1',
        // Block quotes.
        '[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#D4A853]/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#8A8270]',
      ].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default TafsirContent;
