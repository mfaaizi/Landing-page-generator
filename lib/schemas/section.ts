import { z } from "zod";
import { BusinessBrief } from "./brief";
import {
  CtaGeneration,
  CtaGenerationBase,
  CtaSection,
  CTA_FALLBACK_VARIANT,
} from "./cta";
import {
  FeaturesGeneration,
  FeaturesGenerationBase,
  FeaturesSection,
  FEATURES_FALLBACK_VARIANT,
} from "./features";
import {
  HeroGeneration,
  HeroGenerationBase,
  HeroSection,
  HERO_FALLBACK_VARIANT,
} from "./hero";
import { SectionType } from "./primitives";
import {
  TestimonialsGeneration,
  TestimonialsGenerationBase,
  TestimonialsSection,
  TESTIMONIALS_FALLBACK_VARIANT,
} from "./testimonials";

export { SECTION_TYPES, SectionType } from "./primitives";

/**
 * Stored/rendered shape. Members are refinement-free ZodObjects because
 * z.discriminatedUnion needs plain objects — the variant slot rules are enforced
 * at the generation boundary (the *Generation schemas below), which is the only
 * place untrusted data enters. Anything already stored has passed that gate.
 */
export const Section = z.discriminatedUnion("type", [
  HeroSection,
  FeaturesSection,
  TestimonialsSection,
  CtaSection,
]);
export type Section = z.infer<typeof Section>;

/**
 * The pipeline's dispatch table: generate → parse with GENERATION_SCHEMAS[type]
 * → on failure feed the zod error back once → on second failure use the fallback
 * content + FALLBACK_VARIANTS[type]. One code path for all four section types,
 * and for targeted edits too.
 */
export const GENERATION_SCHEMAS = {
  hero: HeroGeneration,
  features: FeaturesGeneration,
  testimonials: TestimonialsGeneration,
  cta: CtaGeneration,
} as const;

/** Same four schemas without refinements — used to build the model's responseSchema. */
export const GENERATION_BASE_SCHEMAS = {
  hero: HeroGenerationBase,
  features: FeaturesGenerationBase,
  testimonials: TestimonialsGenerationBase,
  cta: CtaGenerationBase,
} as const;

export const FALLBACK_VARIANTS = {
  hero: HERO_FALLBACK_VARIANT,
  features: FEATURES_FALLBACK_VARIANT,
  testimonials: TESTIMONIALS_FALLBACK_VARIANT,
  cta: CTA_FALLBACK_VARIANT,
} as const;

export type GenerationFor<T extends SectionType> = z.infer<(typeof GENERATION_SCHEMAS)[T]>;

/* --------------------------------------------------------------- project */

export const ThemeMode = z.enum(["light", "dark"]);

export const Project = z.object({
  id: z.string(),
  /** Verbatim text the user typed. Kept so a re-parse is possible without asking again. */
  rawDescription: z.string().min(1),
  brief: BusinessBrief,
  sections: z.array(Section).min(1),
  previewTheme: ThemeMode.default("dark"),
  createdAt: z.coerce.date(),
});
export type Project = z.infer<typeof Project>;

/** Log only. Never rendered, so it keeps the honest "failed" state. */
export const GenerationAttempt = z.object({
  id: z.string(),
  projectId: z.string(),
  sectionId: z.string(),
  sectionType: SectionType,
  attemptNumber: z.number().int().min(1).max(2),
  outcome: z.enum(["valid", "schema-error", "api-error", "fallback"]),
  error: z.string().optional(),
  createdAt: z.coerce.date(),
});
export type GenerationAttempt = z.infer<typeof GenerationAttempt>;
