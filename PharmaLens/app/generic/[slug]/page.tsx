import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { getGenericBySlug, getGenericSummaries } from "@/lib/repository";
import { FlaskConical, Package, Factory } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const generics = await getGenericSummaries();
  return generics.map((generic) => ({ slug: generic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const generic = await getGenericBySlug(slug);
  if (!generic) return {};

  return {
    title: `${generic.name} Brand Names in Pakistan`,
    description: `Professional reference list of Pakistan brands containing ${generic.name}, including strengths, forms, manufacturers, and source notes.`
  };
}

export default async function GenericDetailPage({ params }: Props) {
  const { slug } = await params;
  const generic = await getGenericBySlug(slug);
  if (!generic) notFound();

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.08) 0%, transparent 70%)"
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header area */}
          <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="animate-slide-up">
              {/* Eyebrow */}
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: "rgba(34,211,238,0.1)",
                  border: "1px solid rgba(34,211,238,0.2)",
                  color: "#22d3ee"
                }}
              >
                <FlaskConical className="size-3.5" />
                Generic detail
              </div>

              <h1
                className="text-3xl font-extrabold sm:text-4xl"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: "linear-gradient(135deg, #e0f9fd 0%, #22d3ee 60%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                {generic.name} brand names in Pakistan
              </h1>
              <p className="mt-3 max-w-2xl" style={{ color: "hsl(215 20% 55%)" }}>
                Brands containing {generic.name}, grouped with strengths, dosage forms, manufacturers,
                and verification notes.
              </p>
            </div>

            {/* Summary card */}
            <div
              className="animate-slide-up delay-200 rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)"
              }}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 40%)" }}>
                Reference summary
              </p>
              <div className="space-y-3">
                <SummaryRow
                  icon={<Package className="size-4" />}
                  color="#22d3ee"
                  label="Brand records"
                  value={generic.brands.length.toString()}
                />
                <SummaryRow
                  icon={<FlaskConical className="size-4" />}
                  color="#a78bfa"
                  label="Dosage forms"
                  value={generic.forms.join(", ")}
                />
                <SummaryRow
                  icon={<Factory className="size-4" />}
                  color="#34d399"
                  label="Manufacturers"
                  value={generic.manufacturers.length.toString()}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="overflow-x-auto">
              <table className="results-table w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Brand", "Active ingredient", "Strength", "Dosage form", "Manufacturer", "Source", "Verified"].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "hsl(215 20% 45%)" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ background: "rgba(11,15,26,0.6)" }}>
                  {generic.brands.map((brand) => {
                    const status = brand.verificationStatus?.toLowerCase() ?? "";
                    const isVerified = status.includes("verified");
                    const badgeColor = isVerified ? "#34d399" : "#fbbf24";
                    const badgeBg = isVerified ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)";
                    const badgeBorder = isVerified ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)";

                    return (
                      <tr key={brand.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-4 py-3 font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: "#22d3ee" }}>
                          {brand.brandName}
                        </td>
                        <td className="px-4 py-3" style={{ color: "hsl(215 20% 70%)" }}>
                          {brand.activeIngredient}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-md px-2 py-0.5 text-xs font-medium"
                            style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
                          >
                            {brand.strength}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "hsl(215 20% 70%)" }}>{brand.dosageForm}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "hsl(215 20% 60%)" }}>{brand.manufacturer}</td>
                        <td className="px-4 py-3">
                          {brand.sourceUrl ? (
                            <a
                              href={brand.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs hover:underline"
                              style={{ color: "#22d3ee" }}
                            >
                              {brand.sourceName}
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>{brand.sourceName}</span>
                          )}
                          {brand.sourceNote && (
                            <p className="mt-0.5 text-xs" style={{ color: "hsl(215 20% 40%)" }}>{brand.sourceNote}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="mb-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor }}
                          >
                            {brand.verificationStatus.replace("_", " ")}
                          </span>
                          <p className="text-xs" style={{ color: "hsl(215 20% 42%)" }}>{brand.lastVerifiedAt}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <DisclaimerBanner />
    </>
  );
}

function SummaryRow({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-8 items-center justify-center rounded-lg shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: "hsl(210 40% 88%)" }}>{value}</p>
      </div>
    </div>
  );
}
