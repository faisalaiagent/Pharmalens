import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Data Sources and Editorial Policy",
  description: "Source verification and editorial policy for medicine brand records."
};

export default function DataSourcesPage() {
  return (
    <InfoPage
      title="Data Sources and Editorial Policy"
      eyebrow="Verification model"
      body={[
        "Production records should be sourced from official regulators such as DRAP, manufacturer product pages, approved labels, package inserts, public registration lists, and pharmacy procurement records where legally usable.",
        "Each imported record should preserve source name, source URL or document reference, last verified date, reviewer, and verification status. Records marked pending review should remain visibly labeled until checked by a qualified reviewer.",
        "Future CSV imports should map generic_name, brand_name, active_ingredient, strength, dosage_form, manufacturer, country, registration_number, source_name, source_url, and last_verified_at into the normalized database schema."
      ]}
    />
  );
}
