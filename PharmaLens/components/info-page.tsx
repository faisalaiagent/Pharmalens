import { DisclaimerBanner } from "@/components/disclaimer-banner";

export function InfoPage({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string[];
}) {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(167,139,250,0.08) 0%, transparent 70%)"
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.2)",
              color: "#a78bfa"
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: "#a78bfa" }}
            />
            {eyebrow}
          </div>

          {/* Title */}
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
            {title}
          </h1>

          {/* Divider */}
          <div
            className="my-6 h-px w-24 rounded-full"
            style={{ background: "linear-gradient(90deg, #22d3ee, transparent)" }}
          />

          {/* Body card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="space-y-4">
              {body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="leading-relaxed"
                  style={{ color: "hsl(215 20% 60%)" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <DisclaimerBanner />
    </>
  );
}
