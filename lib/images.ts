import type { CuratedImage } from "@/lib/schemas/primitives";

/**
 * Images come from a local curated set, never a live API. The model picks a
 * category; this picks the file. Drop photos into
 *   public/images/curated/<category>/1.jpg, 2.jpg, 3.jpg ...
 * and raise the count below. Until a file exists, the CuratedImage component
 * renders a generative tile in the page's accent, so nothing is ever broken.
 */
export const CURATED_COUNTS: Record<CuratedImage["category"], number> = {
  "people-team": 3,
  "people-portrait": 3,
  workspace: 3,
  "product-object": 3,
  "food-drink": 3,
  nature: 3,
  architecture: 3,
  "texture-abstract": 3,
  "tools-craft": 3,
  "screens-tech": 3,
};

export function resolveImageSrc(image: CuratedImage, seed: number): string {
  const count = Math.max(1, CURATED_COUNTS[image.category] ?? 1);
  const index = 1 + (seed % count);
  return `/images/curated/${image.category}/${index}.jpg`;
}
