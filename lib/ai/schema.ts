import { z } from "zod";

/**
 * Gemini's responseSchema accepts a narrow OpenAPI subset: no $schema, no $ref,
 * no additionalProperties, no const, no format on strings it doesn't know.
 * Zod 4 emits draft-2020-12 JSON Schema, so this sanitises the difference.
 *
 * Constraining the model this way is what turns most would-be retries into
 * first-attempt passes; the zod parse in generate.ts is still the real gate.
 */

const ALLOWED = new Set([
  "type",
  "description",
  "enum",
  "items",
  "properties",
  "required",
  "nullable",
  "minItems",
  "maxItems",
  "propertyOrdering",
]);

function sanitise(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(sanitise);
  if (!node || typeof node !== "object") return node;

  const input = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED.has(key)) continue;
    if (key === "properties" && value && typeof value === "object") {
      const props: Record<string, unknown> = {};
      for (const [name, sub] of Object.entries(value as Record<string, unknown>)) {
        props[name] = sanitise(sub);
      }
      out.properties = props;
      // Stable key order improves output quality on flash-tier models.
      out.propertyOrdering = Object.keys(props);
      continue;
    }
    out[key] = sanitise(value);
  }

  // A union that survived as anyOf can't be expressed; collapse to a free string
  // and let zod reject anything wrong. This should not fire for our schemas.
  if (!out.type && (input.anyOf || input.oneOf)) out.type = "string";

  return out;
}

export function toGeminiSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, {
    target: "draft-7",
    io: "input",
    // Gemini can't follow $ref, so shared sub-schemas must be inlined.
    reused: "inline",
  });
  return sanitise(json) as Record<string, unknown>;
}
