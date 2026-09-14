"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DescribeBox, FollowUpPrompt } from "@/components/intake";
import type { BusinessBrief, FollowUpQuestion } from "@/lib/schemas/brief";
import { newProjectId, saveProject } from "@/lib/store";

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export default function Home() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [partial, setPartial] = useState<Partial<BusinessBrief>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function go(brief: BusinessBrief) {
    const id = newProjectId();
    saveProject({ id, description, brief, sections: [], createdAt: new Date().toISOString() });
    router.push(`/project/${id}`);
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const outcome = await post("/api/parse-brief", { description });
      if (outcome.status === "complete" && outcome.brief) return go(outcome.brief);
      setPartial(outcome.partial ?? {});
      setQuestions(outcome.questions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      const outcome = await post("/api/parse-brief", {
        description,
        partial,
        answers: questions.map((question, i) => ({ question, answer: answers[i] })),
      });
      if (outcome.status === "complete" && outcome.brief) return go(outcome.brief);
      setError("That still wasn't quite enough to go on. Try adding a little more above.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-[46rem] content-center gap-10 px-6 py-16">
      <header className="grid gap-3">
        <p className="text-sm" style={{ color: "var(--tool-accent)" }}>Landing page generator</p>
        <h1 className="text-[2.2rem] leading-tight @md:text-[2.8rem]" style={{ fontFamily: "var(--font-display-serif)", letterSpacing: "-0.02em" }}>
          Describe your business. Get a page that looks like it was made for it.
        </h1>
        <p style={{ color: "var(--tool-muted)" }}>No design decisions, no jargon. Just say what you do.</p>
      </header>

      {questions.length === 0 ? (
        <DescribeBox value={description} onChange={setDescription} onSubmit={start} busy={busy} />
      ) : (
        <FollowUpPrompt
          questions={questions}
          answers={answers}
          onAnswer={(i, v) => setAnswers((a) => ({ ...a, [i]: v }))}
          onSubmit={finish}
          busy={busy}
        />
      )}

      {error && (
        <p className="rounded-lg px-4 py-3 text-sm" style={{ background: "#2a1a1a", color: "#e6a3a3", border: "1px solid #4a2626" }}>
          {error}
        </p>
      )}
    </main>
  );
}
