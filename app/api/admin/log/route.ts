import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: list audit log entries
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ log: [], dbConnected: false });
  }
  try {
    const log = await prisma.adminLogEntry.findMany({
      orderBy: { timestamp: "desc" },
      take: 200,
    });
    return NextResponse.json({ log, dbConnected: true });
  } catch (err) {
    return NextResponse.json({ log: [], dbConnected: false, error: String(err) });
  }
}

// DELETE: clear all log entries
export async function DELETE() {
  if (!prisma) {
    return NextResponse.json({ error: "No database configured" }, { status: 503 });
  }
  try {
    await prisma.adminLogEntry.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
