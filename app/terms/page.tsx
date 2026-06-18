import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for PharmaLens."
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Use"
      eyebrow="Professional use"
      body={[
        "PharmaLens is provided as a professional reference product. Users are responsible for verifying medicine information against official regulatory sources, product labels, and current clinical guidance.",
        "The service must not be used as a sole basis for diagnosis, prescribing, dispensing, substitution, dosing, treatment, or patient-specific medical decisions."
      ]}
    />
  );
}
