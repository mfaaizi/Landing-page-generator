import { z } from "zod";
import {
  CuratedImage,
  SectionStatus,
  SectionStyle,
  requireItemCount,
  text,
} from "./primitives";

export const TESTIMONIALS_VARIANTS = [
  "glass-carousel",   // swipeable blurred cards, active card lifted in Z
  "floating-cards",   // scattered cards at different depths, gentle drift
  "single-spotlight", // one large quote under a cursor-follow glow
  "depth-marquee",    // slow horizontal marquee, rows at two parallax depths
] as const;

export const TestimonialsVariant = z.enum(TESTIMONIALS_VARIANTS);
export type TestimonialsVariant = z.infer<typeof TestimonialsVariant>;

export const Testimonial = z.object({
  quote: text(220),
  name: text(40),
  role: text(60).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  avatar: CuratedImage.optional(),
});
export type Testimonial = z.infer<typeof Testimonial>;

export const TestimonialsContent = z.object({
  headline: text(60),
  subheadline: text(160).optional(),
  items: z.array(Testimonial).min(1).max(4),
});
export type TestimonialsContent = z.infer<typeof TestimonialsContent>;

const TESTIMONIALS_ITEM_RANGE = {
  "glass-carousel": [2, 4],
  "floating-cards": [3, 4],
  "single-spotlight": [1, 1],
  "depth-marquee": [3, 4],
} as const satisfies Record<TestimonialsVariant, readonly [number, number]>;

export const TestimonialsGenerationBase = z.object({
  variant: TestimonialsVariant,
  content: TestimonialsContent,
});

export const TestimonialsGeneration = TestimonialsGenerationBase
  .superRefine(requireItemCount(TESTIMONIALS_ITEM_RANGE));
export type TestimonialsGeneration = z.infer<typeof TestimonialsGeneration>;

export const TestimonialsSection = z.object({
  id: z.string(),
  type: z.literal("testimonials"),
  variant: TestimonialsVariant,
  content: TestimonialsContent,
  style: SectionStyle,
  status: SectionStatus,
});
export type TestimonialsSection = z.infer<typeof TestimonialsSection>;

/** Single quote, so the fallback shows one clearly-labelled sample rather than four invented ones. */
export const TESTIMONIALS_FALLBACK_VARIANT: TestimonialsVariant = "single-spotlight";
