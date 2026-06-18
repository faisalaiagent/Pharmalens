"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { LookupApp } from "@/components/lookup-app";
import type { DrugBrandRecord } from "@/lib/types";
import { Pill, Database, Globe } from "lucide-react";

type LiveCounts = { brandCount: number; genericCount: number };

const LiveCountsContext = createContext<{
  counts: LiveCounts;
  setCounts: (c: LiveCounts) => void;
} | null>(null);

/**
 * Provides one shared "live count" value (brand rows + generics, including
 * any admin-added overrides fetched client-side) to both the stats panel
 * at the top of the homepage and the lookup table further down. Without
 * this, the two pieces of UI compute their counts independently and can
 * show different numbers -- e.g. stats panel says 2932 while the table
 * says 2943 after an admin adds new brands.
 */
export function HomeDataProvider({
  records,
  initialGenericCount,
  children
}: {
  records: DrugBrandRecord[];
  initialGenericCount: number;
  children: ReactNode;
}) {
  const [counts, setCounts] = useState<LiveCounts>({
    brandCount: records.length,
    genericCount: initialGenericCount
  });

  return (
    <LiveCountsContext.Provider value={{ counts, setCounts }}>{children}</LiveCountsContext.Provider>
  );
}

export function HomeStats() {
  const ctx = useContext(LiveCountsContext);
  const counts = ctx?.counts ?? { brandCount: 0, genericCount: 0 };

  return (
    <div
      className="animate-slide-up delay-200 rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)"
      }}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 40%)" }}>
        Dataset overview
      </p>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value={counts.genericCount.toString()}
          label="Generics"
          icon={<Pill className="size-4" />}
          color="#22d3ee"
        />
        <StatCard
          value={counts.brandCount.toString()}
          label="Brand rows"
          icon={<Database className="size-4" />}
          color="#a78bfa"
        />
        <StatCard value="PK" label="First market" icon={<Globe className="size-4" />} color="#34d399" />
      </div>
    </div>
  );
}

export function HomeLookup({ records }: { records: DrugBrandRecord[] }) {
  const ctx = useContext(LiveCountsContext);

  const handleLiveDataChange = useCallback(
    (info: LiveCounts) => {
      ctx?.setCounts(info);
    },
    [ctx]
  );

  return <LookupApp records={records} onLiveDataChange={handleLiveDataChange} />;
}

function StatCard({
  value,
  label,
  icon,
  color
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 text-center transition-all duration-300 hover:scale-105"
      style={{
        background: `${color}0d`,
        border: `1px solid ${color}25`
      }}
    >
      <div className="mb-2 flex justify-center" style={{ color }}>
        {icon}
      </div>
      <p
        className="text-2xl font-extrabold"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color
        }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: "hsl(215 20% 48%)" }}>
        {label}
      </p>
    </div>
  );
}
