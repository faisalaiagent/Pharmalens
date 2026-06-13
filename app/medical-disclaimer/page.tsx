import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Medical disclaimer for PharmaLens."
};

export default function MedicalDisclaimerPage() {
  return (
    <InfoPage
      title="Medical Disclaimer"
      eyebrow="Safety and compliance"
      body={[
        "This tool is for professional reference only and is not a substitute for clinical judgment, prescribing guidance, or official regulatory sources.",
        "Drug names, strengths, dosage forms, manufacturers, registration details, availability, and labeling can change. Always verify against the current official source before clinical, prescribing, dispensing, or procurement decisions.",
        "The app does not provide diagnosis, patient-specific treatment advice, dosage recommendations, therapeutic equivalence, interchangeability, or substitution guidance."
      ]}
    />
  );
}
