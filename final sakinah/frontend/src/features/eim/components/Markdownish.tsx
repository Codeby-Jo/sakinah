/**
 * Markdownish — a tiny, dependency-free markdown renderer for EIM text.
 *
 * Raya, the persona mentor, lessons and report items all produce LLM / authored
 * markdown: `**bold**`, `__bold__`, `*italic*`, `` `code` ``, `#` headings,
 * `- ` / `• ` bullets, `1.` lists and `---` rules. Dumping that raw (with
 * `whitespace-pre-wrap`) leaks the literal `**`, `__`, `##`, `--` markers and
 * looks cheap. Pulling in react-markdown for chat-sized strings is overkill, so
 * this renderer covers the markup we actually emit and quietly strips any stray
 * markers it doesn't style.
 *
 * Block level: headings, bullet/ordered lists, horizontal rules, paragraphs.
 * Inline:      bold, italic, inline-code, strikethrough — leftover markers cleaned.
 */

import type { ReactNode } from 'react';

const BOLD = 'text-[#F5E8C7] font-semibold';

// Remove markup characters the inline pass didn't turn into an element, so a
// half-formed `**` (common mid-stream) or a stray `*` never reaches the screen.
function clean(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/~~/g, '')
    .replace(/`/g, '')
    .replace(/(^|[^*])\*(?!\*)/g, '$1') // lone, unmatched asterisk
    .replace(/(\s)--(\s)/g, '$1—$2'); // double-hyphen → em dash
}

// Inline markup → React nodes. Single `_` is intentionally NOT italic so
// snake_case tickers/symbols (e.g. `BRK_B`) survive untouched.
function inline(text: string, kb: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Italic requires non-space just inside the `*` markers, so a lone stray
  // asterisk (or `* ` list residue) never opens a runaway italic span.
  const re = /(\*\*|__)(.+?)\1|~~(.+?)~~|\*(\S(?:[^*\n]*?\S)?)\*|`([^`\n]+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(clean(text.slice(last, m.index)));
    if (m[2] !== undefined) {
      out.push(<strong key={`${kb}b${k++}`} className={BOLD}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      out.push(<s key={`${kb}s${k++}`} className="opacity-70">{m[3]}</s>);
    } else if (m[4] !== undefined) {
      out.push(<em key={`${kb}i${k++}`} className="italic">{m[4]}</em>);
    } else if (m[5] !== undefined) {
      out.push(
        <code key={`${kb}c${k++}`} className="px-1 py-0.5 rounded bg-[#F5E8C7]/[0.08] text-[#D4A853] text-[0.9em]">
          {m[5]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(clean(text.slice(last)));
  return out;
}

const HR = /^\s*([-*_])\1{2,}\s*$/;
const HEADING = /^\s*(#{1,6})\s+(.*\S)\s*$/;
const BULLET = /^\s*[-*•–]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const BLANK = /^\s*$/;

export function Markdownish({ text }: { text: string }) {
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushPara = () => {
    if (!para.length) return;
    const joined = para.join(' ');
    blocks.push(
      <p key={`p${key}`} className="mb-2 last:mb-0">
        {inline(joined, `p${key++}`)}
      </p>,
    );
    para = [];
  };

  const flushList = () => {
    if (!list || !list.items.length) {
      list = null;
      return;
    }
    const { ordered, items } = list;
    const cls = (ordered ? 'list-decimal' : 'list-disc') + ' pl-5 space-y-1 mb-2 last:mb-0 marker:text-[#a98842]';
    const children = items.map((it, i) => (
      <li key={`li${key}-${i}`}>{inline(it, `li${key}-${i}-`)}</li>
    ));
    blocks.push(
      ordered ? (
        <ol key={`l${key++}`} className={cls}>{children}</ol>
      ) : (
        <ul key={`l${key++}`} className={cls}>{children}</ul>
      ),
    );
    list = null;
  };

  const flushAll = () => {
    flushPara();
    flushList();
  };

  for (const raw of lines) {
    if (HR.test(raw)) {
      flushAll();
      blocks.push(<hr key={`hr${key++}`} className="my-3 border-0 h-px bg-[#F5E8C7]/[0.12]" />);
      continue;
    }
    const h = raw.match(HEADING);
    if (h) {
      flushAll();
      const level = h[1].length;
      const cls = level <= 2 ? 'text-[15px] font-semibold text-[#F5E8C7] mt-3 mb-1.5 first:mt-0' : 'text-[13.5px] font-semibold text-[#e8e2d4] mt-2.5 mb-1 first:mt-0';
      blocks.push(<div key={`h${key}`} className={cls}>{inline(h[2], `h${key++}`)}</div>);
      continue;
    }
    const b = raw.match(BULLET);
    if (b) {
      flushPara();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(b[1]);
      continue;
    }
    const o = raw.match(ORDERED);
    if (o) {
      flushPara();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(o[1]);
      continue;
    }
    if (BLANK.test(raw)) {
      flushAll();
      continue;
    }
    // Plain text line — close any open list, accumulate into the paragraph.
    // Strip a leading blockquote marker rather than rendering it literally.
    flushList();
    para.push(raw.replace(/^\s*>\s?/, ''));
  }
  flushAll();

  return <>{blocks}</>;
}

export default Markdownish;
