import type { Vibe } from "@/lib/schemas/brief";
import type { SectionType } from "@/lib/schemas/primitives";

/**
 * Metadata only — no components yet. The prompt builder uses `guidance` so the
 * model can pick a layout; the thumbnail chooser uses `label`. Variant ids never
 * reach the user's screen.
 *
 * When the variant library lands, registry.ts maps id → component and imports
 * this file for the labels, so there's one source of truth for what exists.
 */
export type VariantMeta = {
  id: string;
  /** Shown under the animated thumbnail. Plain language, sentence case. */
  label: string;
  /** One line telling the model when this layout is the right call. */
  guidance: string;
  vibes: Vibe[];
  /** Content slots this layout needs — mirrors the zod refinements, for the prompt. */
  needs?: string[];
};

export const VARIANT_CATALOG: Record<SectionType, VariantMeta[]> = {
  hero: [
    {
      id: "aurora-veil",
      label: "Calm and glowing",
      guidance: "Centred copy over a slow-moving gradient. Safe for any business; best when there's no strong image.",
      vibes: ["calm", "premium", "minimal"],
    },
    {
      id: "floating-glass-split",
      label: "Bold and floating",
      guidance: "Copy on one side, a floating image card on the other. Use when the business is visual — food, spaces, physical products.",
      vibes: ["bold", "warm", "playful"],
      needs: ["image"],
    },
    {
      id: "spotlight-monolith",
      label: "Sharp and focused",
      guidance: "One tall panel with a light that follows the cursor. Use for services that sell on confidence rather than pictures.",
      vibes: ["technical", "premium", "minimal"],
    },
    {
      id: "orbital-stack",
      label: "Proof up front",
      guidance: "Headline with numbers orbiting it. Only when there are real figures worth leading with.",
      vibes: ["bold", "technical"],
      needs: ["proofPoints"],
    },
  ],
  features: [
    {
      id: "glass-grid",
      label: "Clean and even",
      guidance: "Equal cards in a grid. The dependable choice when the points are all of similar weight.",
      vibes: ["calm", "minimal", "technical"],
    },
    {
      id: "depth-bento",
      label: "One big idea",
      guidance: "Uneven tiles with one pushed forward. Use when one point clearly matters more than the rest.",
      vibes: ["bold", "premium"],
      needs: ["image"],
    },
    {
      id: "floating-column",
      label: "Told in order",
      guidance: "A vertical stack that drifts as you scroll. Use when the points read as steps or a sequence.",
      vibes: ["warm", "calm"],
    },
    {
      id: "orbit-ring",
      label: "Playful and circular",
      guidance: "Cards arranged around a glowing centre. Use for informal, creative or consumer businesses.",
      vibes: ["playful", "warm"],
    },
  ],
  testimonials: [
    {
      id: "glass-carousel",
      label: "Swipe through",
      guidance: "Two to four quotes on blurred cards, one lifted at a time.",
      vibes: ["calm", "premium", "technical"],
    },
    {
      id: "floating-cards",
      label: "Scattered and lively",
      guidance: "Quotes drifting at different depths. Use for warm, informal businesses.",
      vibes: ["playful", "warm", "bold"],
    },
    {
      id: "single-spotlight",
      label: "One strong voice",
      guidance: "A single large quote under a soft glow. Use when there is only one quote worth showing.",
      vibes: ["premium", "minimal", "calm"],
    },
    {
      id: "depth-marquee",
      label: "Always moving",
      guidance: "Quotes scrolling sideways at two depths. Use when volume of praise is the point.",
      vibes: ["bold", "playful"],
    },
  ],
  cta: [
    {
      id: "glow-band",
      label: "Direct and bright",
      guidance: "A full-width band with one pulsing button. Best for a single, obvious next step.",
      vibes: ["bold", "playful"],
    },
    {
      id: "glass-monolith",
      label: "Quiet and premium",
      guidance: "A floating glass panel over moving colour. Safe default for anything considered or high-value.",
      vibes: ["premium", "calm", "minimal"],
    },
    {
      id: "split-orbital",
      label: "Show and ask",
      guidance: "Copy beside an image on depth layers. Use when a final visual helps close.",
      vibes: ["warm", "bold"],
      needs: ["image"],
    },
    {
      id: "aurora-wave",
      label: "Soft and sweeping",
      guidance: "A moving wave gradient carrying the copy. Use for calm, human-facing services.",
      vibes: ["calm", "warm", "technical"],
      needs: ["subheadline"],
    },
  ],
};

/** Compact list for prompts: `id — guidance (needs: x)`. */
export function describeVariants(type: SectionType): string {
  return VARIANT_CATALOG[type]
    .map((v) => `- ${v.id} — ${v.guidance}${v.needs ? ` (requires: ${v.needs.join(", ")})` : ""}`)
    .join("\n");
}
