"use client";

import { motion } from "framer-motion";
import type { FollowUpQuestion } from "@/lib/schemas/brief";

const EXAMPLES = [
  "I run a small bakery in Johar Town. Sourdough, custom cakes, mostly regulars from the neighbourhood.",
  "We're a two-person studio that photographs weddings across Punjab, opening bookings for next spring.",
  "I fix laptops and phones from a shop near Liberty Market, same-day for most repairs.",
];

export function DescribeBox({
  value,
  onChange,
  onSubmit,
  busy,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  return (
    <div className="grid gap-4">
      <textarea
        className="tool-input text-[1.05rem] leading-relaxed"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell me about your business the way you'd tell a friend. What you do, who it's for, anything you're proud of."
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="tool-button" onClick={() => onChange(ex)} style={{ fontSize: "0.78rem" }}>
              {ex.split(".")[0]}…
            </button>
          ))}
        </div>
        <button type="button" className="tool-button primary" onClick={onSubmit} disabled={busy || value.trim().length < 3}>
          {busy ? "Reading…" : "Build my page"}
        </button>
      </div>
    </div>
  );
}

export function FollowUpPrompt({
  questions,
  answers,
  onAnswer,
  onSubmit,
  busy,
}: {
  questions: FollowUpQuestion[];
  answers: Record<number, string>;
  onAnswer: (index: number, value: string) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const complete = questions.every((_, i) => (answers[i] ?? "").trim().length > 0);
  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
    >
      <p style={{ color: "var(--tool-muted)" }}>Two quick things so the page sounds like you.</p>
      {questions.map((q, i) => (
        <div key={q.question} className="grid gap-3">
          <p className="text-[1.05rem]">{q.question}</p>
          <div className="flex flex-wrap gap-2">
            {q.suggestions.map((s) => (
              <button key={s} type="button" className="tool-button" aria-pressed={answers[i] === s} onClick={() => onAnswer(i, s)}>
                {s}
              </button>
            ))}
          </div>
          <input
            className="tool-input"
            value={q.suggestions.includes(answers[i] ?? "") ? "" : answers[i] ?? ""}
            onChange={(e) => onAnswer(i, e.target.value)}
            placeholder="Or say it your way"
          />
        </div>
      ))}
      <div className="flex justify-end">
        <button type="button" className="tool-button primary" onClick={onSubmit} disabled={busy || !complete}>
          {busy ? "Building…" : "Continue"}
        </button>
      </div>
    </motion.div>
  );
}
