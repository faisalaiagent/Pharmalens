import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About",
  description: "About the PharmaLens professional reference tool."
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About PharmaLens"
      eyebrow="Professional reference"
      body={[
        "PharmaLens is designed for healthcare professionals, doctors, pharmacists, and pharmacy students who need a fast way to review brand names containing a generic ingredient in the Pakistan market.",
        "The product is structured for source-based medicine data, editorial review, and future expansion into additional regulated markets."
      ]}
    />
  );
}
