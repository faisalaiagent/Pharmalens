import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: list all overrides (active + removed)
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ overrides: [], dbConnected: false });
  }
  try {
    const overrides = await prisma.adminOverride.findMany({
      orderBy: { addedAt: "desc" },
    });
    return NextResponse.json({ overrides, dbConnected: true });
  } catch (err) {
    return NextResponse.json({ overrides: [], dbConnected: false, error: String(err) });
  }
}

// POST: create a new override (admin add)
export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "No database configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { genericName, brandName, strength, dosageForm, manufacturer, note } = body;

    if (!genericName || !brandName || !strength || !dosageForm || !manufacturer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.adminOverride.create({
      data: { genericName, brandName, strength, dosageForm, manufacturer, note, status: "active" },
    });

    await prisma.adminLogEntry.create({
      data: {
        action: "add",
        brandName,
        genericName,
        manufacturer,
        reason: note || "—",
      },
    });

    return NextResponse.json({ override: created });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: update status (remove/restore) or edit fields
export async function PATCH(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "No database configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { id, action, reason, fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const existing = await prisma.adminOverride.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Override not found" }, { status: 404 });
    }

    let updated;
    if (action === "remove") {
      updated = await prisma.adminOverride.update({
        where: { id },
        data: { status: "removed", removedAt: new Date() },
      });
      await prisma.adminLogEntry.create({
        data: {
          action: "remove",
          brandName: existing.brandName,
          genericName: existing.genericName,
          manufacturer: existing.manufacturer,
          reason: reason || "No reason given",
        },
      });
    } else if (action === "restore") {
      updated = await prisma.adminOverride.update({
        where: { id },
        data: { status: "active", removedAt: null },
      });
      await prisma.adminLogEntry.create({
        data: {
          action: "restore",
          brandName: existing.brandName,
          genericName: existing.genericName,
          manufacturer: existing.manufacturer,
          reason: "Restored by admin",
        },
      });
    } else if (action === "edit" && fields) {
      updated = await prisma.adminOverride.update({
        where: { id },
        data: fields,
      });
      await prisma.adminLogEntry.create({
        data: {
          action: "edit",
          brandName: fields.brandName ?? existing.brandName,
          genericName: fields.genericName ?? existing.genericName,
          manufacturer: fields.manufacturer ?? existing.manufacturer,
          reason: "Edited by admin",
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ override: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE: permanently delete an override
export async function DELETE(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "No database configured" }, { status: 503 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const existing = await prisma.adminOverride.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.adminOverride.delete({ where: { id } });

    await prisma.adminLogEntry.create({
      data: {
        action: "remove",
        brandName: existing.brandName,
        genericName: existing.genericName,
        manufacturer: existing.manufacturer,
        reason: "Permanently deleted",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
