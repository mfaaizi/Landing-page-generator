"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SectionChooser } from "@/components/chooser/SectionChooser";
import type { Section } from "@/lib/schemas/section";
import type { PageTheme } from "./ThemeToggle";

const PART_NAME: Record<Section["type"], string> = {
  hero: "the opening",
  features: "what you offer",
  testimonials: "customer quotes",
  cta: "the closing ask",
};

const SUGGESTIONS: Record<Section["type"], string[]> = {
  hero: ["Make the headline shorter", "Sound warmer", "Sound more confident", "Change the button text"],
  features: ["Make each point more specific", "Add one more point", "Sound less salesy"],
  testimonials: ["Make the quotes shorter", "Make them sound more casual"],
  cta: ["Make it feel more relaxed", "Make the button say something else", "Add a reassuring line"],
};

/**
 * Sits over a rendered section. On hover, shows one button. Clicking opens a
 * panel with a free-text box and a few suggestions, plus the layout chooser.
 * No section names, no variant ids; everything is phrased as the part of the
 * page the person is looking at.
 */
export function SectionOverlay({
  section,
  theme,
  busy,
  onEdit,
  onVariant,
}: {
  section: Section;
  theme: PageTheme;
  busy: boolean;
  onEdit: (request: string) => void;
  onVariant: (variant: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function submit(request: string) {
    if (!request.trim()) return;
    setOpen(false);
    setText("");
    onEdit(request.trim());
  }

  return (
    <>
      <div className="group pointer-events-none absolute inset-0 z-40">
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 2px color-mix(in srgb, var(--tool-accent) 60%, transparent)" }}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={busy}
          className="tool-button pointer-events-auto absolute right-3 top-3 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: "var(--tool-bg)" }}
        >
          Change {PART_NAME[section.type]}
        </button>
      </div>

      {busy && (
        <div
          className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
          style={{ background: "color-mix(in srgb, var(--page-bg) 70%, transparent)", backdropFilter: "blur(4px)" }}
        >
          <div className="glass px-4 py-2 text-sm" style={{ color: "var(--page-muted)" }}>Rewriting {PART_NAME[section.type]}…</div>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-x-3 top-3 z-50 @2xl:left-auto @2xl:w-[26rem]"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
            style={{ background: "var(--tool-bg)", border: "1px solid var(--tool-border)", borderRadius: "0.9rem", color: "var(--tool-text)", padding: "1rem", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--tool-muted)" }}>What would you like to change about {PART_NAME[section.type]}?</span>
              <button type="button" className="tool-button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            <textarea
              className="tool-input"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say it in your own words…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(text);
                }
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS[section.type].map((s) => (
                <button key={s} type="button" className="tool-button" onClick={() => submit(s)}>{s}</button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button type="button" className="tool-button primary" onClick={() => submit(text)} disabled={!text.trim()}>Update</button>
            </div>
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--tool-border)" }}>
              <div className="mb-2 text-sm" style={{ color: "var(--tool-muted)" }}>Or pick a different look</div>
              <SectionChooser section={section} theme={theme} onPick={(v) => { setOpen(false); onVariant(v); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
