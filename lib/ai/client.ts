import { z } from "zod";
import { toGeminiSchema } from "./schema";

/**
 * Provider-independent model interface.
 * The rest of the generation pipeline does not need to know
 * whether we're using OpenRouter, Gemini, OpenAI, etc.
 */
export type ModelCall = (request: ModelRequest) => Promise<ModelResponse>;

export type ModelRequest = {
  system: string;
  user: string;
  responseSchema?: z.ZodType;
  temperature?: number;
};

export type ModelResponse = {
  data: unknown;
  raw: string;
};

export class ModelError extends Error {
  constructor(
    message: string,
    readonly kind:
      | "network"
      | "rate-limit"
      | "server"
      | "bad-json"
      | "auth"
      | "request",
  ) {
    super(message);
    this.name = "ModelError";
  }
}

const MODEL =
  process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Extract JSON from a Groq response.
 */
function parseJson(raw: string): unknown {
  let cleaned = raw.trim();

  // Remove BOM
  cleaned = cleaned.replace(/^\uFEFF/, "");

  // Remove markdown fences
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Sometimes models add a little text around the JSON.
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");

    if (objectStart !== -1 && objectEnd > objectStart) {
      try {
        return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
      } catch {
        // Continue to array attempt.
      }
    }

    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
    }

    throw new Error("Invalid JSON");
  }
}

export const groqJson: ModelCall = async (request) => {
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    throw new ModelError(
      "GROQ_API_KEY is not set",
      "auth",
    );
  }

  let systemContent = request.system;
  if (request.responseSchema) {
    const jsonSchema = toGeminiSchema(request.responseSchema);
    systemContent += `\n\nYou MUST respond with valid JSON strictly conforming to this JSON schema:\n${JSON.stringify(jsonSchema, null, 2)}`;
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: request.user },
    ],
    temperature: request.temperature ?? 0.9,
    max_tokens: 8192,
    response_format: { type: "json_object" },
  };

  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
  } catch (cause) {
    throw new ModelError(
      `Groq request failed: ${String(cause)}`,
      "network",
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    let kind: ModelError["kind"];

    if (response.status === 401 || response.status === 403) {
      kind = "auth";
    } else if (response.status === 429) {
      kind = "rate-limit";
    } else if (response.status >= 500) {
      kind = "server";
    } else {
      kind = "request";
    }

    throw new ModelError(
      `Groq responded ${response.status}: ${detail.slice(0, 500)}`,
      kind,
    );
  }

  let payload: {
    choices?: {
      message?: {
        content?: string | null;
      };
    }[];
    error?: {
      message?: string;
    };
  };

  try {
    payload = await response.json();
  } catch {
    throw new ModelError(
      "Groq returned invalid JSON",
      "bad-json",
    );
  }

  const raw = payload.choices
    ?.map((choice) => choice.message?.content ?? "")
    .join("")
    .trim();

  if (!raw) {
    throw new ModelError(
      payload.error?.message ??
      "Groq returned an empty response",
      "bad-json",
    );
  }

  try {
    const data = parseJson(raw);

    return {
      data,
      raw,
    };
  } catch {
    throw new ModelError(
      `Groq response was not valid JSON: ${raw.slice(0, 500)}`,
      "bad-json",
    );
  }
};

/**
 * Backwards-compatible name.
 *
 * Existing code can continue importing geminiJson without
 * changing the rest of the application.
 */
export const geminiJson = groqJson;