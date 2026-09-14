import { describe, expect, it } from "vitest";
import type { ModelCall } from "@/lib/ai/client";
import { parseBrief } from "@/lib/ai/generate";
import { isSparse } from "@/lib/ai/prompts/brief";
import { resolveBriefParse } from "@/lib/schemas/brief";

const fullBrief = {
  businessName: "Test Bakery",
  whatTheyDo: "Bakes bread and cakes to order.",
  audience: "Neighbours",
  vibe: ["warm"],
  imageWorld: "food-drink",
  desiredAction: "Order a cake",
  keyPoints: ["Sourdough daily"],
  hasCustomers: true,
  sections: ["hero", "features", "cta"],
};

const modelReturning =
  (data: unknown): ModelCall =>
  async () => ({ data, raw: "" });

describe("isSparse", () => {
  it("flags a one-line description", () => {
    expect(isSparse("I run a bakery in Johar Town")).toBe(true);
  });
  it("passes a fuller one", () => {
    expect(isSparse("I run a bakery in Johar Town. We do sourdough and custom cakes, mostly regulars from the neighbourhood.")).toBe(false);
  });
});

describe("resolveBriefParse", () => {
  it("is complete only when the brief validates and there are no questions", () => {
    expect(resolveBriefParse({ brief: fullBrief as never, questions: [] }).status).toBe("complete");
    expect(resolveBriefParse({ brief: { businessName: "X" }, questions: [] }).status).toBe("needs-input");
  });
});

describe("parseBrief", () => {
  it("always asks for a sparse description, even if the model returned a complete brief", async () => {
    const r = await parseBrief("bakery in johar town", { model: modelReturning({ brief: fullBrief, questions: [] }) });
    expect(r.status).toBe("needs-input");
    if (r.status === "needs-input") expect(r.questions.length).toBeGreaterThan(0);
  });

  it("uses the model's questions when it asks", async () => {
    const q = { field: "desiredAction", question: "What should visitors do?", suggestions: ["Order", "Visit"] };
    const r = await parseBrief("bakery in johar town", { model: modelReturning({ brief: { businessName: "B" }, questions: [q] }) });
    expect(r.status).toBe("needs-input");
    if (r.status === "needs-input") expect(r.questions[0].question).toBe(q.question);
  });

  it("supplies fallback questions when the model returns garbage", async () => {
    const r = await parseBrief("a long enough description of a bakery that sells bread and cakes to the neighbourhood", {
      model: modelReturning({ nonsense: true }),
    });
    expect(r.status).toBe("needs-input");
    if (r.status === "needs-input") expect(r.questions.length).toBe(2);
  });

  it("completes for a full description and a complete brief", async () => {
    const r = await parseBrief("I run a bakery in Johar Town. Sourdough and custom cakes, mostly regulars from the neighbourhood.", {
      model: modelReturning({ brief: fullBrief, questions: [] }),
    });
    expect(r.status).toBe("complete");
  });
});
