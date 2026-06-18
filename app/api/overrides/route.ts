import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, read-only: returns only ACTIVE admin-added overrides.
// Used by the main lookup page to merge admin-added brands into search results
// for ALL visitors, regardless of browser/device — fixing the localStorage bug.
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ overrides: [] });
  }
  try {
    const overrides = await prisma.adminOverride.findMany({
      where: { status: "active" },
      orderBy: { addedAt: "desc" },
    });
    return NextResponse.json({ overrides });
  } catch {
    return NextResponse.json({ overrides: [] });
  }
}
