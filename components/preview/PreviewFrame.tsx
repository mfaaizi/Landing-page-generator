"use client";

import { useEffect, useRef, useState } from "react";
import { SectionOverlay } from "./SectionOverlay";
import { SectionSkeleton, ThemeToggle, type PageTheme } from "./ThemeToggle";
import { ViewportToggle, VIEWPORTS, type ViewportKey } from "./ViewportToggle";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { BusinessBrief } from "@/lib/schemas/brief";
import type { SectionType } from "@/lib/schemas/primitives";
import type { Section } from "@/lib/schemas/section";
import { pageScopeVars } from "@/lib/theme/typography";

export type PreviewSlot =
  | { type: SectionType; state: "pending" }
  | { type: SectionType; state: "done"; section: Section; busy?: boolean };

/**
 * The frame sets an explicit width and is a CSS container, so sections respond
 * to the frame, not the browser. Variants use @container utilities only.
 * Theme lives on data-theme here; the tool chrome is untouched by it.
 */
export function PreviewFrame({
  brief,
  description,
  slots,
  onEdit,
  onVariant,
}: {
  brief: BusinessBrief;
  description: string;
  slots: PreviewSlot[];
  onEdit: (index: number, request: string) => void;
  onVariant: (index: number, variant: string) => void;
}) {
  const [viewport, setViewport] = useState<ViewportKey>("desktop");
  const [theme, setTheme] = useState<PageTheme>("dark");
  const [sweeping, setSweeping] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  const first = slots.find((s): s is Extract<PreviewSlot, { state: "done" }> => s.state === "done");
  const motion = first?.section.style.motion ?? "balanced";

  function switchTheme(next: PageTheme, origin: { x: number; y: number }) {
    const el = scopeRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sweep-x", `${((origin.x - r.left) / r.width) * 100}%`);
      el.style.setProperty("--sweep-y", `${((origin.y - r.top) / r.height) * 100}%`);
    }
    setSweeping(true);
    setTheme(next);
    window.setTimeout(() => setSweeping(false), 950);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewportToggle value={viewport} onChange={setViewport} />
        <ThemeToggle value={theme} onChange={switchTheme} />
      </div>

      <div className="overflow-x-auto rounded-2xl p-3" style={{ border: "1px solid var(--tool-border)", background: "var(--tool-panel)" }}>
        <div
          ref={scopeRef}
          className="page-scope mx-auto overflow-hidden rounded-xl"
          data-theme={theme}
          data-sweeping={sweeping ? "true" : undefined}
          style={{ width: VIEWPORTS[viewport], maxWidth: "100%", transition: "width 320ms cubic-bezier(0.2,0,0,1)", ...pageScopeVars(brief, motion) }}
        >
          {slots.map((slot, i) =>
            slot.state === "pending" ? (
              <SectionSkeleton key={`${slot.type}-${i}`} type={slot.type} />
            ) : (
              <div key={slot.section.id} className="relative">
                <SectionRenderer section={slot.section} />
                <SectionOverlay
                  section={slot.section}
                  theme={theme}
                  busy={Boolean(slot.busy)}
                  onEdit={(request) => onEdit(i, request)}
                  onVariant={(variant) => onVariant(i, variant)}
                />
              </div>
            ),
          )}

          {/* The chatbot overlay tracks the horizontal position of page-scope 
              but remains fixed to the bottom of the viewport vertically. */}
          <ChatOverlay scopeRef={scopeRef} brief={brief} description={description} />
        </div>
      </div>
    </div>
  );
}

/**
 * Ensures the floating ChatWidget remains visually bounded by the .page-scope
 * container (e.g. the 390px mobile view) while staying fixed to the bottom of 
 * the browser viewport vertically.
 */
function ChatOverlay({
  scopeRef,
  brief,
  description,
}: {
  scopeRef: React.RefObject<HTMLDivElement | null>;
  brief: BusinessBrief;
  description: string;
}) {
  const [rightOffset, setRightOffset] = useState(24);

  useEffect(() => {
    function update() {
      if (!scopeRef.current) return;
      const rect = scopeRef.current.getBoundingClientRect();
      const distanceToRightEdge = window.innerWidth - rect.right;
      // Position the widget 24px (1.5rem) inside the right edge of the simulated device
      setRightOffset(Math.max(0, distanceToRightEdge) + 24);
    }

    update();
    window.addEventListener("resize", update);
    // Use capture phase to catch horizontal scrolling on the overflow-x container
    window.addEventListener("scroll", update, true); 
    
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [scopeRef]);

  return (
    <div style={{ "--chat-right": `${rightOffset}px` } as React.CSSProperties}>
      <ChatWidget brief={brief} description={description} />
    </div>
  );
}
