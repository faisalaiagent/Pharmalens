"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, XCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { DrugBrandRecord } from "@/lib/types";

type Props = {
  records: DrugBrandRecord[];
};

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function LookupApp({ records }: Props) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState("all");
  const [strength, setStrength] = useState("all");
  const [manufacturer, setManufacturer] = useState("all");
  const [country, setCountry] = useState("Pakistan");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 100;

  // Reset to page 1 whenever search/filter changes
  useEffect(() => { setPage(1); }, [query, form, strength, manufacturer, country]);

  const filters = useMemo(
    () => ({
      forms: unique(records.map((record) => record.dosageForm)),
      strengths: unique(records.map((record) => record.strength)),
      manufacturers: unique(records.map((record) => record.manufacturer)),
      countries: unique(records.map((record) => record.country))
    }),
    [records]
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery =
        !normalized ||
        record.genericName.toLowerCase().includes(normalized) ||
        record.activeIngredient.toLowerCase().includes(normalized) ||
        record.brandName.toLowerCase().includes(normalized);
      return (
        matchesQuery &&
        (form === "all" || record.dosageForm === form) &&
        (strength === "all" || record.strength === strength) &&
        (manufacturer === "all" || record.manufacturer === manufacturer) &&
        (country === "all" || record.country === country)
      );
    });
  }, [country, form, manufacturer, query, records, strength]);

  const hasActiveFilters =
    query || form !== "all" || strength !== "all" || manufacturer !== "all" || country !== "Pakistan";

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const pagedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* ─── Filter Sidebar ─── */}
      <aside>
        <div
          className="rounded-2xl p-5 space-y-5 sticky top-24"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)"
          }}
        >
          {/* Sidebar header */}
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}
            >
              <Filter className="size-4" aria-hidden="true" />
            </span>
            <span className="font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: "hsl(210 40% 90%)" }}>
              Search & Filters
            </span>
          </div>

          {/* Search input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 45%)" }}>
              Generic or brand name
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4"
                style={{ color: "hsl(215 20% 45%)" }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="glow-input h-11 w-full rounded-xl pl-10 pr-4 text-sm transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "hsl(210 40% 92%)",
                  outline: "none"
                }}
                placeholder="Search paracetamol, amoxicillin…"
              />
            </div>
          </div>

          <SelectFilter label="Dosage form" value={form} onChange={setForm} options={filters.forms} />
          <SelectFilter label="Strength" value={strength} onChange={setStrength} options={filters.strengths} />
          <SelectFilter label="Manufacturer" value={manufacturer} onChange={setManufacturer} options={filters.manufacturers} />
          <SelectFilter label="Market" value={country} onChange={setCountry} options={filters.countries} allLabel="All markets" />

          {/* Reset */}
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => {
              setQuery("");
              setForm("all");
              setStrength("all");
              setManufacturer("all");
              setCountry("Pakistan");
              setPage(1);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              background: "rgba(239,68,68,0.05)"
            }}
            onMouseEnter={e => {
              if (!hasActiveFilters) return;
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.05)";
            }}
          >
            <XCircle className="size-4" aria-hidden="true" />
            Reset filters
          </button>
        </div>
      </aside>

      {/* ─── Results Area ─── */}
      <section className="space-y-5 min-w-0" aria-live="polite">
        {/* Results header bar */}
        <div
          className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "'Outfit', sans-serif", color: "hsl(210 40% 92%)" }}
            >
              Brands containing this generic
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "hsl(215 20% 50%)" }}>
              <span style={{ color: "#22d3ee", fontWeight: 600 }}>{results.length}</span> matching record{results.length === 1 ? "" : "s"}{results.length > PAGE_SIZE ? <span style={{ color: "hsl(215 20% 45%)" }}> — page {page} of {totalPages}</span> : ""}
            </p>
          </div>
          <span
            className="w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "rgba(52,211,153,0.12)",
              border: "1px solid rgba(52,211,153,0.25)",
              color: "#34d399"
            }}
          >
            🇵🇰 Pakistan-first dataset
          </span>
        </div>

        {results.length ? (
          <>
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="results-table w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Brand", "Generic", "Strength", "Form", "Manufacturer", "Market", "Verification"].map((col) => (
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
                  {pagedResults.map((record, i) => (
                    <tr
                      key={record.id}
                      className="align-top"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <td className="px-4 py-3 font-semibold">
                        <Link
                          href={`/generic/${record.genericSlug}`}
                          className="transition-colors duration-150 hover:underline"
                          style={{ color: "#22d3ee" }}
                        >
                          {record.brandName}
                        </Link>
                      </td>
                      <td className="px-4 py-3" style={{ color: "hsl(215 20% 70%)" }}>{record.activeIngredient}</td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-medium"
                          style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
                        >
                          {record.strength}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "hsl(215 20% 70%)" }}>{record.dosageForm}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "hsl(215 20% 60%)" }}>{record.manufacturer}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium" style={{ color: "#34d399" }}>{record.country}</span>
                      </td>
                      <td className="px-4 py-3">
                        <VerificationBadge record={record} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-3 lg:hidden">
              {pagedResults.map((record) => (
                <article
                  key={record.id}
                  className="rounded-xl p-4 transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "3px solid #22d3ee"
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: "hsl(210 40% 92%)" }}>
                        {record.brandName}
                      </h3>
                      <Link
                        href={`/generic/${record.genericSlug}`}
                        className="text-sm hover:underline"
                        style={{ color: "#22d3ee" }}
                      >
                        {record.activeIngredient}
                      </Link>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
                    >
                      {record.country}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <MobileFact label="Strength" value={record.strength} />
                    <MobileFact label="Form" value={record.dosageForm} />
                    <MobileFact label="Manufacturer" value={record.manufacturer} />
                    <MobileFact label="Verified" value={record.lastVerifiedAt} />
                  </dl>
                </article>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              <span className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, results.length)} of {results.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee" }}
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="size-8 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: p === page ? "#22d3ee" : "rgba(255,255,255,0.05)",
                        color: p === page ? "#0b0f1a" : "hsl(215 20% 60%)",
                        border: p === page ? "none" : "1px solid rgba(255,255,255,0.08)",
                        fontWeight: p === page ? 700 : 400
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee" }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
        ) : (
          /* Empty state */
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)"
            }}
          >
            <div
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)" }}
            >
              <Search className="size-6" style={{ color: "#22d3ee" }} />
            </div>
            <h3 className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: "hsl(210 40% 88%)" }}>
              No matching brands found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "hsl(215 20% 48%)" }}>
              Try a generic name, remove filters, or add a verified CSV import for the missing medicine.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function SelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel = "All"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 45%)" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="styled-select h-11 w-full rounded-xl px-3 text-sm transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "hsl(210 40% 85%)",
          appearance: "none",
          WebkitAppearance: "none"
        }}
      >
        <option value="all" style={{ background: "#0f1624" }}>{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option} style={{ background: "#0f1624" }}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function VerificationBadge({ record }: { record: DrugBrandRecord }) {
  const status = record.verificationStatus?.toLowerCase() ?? "";
  const isVerified = status.includes("verified");
  const isPending = status.includes("pending");

  const config = isVerified
    ? { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", Icon: CheckCircle }
    : isPending
    ? { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", Icon: Clock }
    : { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", Icon: AlertCircle };

  const { color, bg, border, Icon } = config;

  return (
    <div className="space-y-1.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: bg, border: `1px solid ${border}`, color }}
      >
        <Icon className="size-3" />
        {record.verificationStatus.replace("_", " ")}
      </span>
      <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>
        {record.lastVerifiedAt}
      </p>
      {record.sourceUrl ? (
        <a
          className="block text-xs transition-colors hover:underline"
          style={{ color: "#22d3ee" }}
          href={record.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {record.sourceName}
        </a>
      ) : (
        <p className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>{record.sourceName}</p>
      )}
    </div>
  );
}

function MobileFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(215 20% 40%)" }}>
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium" style={{ color: "hsl(210 40% 82%)" }}>
        {value}
      </dd>
    </div>
  );
}
