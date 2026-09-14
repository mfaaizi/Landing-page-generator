"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * A soft radial light that trails the pointer over the parent. Mount it inside
 * a `position: relative` section; it listens on that parent, not the window,
 * so the glow stays inside the section it belongs to.
 */
export function CursorGlow({ size = 520, strength = 0.22 }: { size?: number; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 120, damping: 24, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 24, mass: 0.6 });

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const move = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      x.set(e.clientX - r.left - size / 2);
      y.set(e.clientY - r.top - size / 2);
    };
    const leave = () => {
      x.set(-9999);
      y.set(-9999);
    };
    parent.addEventListener("pointermove", move);
    parent.addEventListener("pointerleave", leave);
    return () => {
      parent.removeEventListener("pointermove", move);
      parent.removeEventListener("pointerleave", leave);
    };
  }, [x, y, size]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{
          x: sx,
          y: sy,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, color-mix(in srgb, var(--accent) ${Math.round(strength * 100)}%, transparent), transparent 62%)`,
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
