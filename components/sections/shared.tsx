"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { motionSeconds } from "@/lib/theme/typography";
import type { SectionStyle } from "@/lib/schemas/primitives";

/* ---------------------------------------------------------- SectionShell */

/**
 * Every variant sits in one of these. It establishes the 3D perspective the
 * floating layers need, the vertical rhythm, and the max width. Padding uses
 * container-query utilities (@md:, @3xl:) so it responds to the preview frame,
 * never the browser window.
 */
export function SectionShell({
  children,
  className = "",
  padded = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <section
      className={`relative overflow-hidden ${padded ? "px-6 py-20 @md:px-10 @3xl:px-16 @3xl:py-28" : ""} ${className}`}
      style={{ perspective: "1400px", ...style }}
    >
      {children}
    </section>
  );
}

export function Container({ children, className = "", narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return (
    <div className={`relative mx-auto w-full ${narrow ? "max-w-[52rem]" : "max-w-[74rem]"} ${className}`} style={{ zIndex: 2 }}>
      {children}
    </div>
  );
}

/* --------------------------------------------------------------- Reveal */

/**
 * Entrance: 22px rise + fade, ease-out, on first scroll into view. Children
 * with `index` stagger by 70ms each, capped so the total stays under 500ms.
 */
export function Reveal({
  children,
  index = 0,
  motion: m = "balanced",
  className = "",
  style,
  as = "div",
}: {
  children: ReactNode;
  index?: number;
  motion?: SectionStyle["motion"];
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "h1" | "h2" | "p";
}) {
  const reduce = useReducedMotion();
  const t = motionSeconds(m);
  const Tag = motion[as];
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: t.standard * 1.4, delay: Math.min(index, 6) * 0.07, ease: [0.2, 0, 0, 1] }}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------- Typography */

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-sm" style={{ color: "var(--accent)", fontWeight: 600, letterSpacing: "0.01em" }}>
      {children}
    </p>
  );
}

export function Display({
  children,
  size = "lg",
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  size?: "xl" | "lg" | "md";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const sizes = {
    xl: "text-[2.6rem] leading-[1.02] @md:text-[3.4rem] @3xl:text-[4.4rem]",
    lg: "text-[2rem] leading-[1.06] @md:text-[2.5rem] @3xl:text-[3.1rem]",
    md: "text-[1.5rem] leading-[1.12] @md:text-[1.8rem]",
  };
  return (
    <Tag
      className={`${sizes[size]} ${className}`}
      style={{ fontFamily: "var(--font-display)", fontWeight: 500, letterSpacing: "-0.025em", textWrap: "balance" }}
    >
      {children}
    </Tag>
  );
}

export function Lede({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[1.05rem] leading-relaxed @md:text-[1.15rem] ${className}`} style={{ color: "var(--page-muted)", maxWidth: "36rem", textWrap: "pretty" }}>
      {children}
    </p>
  );
}

export function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[0.95rem] leading-relaxed ${className}`} style={{ color: "var(--page-muted)" }}>
      {children}
    </p>
  );
}
