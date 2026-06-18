import type { MetadataRoute } from "next";
import { getGenericSummaries } from "@/lib/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const generics = await getGenericSummaries();

  return [
    "",
    "/quiz",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/medical-disclaimer",
    "/data-sources",
    ...generics.map((generic) => `/generic/${generic.slug}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
