import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for PharmaLens."
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      eyebrow="User privacy"
      body={[
        "This reference tool is designed to collect minimal personal information. Search queries may be logged in aggregate to improve data coverage and product quality.",
        "If analytics, authentication, or subscription billing are enabled, the production deployment should disclose the analytics provider, authentication provider, billing processor, retention period, and user rights."
      ]}
    />
  );
}
