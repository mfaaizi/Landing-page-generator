import { NextResponse } from "next/server";
import { z } from "zod";
import { editSection } from "@/lib/ai/generate";
import { BusinessBrief } from "@/lib/schemas/brief";
import { Section } from "@/lib/schemas/section";

export const runtime = "nodejs";

const Body = z.object({
  section: Section,
  brief: BusinessBrief,
  projectId: z.string().min(1),
  request: z.string().trim().min(1).max(400),
  allowVariantChange: z.boolean().optional(),
});

/**
 * Only this section is touched. On total failure the original comes back
 * with status "unchanged" and a 200, because that is a legitimate outcome the
 * client should render, not an error.
 */
export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  try {
    const result = await editSection(body.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Edit failed" }, { status: 502 });
  }
}
