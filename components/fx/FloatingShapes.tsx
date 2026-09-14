"use client";

import { motion, useReducedMotion } from "framer-motion";
import { rngFrom } from "@/lib/seed";

type Kind = "orb" | "ring" | "slab" | "coin";

/**
 * Depth-layered shapes that drift on their own loops. Count, kind, position,
 * size and timing are all seeded, so the same business always gets the same
 * arrangement and two businesses never share one. Everything is CSS 3D plus
 * Framer Motion; no WebGL.
 */
export function FloatingShapes({
  seed,
  count = 3,
  kinds = ["orb", "ring", "slab", "coin"],
  className = "",
}: {
  seed: number;
  count?: number;
  kinds?: Kind[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const rng = rngFrom(seed);
  const shapes = Array.from({ length: count }, (_, i) => ({
    kind: rng.pick(kinds),
    x: rng.int(4, 92),
    y: rng.int(6, 88),
    size: rng.int(56, 180),
    depth: rng.next(), // 0 = far, 1 = near
    drift: 10 + rng.int(0, 14),
    dur: 9 + rng.int(0, 9),
    delay: rng.next() * 3,
    rot: rng.int(-18, 18),
    tilt: rng.int(-30, 30),
    key: `${seed}-${i}`,
  }));

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      {shapes.map((s) => (
        <motion.div
          key={s.key}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.kind === "slab" ? s.size * 0.62 : s.size,
            translate: "-50% -50%",
            opacity: `calc(var(--page-shape-opacity) * ${0.35 + s.depth * 0.65})`,
            filter: `blur(${(1 - s.depth) * 2.5}px)`,
            zIndex: Math.round(s.depth * 3),
            transformStyle: "preserve-3d",
          }}
          initial={{ rotateX: s.tilt, rotateZ: s.rot, y: 0 }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -s.drift, 0],
                  rotateZ: [s.rot, s.rot + 6, s.rot],
                  rotateX: [s.tilt, s.tilt + 8, s.tilt],
                }
          }
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shape kind={s.kind} />
        </motion.div>
      ))}
    </div>
  );
}

function Shape({ kind }: { kind: Kind }) {
  const common: React.CSSProperties = { width: "100%", height: "100%", display: "block" };
  switch (kind) {
    case "orb":
      return (
        <div
          style={{
            ...common,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--accent-alt) 80%, white), color-mix(in srgb, var(--accent) 65%, var(--page-bg)) 60%, color-mix(in srgb, var(--accent) 30%, var(--page-bg)))",
            boxShadow: "0 30px 60px -30px color-mix(in srgb, var(--accent) 60%, transparent)",
          }}
        />
      );
    case "ring":
      return (
        <div
          style={{
            ...common,
            borderRadius: "50%",
            border: "10px solid color-mix(in srgb, var(--accent) 55%, var(--page-glass-border))",
            boxShadow: "inset 0 0 30px color-mix(in srgb, var(--accent-alt) 30%, transparent)",
          }}
        />
      );
    case "coin":
      return (
        <div
          style={{
            ...common,
            borderRadius: "50%",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-alt) 60%, var(--page-surface)), color-mix(in srgb, var(--accent) 45%, var(--page-surface)))",
            border: "1px solid var(--page-glass-border)",
            transform: "rotateX(58deg)",
          }}
        />
      );
    default:
      return (
        <div
          className="glass"
          style={{
            ...common,
            borderRadius: "22%",
            background: "linear-gradient(160deg, color-mix(in srgb, var(--accent) 22%, var(--page-glass)), var(--page-glass))",
          }}
        />
      );
  }
}
