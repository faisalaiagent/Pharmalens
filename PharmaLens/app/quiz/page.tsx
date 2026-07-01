import type { Metadata } from "next";
import { QuizClient } from "@/components/quiz-client";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { getDrugBrands } from "@/lib/repository";
import { BrainCircuit } from "lucide-react";

export const metadata: Metadata = {
  title: "Generic to Brand Quiz",
  description: "Multiple-choice quiz for practicing Pakistan medicine brand recognition by generic ingredient."
};

export default async function QuizPage() {
  const records = await getDrugBrands();

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 30% -15%, rgba(167,139,250,0.1) 0%, transparent 70%)"
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 animate-slide-up">
            {/* Eyebrow */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.2)",
                color: "#a78bfa"
              }}
            >
              <BrainCircuit className="size-3.5" />
              Study mode
            </div>

            <h1
              className="text-3xl font-extrabold sm:text-4xl"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(135deg, #e0f9fd 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Generic-to-brand multiple-choice quiz
            </h1>
            <p className="mt-3 max-w-2xl" style={{ color: "hsl(215 20% 55%)" }}>
              Designed for pharmacists, doctors, and pharmacy students to reinforce brand recognition
              across the Pakistan market.
            </p>
          </div>

          <QuizClient records={records} />
        </div>
      </section>
      <DisclaimerBanner />
    </>
  );
}
