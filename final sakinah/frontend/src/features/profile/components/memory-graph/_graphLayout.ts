/**
 * Pure helpers for the Raya memory-graph viewer.
 *
 * The graph is laid out ONCE on a flat plane with a small deterministic
 * force pass, then frozen — the camera moves, the graph does not. Kept free of
 * React/three imports so it stays unit-testable.
 */

export type NodeType = 'user' | 'person' | 'place';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType | string;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
  predicate: string;
  valid_from?: string | number | null;
  valid_to?: string | number | null;
  open?: boolean;
  confidence?: number;
}

export interface GraphAttr {
  node: string;
  kind: string;
  value: string;
  valid_from?: string | number | null;
  valid_to?: string | number | null;
  open?: boolean;
}

export interface MemoryGraphData {
  enabled: boolean;
  nodes: GraphNode[];
  links: GraphLink[];
  attrs: GraphAttr[];
}

export interface Placed {
  x: number;
  z: number;
  degree: number;
}

/** Epoch-ms from an ISO string, epoch number (s or ms), or Firestore-ish {seconds}. */
export function parseTime(v: string | number | null | undefined | { seconds?: number; _seconds?: number }): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return v > 1e12 ? v : v * 1000;
  if (typeof v === 'object') {
    const s = v.seconds ?? v._seconds;
    return s != null ? s * 1000 : null;
  }
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

/**
 * Is a dated fact valid at scrub time `t`?
 * `t === Infinity` means the "now" view → only currently-open facts (valid_to == null).
 */
export function activeAt(from: number | null, to: number | null, t: number): boolean {
  if (t === Infinity) return to == null;
  if (from != null && t < from) return false;
  if (to != null && t >= to) return false;
  return true;
}

/**
 * Deterministic 2D force layout, returned as plane coords (x, z) per node id.
 * Fruchterman–Reingold-style; "user" is pinned at the centre so the map always
 * anchors on the person whose graph it is. No RNG → stable across reloads.
 */
export function layoutGraph(nodes: GraphNode[], links: GraphLink[], spread = 1): Map<string, Placed> {
  const n = nodes.length;
  const pos = new Map<string, { x: number; y: number }>();
  // deterministic seed: spiral so initial positions never coincide
  nodes.forEach((nd, i) => {
    const a = (i / Math.max(1, n)) * Math.PI * 2 * 2.39996; // golden-angle spread
    const r = 14 + i * 1.5;
    pos.set(nd.id, { x: Math.cos(a) * r, y: Math.sin(a) * r });
  });

  const deg = new Map<string, number>(nodes.map((nd) => [nd.id, 0]));
  for (const l of links) {
    deg.set(l.source, (deg.get(l.source) ?? 0) + 1);
    deg.set(l.target, (deg.get(l.target) ?? 0) + 1);
  }

  const k = 36 * spread; // ideal edge length
  const hasUser = pos.has('user');
  const ITER = 300;

  for (let iter = 0; iter < ITER; iter++) {
    const temp = 1 - iter / ITER;
    const disp = new Map<string, { x: number; y: number }>(nodes.map((nd) => [nd.id, { x: 0, y: 0 }]));

    // repulsion (all pairs — fine for tiny per-user graphs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos.get(nodes[i].id)!;
        const b = pos.get(nodes[j].id)!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const f = (k * k) / d;
        const ux = dx / d;
        const uy = dy / d;
        const di = disp.get(nodes[i].id)!;
        const dj = disp.get(nodes[j].id)!;
        di.x += ux * f;
        di.y += uy * f;
        dj.x -= ux * f;
        dj.y -= uy * f;
      }
    }

    // attraction along edges
    for (const l of links) {
      const a = pos.get(l.source);
      const b = pos.get(l.target);
      if (!a || !b) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.hypot(dx, dy) || 0.01;
      const f = (d * d) / k;
      const ux = dx / d;
      const uy = dy / d;
      disp.get(l.source)!.x -= ux * f;
      disp.get(l.source)!.y -= uy * f;
      disp.get(l.target)!.x += ux * f;
      disp.get(l.target)!.y += uy * f;
    }

    const maxStep = 8 * temp + 0.5;
    for (const nd of nodes) {
      if (hasUser && nd.id === 'user') {
        const p = pos.get(nd.id)!;
        p.x = 0;
        p.y = 0;
        continue;
      }
      const p = pos.get(nd.id)!;
      const d = disp.get(nd.id)!;
      // mild gravity so disconnected nodes don't drift off the plane
      d.x -= p.x * 0.04;
      d.y -= p.y * 0.04;
      const dl = Math.hypot(d.x, d.y) || 0.01;
      p.x += (d.x / dl) * Math.min(dl, maxStep);
      p.y += (d.y / dl) * Math.min(dl, maxStep);
    }
  }

  // scale to a comfortable footprint
  const xs = [...pos.values()].map((p) => p.x);
  const ys = [...pos.values()].map((p) => p.y);
  const ext = Math.max(1, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const scale = 200 / ext;

  const out = new Map<string, Placed>();
  for (const nd of nodes) {
    const p = pos.get(nd.id)!;
    out.set(nd.id, { x: p.x * scale, z: p.y * scale, degree: deg.get(nd.id) ?? 0 });
  }
  return out;
}

export const TYPE_COLOR: Record<string, string> = {
  user: '#e8c879',
  person: '#7aa2ff',
  place: '#5fd0c4',
};

export function nodeRadius(degree: number, isUser: boolean): number {
  return 2.4 + Math.min(5, degree) * 0.55 + (isUser ? 1.6 : 0);
}
