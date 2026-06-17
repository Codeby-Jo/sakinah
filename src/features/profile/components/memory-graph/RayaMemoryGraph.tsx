/**
 * Raya memory-graph — fixed-plane 3D viewer (React / @react-three/fiber).
 *
 * The graph is laid out once on a flat plane and frozen; the user orbits the
 * CAMERA around it (no live physics). Hover a node to highlight its
 * relationships; scrub time to watch facts supersede (e.g. London → Madrid).
 *
 * Heavy (pulls in three) — always import this lazily so it code-splits.
 */
import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Billboard, Grid, Line, OrbitControls, Text } from '@react-three/drei';

import {
  activeAt,
  layoutGraph,
  nodeRadius,
  parseTime,
  TYPE_COLOR,
  type GraphLink,
  type MemoryGraphData,
} from './_graphLayout';

const PLANE_Y = 0;

interface SceneProps {
  data: MemoryGraphData;
  showLabels: boolean;
  showSuperseded: boolean;
  time: number;
  hovered: string | null;
  setHovered: (id: string | null) => void;
}

function Scene({ data, showLabels, showSuperseded, time, hovered, setHovered }: SceneProps) {
  const placed = useMemo(() => layoutGraph(data.nodes, data.links, 1), [data]);

  const neighbours = useMemo(() => {
    if (!hovered) return null;
    const set = new Set<string>([hovered]);
    for (const l of data.links) {
      if (l.source === hovered) set.add(l.target);
      if (l.target === hovered) set.add(l.source);
    }
    return set;
  }, [hovered, data.links]);

  const linkVisible = (l: GraphLink): boolean => {
    const open = l.open ?? l.valid_to == null;
    const from = parseTime(l.valid_from ?? null);
    const to = parseTime(l.valid_to ?? null);
    if (time !== Infinity) return activeAt(from, to, time);
    return open || showSuperseded;
  };

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[60, 140, 40]} intensity={0.6} />
      <Grid
        position={[0, PLANE_Y - 0.2, 0]}
        args={[600, 600]}
        cellSize={10}
        cellColor="#171d2e"
        sectionSize={50}
        sectionColor="#2a3350"
        fadeDistance={420}
        fadeStrength={1.5}
        infiniteGrid={false}
      />

      {/* edges */}
      {data.links.map((l, i) => {
        if (!linkVisible(l)) return null;
        const a = placed.get(l.source);
        const b = placed.get(l.target);
        if (!a || !b) return null;
        const open = l.open ?? l.valid_to == null;
        const past = !open && (time === Infinity || (parseTime(l.valid_to ?? null) ?? Infinity) <= time);
        const dim = neighbours ? !(l.source === hovered || l.target === hovered) : false;
        const mid: [number, number, number] = [(a.x + b.x) / 2, PLANE_Y + 3, (a.z + b.z) / 2];
        return (
          <group key={`e${i}`}>
            <Line
              points={[
                [a.x, PLANE_Y + 1.5, a.z],
                [b.x, PLANE_Y + 1.5, b.z],
              ]}
              color={past ? '#4a4f63' : '#6f7ba0'}
              lineWidth={open ? 1.4 : 1}
              dashed={!open}
              dashSize={3}
              gapSize={2}
              transparent
              opacity={dim ? 0.06 : past ? 0.28 : 0.6}
            />
            {showLabels && !dim && (
              <Billboard position={mid}>
                <Text fontSize={3.4} color="#9aa3bd" anchorX="center" anchorY="middle" outlineWidth={0.15} outlineColor="#0b0e17">
                  {l.label || l.predicate.toLowerCase().replace(/_/g, ' ')}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}

      {/* nodes */}
      {data.nodes.map((nd) => {
        const p = placed.get(nd.id);
        if (!p) return null;
        const isUser = nd.id === 'user';
        const r = nodeRadius(p.degree, isUser);
        const color = TYPE_COLOR[nd.type] ?? '#9aa3bd';
        const lit = !neighbours || neighbours.has(nd.id);
        return (
          <group key={nd.id} position={[p.x, PLANE_Y, p.z]}>
            {/* contact disc on the floor so position reads from above */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <circleGeometry args={[r * 1.7, 32]} />
              <meshBasicMaterial color={color} transparent opacity={lit ? 0.12 : 0.04} />
            </mesh>
            <mesh
              position={[0, r, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(nd.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[r, 24, 18]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={lit ? (hovered === nd.id ? 0.75 : 0.35) : 0.05}
                roughness={0.4}
                metalness={0.1}
                transparent
                opacity={lit ? 1 : 0.4}
              />
            </mesh>
            <Billboard position={[0, r + 7, 0]}>
              <Text
                fontSize={isUser ? 6 : 5}
                color={color}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.25}
                outlineColor="#0b0e17"
                fillOpacity={lit ? 1 : 0.3}
              >
                {nd.label || nd.id}
              </Text>
            </Billboard>
          </group>
        );
      })}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI * 0.495}
        minDistance={30}
        maxDistance={900}
        target={[0, 0, 0]}
      />
    </>
  );
}

export interface RayaMemoryGraphProps {
  data: MemoryGraphData;
}

export function RayaMemoryGraph({ data }: RayaMemoryGraphProps) {
  const [showLabels, setShowLabels] = useState(true);
  const [showSuperseded, setShowSuperseded] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrub, setScrub] = useState(1000); // 1000 == "now"

  const bounds = useMemo(() => {
    const stamps: number[] = [];
    const push = (v: unknown) => {
      const t = parseTime(v as never);
      if (t != null) stamps.push(t);
    };
    for (const l of data.links) {
      push(l.valid_from);
      push(l.valid_to);
    }
    for (const a of data.attrs) {
      push(a.valid_from);
      push(a.valid_to);
    }
    if (!stamps.length) return null;
    return { min: Math.min(...stamps), max: Math.max(...stamps) };
  }, [data]);

  const time = !bounds || scrub >= 1000 ? Infinity : bounds.min + ((bounds.max - bounds.min) * scrub) / 1000;
  const whenLabel =
    time === Infinity
      ? '— now —'
      : new Date(time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const hoveredNode = hovered ? data.nodes.find((n) => n.id === hovered) : null;
  const hoveredAttrs = hovered
    ? data.attrs.filter((a) => a.node === hovered && ((a.open ?? a.valid_to == null) || showSuperseded))
    : [];
  const hoveredRels = hovered
    ? data.links.filter((l) => (l.open ?? l.valid_to == null) && (l.source === hovered || l.target === hovered)).slice(0, 8)
    : [];
  const nameOf = (id: string) => data.nodes.find((n) => n.id === id)?.label ?? id;

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 120, 150], fov: 50 }} style={{ background: '#0b0e17' }}>
        <fog attach="fog" args={['#0b0e17', 180, 520]} />
        <Scene
          data={data}
          showLabels={showLabels}
          showSuperseded={showSuperseded}
          time={time}
          hovered={hovered}
          setHovered={setHovered}
        />
      </Canvas>

      {/* controls */}
      <div className="absolute left-4 top-4 w-60 rounded-2xl border border-[#D4A853]/20 bg-[#12172699]/90 p-4 text-[#E8ECF6] backdrop-blur-md">
        <p className="mb-3 text-xs text-[#9aa3bd]">Drag to orbit · scroll to zoom · hover a node</p>
        <label className="mb-2 flex items-center justify-between text-[13px]">
          <span>Edge labels</span>
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className="accent-[#e8c879]" />
        </label>
        <label className="mb-3 flex items-center justify-between text-[13px]">
          <span>Show past (superseded)</span>
          <input
            type="checkbox"
            checked={showSuperseded}
            onChange={(e) => setShowSuperseded(e.target.checked)}
            className="accent-[#e8c879]"
          />
        </label>
        {bounds && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span>Time</span>
              <span className="font-mono text-[11px] text-[#5fd0c4]">{whenLabel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              value={scrub}
              onChange={(e) => setScrub(Number(e.target.value))}
              className="w-full accent-[#5fd0c4]"
            />
          </div>
        )}
        <div className="border-t border-[#D4A853]/15 pt-2 text-[11px] text-[#9aa3bd]">
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: '#e8c879' }} />You</div>
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: '#7aa2ff' }} />Person</div>
          <div><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: '#5fd0c4' }} />Place</div>
        </div>
      </div>

      {/* hover detail */}
      {hoveredNode && (
        <div className="absolute right-4 top-4 max-w-[260px] rounded-2xl border border-[#D4A853]/20 bg-[#121726]/90 p-3 text-[#E8ECF6] backdrop-blur-md">
          <p className="text-sm font-bold">{hoveredNode.label}</p>
          <p className="mb-2 text-[10px] uppercase tracking-wide text-[#9aa3bd]">{hoveredNode.type}</p>
          {hoveredAttrs.map((a, i) => (
            <span
              key={i}
              className="mr-1.5 mb-1.5 inline-block rounded-full border border-[#5fd0c4]/30 bg-[#5fd0c4]/15 px-2 py-0.5 text-[10.5px] text-[#5fd0c4]"
            >
              {a.kind}: {a.value}
            </span>
          ))}
          {hoveredRels.map((l, i) => (
            <div key={i} className="mt-0.5 text-[11.5px]">
              {l.source === hovered ? '→' : '←'}{' '}
              <span className="text-[#e8c879]">{l.label || l.predicate.toLowerCase().replace(/_/g, ' ')}</span>{' '}
              {nameOf(l.source === hovered ? l.target : l.source)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RayaMemoryGraph;
