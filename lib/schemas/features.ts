import { z } from "zod";
import {
  CuratedImage,
  IconName,
  SectionStatus,
  SectionStyle,
  requireItemCount,
  requireSlots,
  text,
} from "./primitives";

export const FEATURES_VARIANTS = [
  "glass-grid",      // even grid of blurred translucent cards, staggered depth on scroll
  "depth-bento",     // uneven bento with one large tile pushed forward in Z
  "floating-column", // vertical stack, cards drift on parallax at different rates
  "orbit-ring",      // cards arranged around a glowing centre, slow rotation
] as const;

export const FeaturesVariant = z.enum(FEATURES_VARIANTS);
export type FeaturesVariant = z.infer<typeof FeaturesVariant>;

export const FeatureItem = z.object({
  title: text(40),
  body: text(140),
  icon: IconName,
});
export type FeatureItem = z.infer<typeof FeatureItem>;

export const FeaturesContent = z.object({
  headline: text(60),
  subheadline: text(160).optional(),
  items: z.array(FeatureItem).min(3).max(6),
  /** Only used by variants that pair the grid with a visual. */
  image: CuratedImage.optional(),
});
export type FeaturesContent = z.infer<typeof FeaturesContent>;

const FEATURES_REQUIRED_SLOTS = {
  "glass-grid": [],
  "depth-bento": ["image"],
  "floating-column": [],
  "orbit-ring": [],
} as const satisfies Record<FeaturesVariant, readonly (keyof FeaturesContent & string)[]>;

/** Layout constraints, not taste: an orbit of six cards collides, a bento of three has holes. */
const FEATURES_ITEM_RANGE = {
  "glass-grid": [3, 6],
  "depth-bento": [4, 5],
  "floating-column": [3, 4],
  "orbit-ring": [3, 5],
} as const satisfies Record<FeaturesVariant, readonly [number, number]>;

export const FeaturesGenerationBase = z.object({
  variant: FeaturesVariant,
  content: FeaturesContent,
});

export const FeaturesGeneration = FeaturesGenerationBase
  .superRefine(requireSlots(FEATURES_REQUIRED_SLOTS))
  .superRefine(requireItemCount(FEATURES_ITEM_RANGE));
export type FeaturesGeneration = z.infer<typeof FeaturesGeneration>;

export const FeaturesSection = z.object({
  id: z.string(),
  type: z.literal("features"),
  variant: FeaturesVariant,
  content: FeaturesContent,
  style: SectionStyle,
  status: SectionStatus,
});
export type FeaturesSection = z.infer<typeof FeaturesSection>;

export const FEATURES_FALLBACK_VARIANT: FeaturesVariant = "glass-grid";
