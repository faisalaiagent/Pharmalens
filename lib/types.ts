export type VerificationStatus = "verified" | "pending_review" | "source_required";

export type DrugBrandRecord = {
  id: string;
  genericName: string;
  genericSlug: string;
  brandName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  country: string;
  registrationNumber?: string;
  sourceName: string;
  sourceUrl?: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  sourceNote: string;
};

export type GenericSummary = {
  name: string;
  slug: string;
  brandCount: number;
  forms: string[];
  strengths: string[];
};
