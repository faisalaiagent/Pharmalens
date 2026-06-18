import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { HomeDataProvider, HomeStats, HomeLookup } from "@/components/home-client";
import { getDrugBrands, getGenericSummaries } from "@/lib/repository";

export default async function HomePage() {
  const [records, generics] = await Promise.all([getDrugBrands(), getGenericSummaries()]);

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Ambient background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% -20%, rgba(34,211,238,0.1) 0%, transparent 70%)"
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <HomeDataProvider records={records} initialGenericCount={generics.length}>
            <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
              {/* Headline block */}
              <div className="animate-slide-up">
                {/* Eyebrow */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.2)",
                    color: "#22d3ee"
                  }}
                >
                  <span
                    className="size-1.5 rounded-full animate-pulse-glow"
                    style={{ background: "#22d3ee" }}
                  />
                  Professional medicine reference · Pakistan
                </div>

                <h1
                  className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-5xl"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span style={{
                    background: "linear-gradient(135deg, #e0f9fd 0%, #22d3ee 40%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>
                    Search generic medicines
                  </span>
                  <br />
                  <span style={{ color: "hsl(210 40% 82%)" }}>
                    & review Pakistan brand records.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: "hsl(215 20% 55%)" }}>
                  Enter a generic name such as <span style={{ color: "#22d3ee", fontStyle: "italic" }}>paracetamol</span> to find brands
                  containing that ingredient — with strength, dosage form, manufacturer, market, and verification metadata.
                </p>
              </div>

              <HomeStats />
            </div>

            <HomeLookup records={records} />
          </HomeDataProvider>
        </div>
      </section>

      <DisclaimerBanner />
    </>
  );
}

