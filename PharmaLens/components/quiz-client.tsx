"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle, Trophy, Zap } from "lucide-react";
import type { DrugBrandRecord } from "@/lib/types";

type Question = {
  genericName: string;
  correct: DrugBrandRecord;
  options: DrugBrandRecord[];
};

function buildQuestions(records: DrugBrandRecord[]): Question[] {
  const byGeneric = new Map<string, DrugBrandRecord[]>();
  for (const record of records) {
    byGeneric.set(record.genericName, [...(byGeneric.get(record.genericName) ?? []), record]);
  }

  return [...byGeneric.entries()].map(([genericName, brands], index) => {
    const correct = brands[index % brands.length];
    const distractors = records
      .filter((record) => record.genericName !== genericName)
      .slice(index, index + 3);
    const options = [correct, ...distractors].sort((a, b) => a.brandName.localeCompare(b.brandName));
    return { genericName, correct, options };
  });
}

export function QuizClient({ records }: { records: DrugBrandRecord[] }) {
  const questions = useMemo(() => buildQuestions(records), [records]);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const question = questions[index];
  const answered = Boolean(selectedId);
  const selectedCorrect = selectedId === question.correct.id;
  const total = index + (answered ? 1 : 0);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  function selectOption(id: string) {
    if (answered) return;
    setSelectedId(id);
    if (id === question.correct.id) setScore((c) => c + 1);
  }

  function next() {
    setSelectedId(null);
    setIndex((c) => (c + 1) % questions.length);
  }

  function reset() {
    setSelectedId(null);
    setScore(0);
    setIndex(0);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(12px)"
      }}
    >
      {/* Progress bar */}
      <div style={{ height: "3px", background: "rgba(255,255,255,0.06)" }}>
        <div
          style={{
            height: "100%",
            width: `${((index + 1) / questions.length) * 100}%`,
            background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
            transition: "width 0.5s ease"
          }}
        />
      </div>

      {/* Header */}
      <div
        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "'Outfit', sans-serif", color: "hsl(210 40% 94%)" }}
          >
            Brand recognition quiz
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "hsl(215 20% 50%)" }}>
            Choose a brand that contains the displayed generic ingredient.
          </p>
        </div>

        {/* Score badges */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
              color: "#22d3ee"
            }}
          >
            <Zap className="size-3.5" />
            {score}/{total}
          </div>
          {total > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: accuracy >= 80 ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                border: `1px solid ${accuracy >= 80 ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`,
                color: accuracy >= 80 ? "#34d399" : "#fbbf24"
              }}
            >
              <Trophy className="size-3" />
              {accuracy}%
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Question island */}
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(167,139,250,0.08) 100%)",
            border: "1px solid rgba(34,211,238,0.15)"
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 50%)" }}>
            Generic ingredient
          </p>
          <h1
            className="mt-2 text-3xl font-extrabold"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            {question.genericName}
          </h1>
        </div>

        {/* Answer options */}
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isCorrect = option.id === question.correct.id;

            let borderColor = "rgba(255,255,255,0.1)";
            let bg = "rgba(255,255,255,0.03)";
            let textColor = "hsl(210 40% 85%)";
            let shadow = "none";

            if (answered && isCorrect) {
              borderColor = "rgba(52,211,153,0.6)";
              bg = "rgba(52,211,153,0.08)";
              shadow = "0 0 16px rgba(52,211,153,0.15)";
            } else if (answered && isSelected) {
              borderColor = "rgba(248,113,113,0.6)";
              bg = "rgba(248,113,113,0.08)";
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option.id)}
                disabled={answered}
                className="rounded-xl p-4 text-left transition-all duration-200 focus:outline-none"
                style={{
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  boxShadow: shadow,
                  cursor: answered ? "default" : "pointer",
                  transform: answered && isCorrect ? "scale(1.01)" : "scale(1)"
                }}
                onMouseEnter={e => {
                  if (answered) return;
                  (e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.07)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,211,238,0.35)";
                }}
                onMouseLeave={e => {
                  if (answered) return;
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <span
                  className="block font-bold"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: answered && isCorrect ? "#34d399" : answered && isSelected ? "#f87171" : "hsl(210 40% 90%)"
                  }}
                >
                  {option.brandName}
                </span>
                <span className="mt-1 block text-xs" style={{ color: "hsl(215 20% 50%)" }}>
                  {option.strength} · {option.dosageForm} · {option.manufacturer}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback + Next */}
        {answered && (
          <div
            className="animate-slide-up flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: selectedCorrect ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)",
              border: `1px solid ${selectedCorrect ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`
            }}
          >
            <div className="flex gap-3">
              {selectedCorrect ? (
                <CheckCircle2 className="size-5 shrink-0 mt-0.5" style={{ color: "#34d399" }} aria-hidden="true" />
              ) : (
                <XCircle className="size-5 shrink-0 mt-0.5" style={{ color: "#f87171" }} aria-hidden="true" />
              )}
              <p className="text-sm" style={{ color: "hsl(210 40% 85%)" }}>
                <span className="font-semibold" style={{ color: selectedCorrect ? "#34d399" : "#f87171" }}>
                  {selectedCorrect ? "Correct! " : "Incorrect. "}
                </span>
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>{question.correct.brandName}</span> contains{" "}
                {question.genericName}. Always verify strength and dosage form before use.
              </p>
            </div>
            <button
              type="button"
              onClick={next}
              className="shrink-0 rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
                color: "#0b0f1a"
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Reset */}
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            color: "hsl(215 20% 55%)",
            background: "transparent"
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.color = "hsl(210 40% 85%)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "hsl(215 20% 55%)";
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset quiz
        </button>
      </div>
    </div>
  );
}
