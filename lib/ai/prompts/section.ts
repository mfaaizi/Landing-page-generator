import type { BusinessBrief } from "@/lib/schemas/brief";
import type { Section, SectionType } from "@/lib/schemas/section";
import { describeVariants } from "@/lib/variants/catalog";

/**
 * Copy quality is doing as much work here as the visuals. Generic marketing
 * copy makes every page feel like the same template no matter how different the
 * layouts are, so the constraints below are deliberately about what NOT to write.
 */
export const SECTION_SYSTEM = `You write the words for one section of a landing page, and choose which layout that section uses.

You never write code. You return content and a layout id, nothing else.

Writing rules:
- Write as this specific business would speak, using the details in the brief. If a sentence would fit any business in the same industry, rewrite it.
- Say what the business is or does. Do not sell it with adjectives.
- No filler openers: "Welcome to", "We are passionate about", "Your one-stop", "Elevate your", "Unlock", "Seamless", "Cutting-edge", "Take your X to the next level".
- Sentence case everywhere. Never ALL CAPS, not even for short labels.
- Buttons say what happens: "Book a table", not "Learn more" or "Submit".
- You may name ordinary things a business of this kind does. You may not invent anything checkable: no prices, no years in business, no customer counts, no awards, no opening hours, unless they are in the brief.
- Respect every length limit. A truncated headline is a failed generation.

Return JSON only.`;

function briefBlock(brief: BusinessBrief): string {
  return `Business: ${brief.businessName}
What they do: ${brief.whatTheyDo}
Who it's for: ${brief.audience}
Tone: ${brief.vibe.join(", ")}
What a visitor should do: ${brief.desiredAction}
Worth mentioning: ${brief.keyPoints.length ? brief.keyPoints.join("; ") : "nothing specific given"}
Already trading: ${brief.hasCustomers ? "yes" : "no"}
Image world: ${brief.imageWorld}`;
}

const SECTION_TASK: Record<SectionType, string> = {
  hero: "Write the opening of the page: the first thing a visitor reads. The headline must not be the business name followed by its category — \"Johar Town Bakery makes baked goods\" is a restatement, not a headline. Say the thing a customer actually cares about, in the concrete language of this trade. The supporting line adds something the headline doesn't, and then the main action.",
  features:
    "Write the part of the page that explains what the business offers. Each item is one concrete thing a customer can picture, not a benefit slogan — \"Cakes to order, three days' notice\" rather than \"Quality you can trust\". Work from the brief's key points; if two of them overlap, merge them rather than padding to fill the layout.",
  testimonials:
    "Write the customer quotes section. Quotes must read like a real person typed them — specific, uneven, occasionally plain. If the brief gives no real customer detail, keep it to one short quote and use \"Sample customer\" as the name so it is obvious it needs replacing.",
  cta: "Write the closing ask. One line that makes the action feel easy, and the button that performs it. Do not repeat the hero headline.",
};

export function buildSectionPrompt(type: SectionType, brief: BusinessBrief): string {
  return `${briefBlock(brief)}

Task: ${SECTION_TASK[type]}

Available layouts — pick the one that fits this business, and make sure you fill any slot it requires:
${describeVariants(type)}`;
}

/** Targeted edit: the existing section goes in as context so unrelated slots survive. */
export function buildEditPrompt(
  section: Section,
  brief: BusinessBrief,
  request: string,
  allowVariantChange: boolean,
): string {
  return `${briefBlock(brief)}

This section currently reads:
${JSON.stringify({ variant: section.variant, content: section.content }, null, 2)}

The person asked for this change, in their words:
"""
${request.trim()}
"""

Apply only that change. Keep every other slot exactly as it is — same wording, same items, same order. ${
    allowVariantChange
      ? `You may switch layout if the request is about how it looks:\n${describeVariants(section.type)}`
      : `Keep the layout id "${section.variant}" unchanged.`
  }`;
}

/**
 * The repair turn. Fed back verbatim on attempt two — a compact list of what
 * zod rejected, which is far more effective than restating the whole schema.
 */
export function buildRepairPrompt(previous: string, problems: string[]): string {
  return `${previous}

Your previous answer was rejected:
${problems.map((p) => `- ${p}`).join("\n")}

Return the corrected JSON. Change only what was rejected.`;
}
