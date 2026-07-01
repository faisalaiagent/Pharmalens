import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the PharmaLens editorial team."
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact"
      eyebrow="Editorial and data requests"
      body={[
        "For data corrections, source submissions, partnership requests, or institutional access, contact the editorial team at faisalagentai@gmail.com.",
        "When reporting a medicine record, include the generic name, brand name, strength, dosage form, manufacturer, country or market, and an official source URL or document reference."
      ]}
    />
  );
}
