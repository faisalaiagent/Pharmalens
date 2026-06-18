import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { sampleDrugBrands } from "@/lib/sample-data";
import type { DrugBrandRecord, GenericSummary } from "@/lib/types";

function hasDatabase() {
  // The relational Generic/Manufacturer/Brand schema was scaffolded early on
  // but the app's real drug catalog lives in lib/sample-data.ts (2,900+
  // hand-verified Pakistan records) and that table has never been seeded.
  // Admin overrides (added/removed brands) use a separate, simpler
  // AdminOverride table — see app/api/admin/overrides and app/api/overrides.
  // Forcing this to false avoids querying an empty/unrelated table and
  // avoids build failures if DATABASE_URL briefly can't be reached.
  return false;
}

function mapBrand(row: {
  id: string;
  brandName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  registrationNumber: string | null;
  verificationStatus: string;
  lastVerifiedAt: Date;
  generic: { genericName: string; slug: string };
  manufacturer: { name: string };
  country: { name: string };
  source: { name: string; url: string | null; note: string | null };
}): DrugBrandRecord {
  return {
    id: row.id,
    genericName: row.generic.genericName,
    genericSlug: row.generic.slug,
    brandName: row.brandName,
    activeIngredient: row.activeIngredient,
    strength: row.strength,
    dosageForm: row.dosageForm,
    manufacturer: row.manufacturer.name,
    country: row.country.name,
    registrationNumber: row.registrationNumber ?? undefined,
    sourceName: row.source.name,
    sourceUrl: row.source.url ?? undefined,
    verificationStatus: row.verificationStatus as DrugBrandRecord["verificationStatus"],
    lastVerifiedAt: row.lastVerifiedAt.toISOString().slice(0, 10),
    sourceNote: row.source.note ?? "Verify against official regulatory sources."
  };
}

// cache() deduplicates this call within a single render/build pass.
// During `next build`, sitemap.ts and generateStaticParams() both call
// getDrugBrands() concurrently. Without cache(), each fires its own Prisma
// query and the tiny connection pool (default: 3) times out. With cache(),
// the first caller fetches; all subsequent callers reuse the same promise.
export const getDrugBrands = cache(async (): Promise<DrugBrandRecord[]> => {
  if (!hasDatabase()) return sampleDrugBrands;

  try {
    const rows = await prisma!.brand.findMany({
      orderBy: [{ generic: { genericName: "asc" } }, { brandName: "asc" }],
      include: {
        generic: true,
        manufacturer: true,
        country: true,
        source: true
      }
    });
    return rows.map(mapBrand);
  } finally {
    if (process.env.NODE_ENV === "production") {
      await prisma!.$disconnect().catch(() => {});
    }
  }
});

export async function getGenericBySlug(slug: string) {
  const records = await getDrugBrands();
  const brands = records.filter((record) => record.genericSlug === slug);
  if (!brands.length) return null;

  return {
    name: brands[0].genericName,
    slug,
    brands,
    forms: [...new Set(brands.map((brand) => brand.dosageForm))].sort(),
    strengths: [...new Set(brands.map((brand) => brand.strength))].sort(),
    manufacturers: [...new Set(brands.map((brand) => brand.manufacturer))].sort()
  };
}

export async function getGenericSummaries(): Promise<GenericSummary[]> {
  const records = await getDrugBrands();
  const grouped = new Map<string, DrugBrandRecord[]>();

  for (const record of records) {
    grouped.set(record.genericSlug, [...(grouped.get(record.genericSlug) ?? []), record]);
  }

  return [...grouped.entries()]
    .map(([slug, brands]) => ({
      name: brands[0].genericName,
      slug,
      brandCount: brands.length,
      forms: [...new Set(brands.map((brand) => brand.dosageForm))].sort(),
      strengths: [...new Set(brands.map((brand) => brand.strength))].sort()
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
