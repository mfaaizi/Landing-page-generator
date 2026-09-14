import { z } from "zod";
import {
  CtaLink,
  CuratedImage,
  SectionStatus,
  SectionStyle,
  requireSlots,
  text,
} from "./primitives";

export const CTA_VARIANTS = [
  "glow-band",        // full-width band, pulsing glow behind a single button
  "glass-monolith",   // centred glass slab floating over a moving mesh gradient
  "split-orbital",    // copy one side, image orbiting on depth layers the other
  "aurora-wave",      // animated wave gradient, copy riding the crest
] as const;

export const CtaVariant = z.enum(CTA_VARIANTS);
export type CtaVariant = z.infer<typeof CtaVariant>;

export const CtaContent = z.object({
  headline: text(60),
  subheadline: text(140).optional(),
  primaryCta: CtaLink,
  secondaryCta: CtaLink.optional(),
  /** Short line under the button, e.g. "Open seven days a week". */
  reassurance: text(48).optional(),
  image: CuratedImage.optional(),
});
export type CtaContent = z.infer<typeof CtaContent>;

const CTA_REQUIRED_SLOTS = {
  "glow-band": [],
  "glass-monolith": [],
  "split-orbital": ["image"],
  "aurora-wave": ["subheadline"],
} as const satisfies Record<CtaVariant, readonly (keyof CtaContent & string)[]>;

export const CtaGenerationBase = z.object({ variant: CtaVariant, content: CtaContent });

export const CtaGeneration = CtaGenerationBase.superRefine(requireSlots(CTA_REQUIRED_SLOTS));
export type CtaGeneration = z.infer<typeof CtaGeneration>;

export const CtaSection = z.object({
  id: z.string(),
  type: z.literal("cta"),
  variant: CtaVariant,
  content: CtaContent,
  style: SectionStyle,
  status: SectionStatus,
});
export type CtaSection = z.infer<typeof CtaSection>;

export const CTA_FALLBACK_VARIANT: CtaVariant = "glass-monolith";
