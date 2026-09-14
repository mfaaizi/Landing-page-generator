import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSection, PipelineError } from "@/lib/ai/generate";
import { BusinessBrief } from "@/lib/schemas/brief";
import { SectionType } from "@/lib/schemas/primitives";

export const runtime = "nodejs";

/**
 * One section per request. That's what makes the preview progressive and what
 * makes a failure isolated — a section that falls back doesn't delay or affect
 * any other section.
 */
const Body = z.object({
  type: SectionType,
  brief: BusinessBrief,
  projectId: z.string().min(1),
  sectionId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const result = await generateSection(body.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PipelineError) {
      // Our own defaults are broken — a real bug, not a model failure.
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 502 },
    );
  }
}
