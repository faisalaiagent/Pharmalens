import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(249,115,22,0.07) 100%)",
        borderTop: "1px solid rgba(251,191,36,0.18)",
        borderBottom: "1px solid rgba(251,191,36,0.18)"
      }}
    >
      <div className="mx-auto flex max-w-7xl gap-3 px-4 py-4 text-sm sm:px-6 lg:px-8">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}
        >
          <AlertTriangle className="size-4" style={{ color: "#fbbf24" }} aria-hidden="true" />
        </div>
        <p style={{ color: "hsl(38 80% 75%)" }}>
          <span className="font-semibold" style={{ color: "#fbbf24" }}>Professional reference only. </span>
          Brands shown are for informational purposes. This is not a diagnosis, prescription,
          substitution, or treatment recommendation tool.
        </p>
      </div>
    </section>
  );
}
