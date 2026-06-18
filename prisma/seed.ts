import { PrismaClient, VerificationStatus } from "@prisma/client";
import { sampleDrugBrands } from "../lib/sample-data";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  const pakistan = await prisma.country.upsert({
    where: { isoCode: "PK" },
    update: {},
    create: { name: "Pakistan", isoCode: "PK" }
  });

  for (const record of sampleDrugBrands) {
    const generic = await prisma.generic.upsert({
      where: { slug: record.genericSlug },
      update: { genericName: record.genericName },
      create: { genericName: record.genericName, slug: slugify(record.genericName) }
    });

    const manufacturer = await prisma.manufacturer.upsert({
      where: { name: record.manufacturer },
      update: {},
      create: { name: record.manufacturer }
    });

    const source = await prisma.drugSource.upsert({
      where: {
        name_url: {
          name: record.sourceName,
          url: record.sourceUrl ?? ""
        }
      },
      update: { note: record.sourceNote },
      create: {
        name: record.sourceName,
        url: record.sourceUrl ?? "",
        note: record.sourceNote
      }
    });

    await prisma.brand.upsert({
      where: {
        brandName_activeIngredient_strength_dosageForm_manufacturerId_countryId: {
          brandName: record.brandName,
          activeIngredient: record.activeIngredient,
          strength: record.strength,
          dosageForm: record.dosageForm,
          manufacturerId: manufacturer.id,
          countryId: pakistan.id
        }
      },
      update: {
        registrationNumber: record.registrationNumber,
        verificationStatus: record.verificationStatus as VerificationStatus,
        lastVerifiedAt: new Date(record.lastVerifiedAt),
        sourceId: source.id
      },
      create: {
        brandName: record.brandName,
        activeIngredient: record.activeIngredient,
        strength: record.strength,
        dosageForm: record.dosageForm,
        registrationNumber: record.registrationNumber,
        verificationStatus: record.verificationStatus as VerificationStatus,
        lastVerifiedAt: new Date(record.lastVerifiedAt),
        genericId: generic.id,
        manufacturerId: manufacturer.id,
        countryId: pakistan.id,
        sourceId: source.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
