"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PreviewFrame, type PreviewSlot } from "@/components/preview/PreviewFrame";
import type { Section } from "@/lib/schemas/section";
import { loadProject, saveProject, type StoredProject } from "@/lib/store";

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<StoredProject | null | undefined>(undefined);
  const [slots, setSlots] = useState<PreviewSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  // Load once, then either resume from stored sections or generate them.
  useEffect(() => {
    const p = loadProject(id);
    setProject(p ?? null);
    if (!p) return;
    if (p.sections.length) {
      setSlots(p.sections.map((section) => ({ type: section.type, state: "done", section })));
    } else if (!started.current) {
      started.current = true;
      void generateAll(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function persist(p: StoredProject, sections: Section[]) {
    const next = { ...p, sections };
    saveProject(next);
    setProject(next);
  }

  async function generateAll(p: StoredProject) {
    setSlots(p.brief.sections.map((type) => ({ type, state: "pending" })));
    const done: Section[] = [];
    for (const [index, type] of p.brief.sections.entries()) {
      try {
        const result = await post("/api/generate-section", { type, brief: p.brief, projectId: p.id, sectionId: `${type}-${index}` });
        done.push(result.section);
        setSlots((current) => current.map((slot, i) => (i === index ? { type, state: "done", section: result.section } : slot)));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return;
      }
    }
    persist(p, done);
  }

  async function edit(index: number, request: string) {
    if (!project) return;
    const slot = slots[index];
    if (slot.state !== "done") return;
    setSlots((current) => current.map((s, i) => (i === index && s.state === "done" ? { ...s, busy: true } : s)));
    try {
      const result = await post("/api/edit-section", { section: slot.section, brief: project.brief, projectId: project.id, request });
      const next = slots.map((s, i) => (i === index && s.state === "done" ? { ...s, section: result.section as Section, busy: false } : s));
      setSlots(next);
      persist(project, next.filter((s): s is Extract<PreviewSlot, { state: "done" }> => s.state === "done").map((s) => s.section));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSlots((current) => current.map((s, i) => (i === index && s.state === "done" ? { ...s, busy: false } : s)));
    }
  }

  function changeVariant(index: number, variant: string) {
    if (!project) return;
    const next = slots.map((s, i) => (i === index && s.state === "done" ? { ...s, section: { ...s.section, variant } as Section } : s));
    setSlots(next);
    persist(project, next.filter((s): s is Extract<PreviewSlot, { state: "done" }> => s.state === "done").map((s) => s.section));
  }

  if (project === undefined) return null;
  if (project === null) {
    return (
      <main className="mx-auto grid min-h-screen max-w-[40rem] content-center gap-4 px-6">
        <p>This page isn&apos;t here any more. Sessions are kept in your browser tab only.</p>
        <Link className="tool-button w-fit" href="/">Start again</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-[92rem] gap-5 px-4 py-6 @md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm" style={{ color: "var(--tool-muted)" }}>Your page for</p>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display-serif)" }}>{project.brief.businessName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="tool-button" onClick={() => { started.current = true; void generateAll(project); }}>
            Start over with the same description
          </button>
          <Link className="tool-button" href="/">New page</Link>
        </div>
      </header>

      <p className="text-sm" style={{ color: "var(--tool-muted)" }}>
        Hover over any part of the page to change its words or pick a different look.
      </p>

      {error && (
        <p className="rounded-lg px-4 py-3 text-sm" style={{ background: "#2a1a1a", color: "#e6a3a3", border: "1px solid #4a2626" }}>{error}</p>
      )}

      <PreviewFrame brief={project.brief} description={project.description} slots={slots} onEdit={edit} onVariant={changeVariant} />
    </main>
  );
}
