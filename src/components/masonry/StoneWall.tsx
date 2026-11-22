import type { CSSProperties } from "react";

/**
 * A photograph laid through courses of dry-stone blocks, after the Great Zimbabwe walls.
 * One picture sits under every course; an SVG overlay draws the joints and gives each
 * block its own stone tone. The coursing is deterministic (seeded), so the wall never
 * reshuffles between renders.
 */

type Block = { x: number; w: number; tone: number; light: boolean; warm: boolean };
type Course = { top: number; h: number; sw: number; blocks: Block[] };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWall(seed: number, heights: number[]): Course[] {
  const rand = mulberry32(seed);
  const total = heights.reduce((s, h) => s + h, 0);
  let top = 0;
  return heights.map((rawH) => {
    const h = (rawH / total) * 100;
    const blocks: Block[] = [];
    let x = -rand() * 10; // each course starts mid-block, so vertical joints never stack
    while (x < 100) {
      const w = 16 + rand() * 20;
      blocks.push({
        x,
        w,
        tone: 0.1 + rand() * 0.3,
        light: rand() > 0.55,
        warm: rand() > 0.5,
      });
      x += w;
    }
    const course = { top, h, sw: 2 + rand() * 2.2, blocks };
    top += h;
    return course;
  });
}

const JOINT = "hsl(220 18% 7%)";

export default function StoneWall({
  src,
  alt,
  heights = [17, 21, 16, 24, 22],
  seed = 7,
  position = "center 30%",
  phonePosition,
  className = "",
}: {
  src: string;
  alt: string;
  heights?: number[];
  seed?: number;
  position?: string;
  phonePosition?: string;
  className?: string;
}) {
  const courses = buildWall(seed, heights);
  const vars = {
    "--pos-d": position,
    "--pos-m": phonePosition ?? position,
  } as CSSProperties;

  return (
    <div className={`relative isolate overflow-hidden bg-shadow ${className}`} style={vars} role="img" aria-label={alt}>
      {courses.map((c, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="course-lay absolute inset-x-0 overflow-hidden"
          style={{ top: `${c.top}%`, height: `${c.h}%`, ["--lay-i" as string]: courses.length - 1 - i }}
        >
          <img
            src={src}
            alt=""
            decoding="async"
            className="absolute left-0 w-full max-w-none object-cover [object-position:var(--pos-m)] md:[object-position:var(--pos-d)]"
            style={{ height: `${(100 / c.h) * 100}%`, top: `-${(c.top / c.h) * 100}%` }}
          />
        </div>
      ))}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {courses.map((c, ci) =>
          c.blocks.map((b, bi) => {
            const y2 = c.top + c.h;
            return (
              <g key={`${ci}-${bi}`} vectorEffect="non-scaling-stroke">
                {/* the dressed face: its own luminance and a warm or cool cast */}
                <rect
                  x={b.x}
                  y={c.top}
                  width={b.w}
                  height={c.h}
                  rx={0.35}
                  fill={b.light ? "hsl(40 30% 92%)" : b.warm ? "hsl(28 28% 7%)" : "hsl(215 22% 6%)"}
                  fillOpacity={b.light ? b.tone * 0.5 : b.tone}
                />
                {/* sun catches the top and left edges */}
                <path
                  d={`M ${b.x} ${y2} L ${b.x} ${c.top} L ${b.x + b.w} ${c.top}`}
                  fill="none"
                  stroke="hsl(40 40% 96%)"
                  strokeOpacity={0.32}
                  strokeWidth={1.6}
                  vectorEffect="non-scaling-stroke"
                />
                {/* the recessed joint */}
                <rect
                  x={b.x}
                  y={c.top}
                  width={b.w}
                  height={c.h}
                  rx={0.35}
                  fill="none"
                  stroke={JOINT}
                  strokeOpacity={0.9}
                  strokeWidth={c.sw}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
