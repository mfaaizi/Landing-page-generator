"use client";

import { rngFrom } from "@/lib/seed";

/**
 * Three soft blobs on independent drift loops. Colours come from the section
 * accent pair, desaturated by mixing toward the page background, which is what
 * keeps this from reading as the flat purple-to-pink default.
 */
export function MeshGradient({
  seed,
  intensity = 1,
  className = "",
}: {
  seed: number;
  intensity?: number;
  className?: string;
}) {
  const rng = rngFrom(seed);
  const blobs = [
    { x: rng.int(5, 40), y: rng.int(0, 40), s: rng.int(45, 70), anim: "mesh-drift-a", dur: 18 + rng.int(0, 10), color: "var(--accent)" },
    { x: rng.int(50, 90), y: rng.int(10, 60), s: rng.int(40, 65), anim: "mesh-drift-b", dur: 22 + rng.int(0, 10), color: "var(--accent-alt)" },
    { x: rng.int(20, 70), y: rng.int(50, 95), s: rng.int(35, 60), anim: "mesh-drift-c", dur: 26 + rng.int(0, 12), color: "var(--accent)" },
  ];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: `calc(var(--page-mesh-opacity) * ${intensity})` }}
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.s}%`,
            aspectRatio: "1",
            translate: "-50% -50%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 40%, color-mix(in srgb, ${b.color} 70%, var(--page-bg)), transparent 65%)`,
            filter: "blur(48px)",
            animation: `${b.anim} ${b.dur}s ease-in-out infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
