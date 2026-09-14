import type { BusinessBrief, FollowUpQuestion } from "@/lib/schemas/brief";

export const BRIEF_SYSTEM = `You turn a plain description of a small business into structured data for a landing page builder.

The person writing the description is not technical. They will never see your output, and they will never see words like "hero", "CTA", "section" or "variant". Do not use that vocabulary in any question you write.

Rules:
- Infer only what the description supports. Do not invent figures, awards, prices or claims.
- whatTheyDo: one plain sentence in the business's own terms.
- vibe: one or two values that match how the person writes, not how you would market them.
- brandColor: only if a colour is actually mentioned. Otherwise leave it out.
- hasCustomers: true only if the description implies the business is already trading. A business described as opening soon, launching or starting up is false.
- keyPoints: if the person listed things, use theirs. If they didn't, name three to five ordinary things a business of this kind plainly offers — a bakery sells bread and takes cake orders; a plumber does callouts and fits bathrooms. These are category facts, not claims. Never invent anything checkable: no prices, no figures, no years in business, no awards, no named people, no opening hours.
- sections: always include "hero", "features" and "cta" — a page without the middle is not a landing page. Include "testimonials" only when hasCustomers is true, because quotes from customers who may not exist are not something to invent.
- If something essential is missing, ask at most two questions in the questions array, each in plain conversational language with two to four tappable suggestions. Ask about the business, never about layout.

Return JSON only.`;

/** Roughly the point below which a description can't carry a page on its own. */
const SPARSE_WORD_COUNT = 12;

export function isSparse(description: string): boolean {
  return description.trim().split(/\s+/).filter(Boolean).length < SPARSE_WORD_COUNT;
}

export function buildBriefPrompt(description: string): string {
  const base = `Business description:\n"""\n${description.trim()}\n"""`;
  if (!isSparse(description)) return base;

  // Whether to ask was previously left entirely to the model, which made it a
  // coin flip at this length — the same input asked follow-ups one run and
  // guessed the next. The decision is ours; the wording is still the model's.
  return `${base}

This description is very short. You must ask two questions rather than guessing: one about what they actually make or sell, and one about what a visitor should do. Fill in whatever else you can and leave the rest out.`;
}

/** Second pass: the original text plus whatever the follow-ups produced. */
export function buildBriefFollowUpPrompt(
  description: string,
  partial: Partial<BusinessBrief>,
  answers: { question: FollowUpQuestion; answer: string }[],
): string {
  const answered = answers
    .map((a) => `Q: ${a.question.question}\nA: ${a.answer}`)
    .join("\n\n");

  return `Business description:
"""
${description.trim()}
"""

What you inferred last time:
${JSON.stringify(partial, null, 2)}

The person has now answered your questions:
${answered}

Produce the complete brief. Do not ask anything further — fill any remaining gap with the most reasonable reading of what they said.`;
}
