import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { features } from "@/db/schema";

export async function GET() {
  try {
    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    let rows: typeof features.$inferSelect[];
    try {
      rows = await d.db.select().from(features).where(eq(features.active, true));
    } catch {
      rows = [];
    }

    const parsed = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      category: r.category,
      sortOrder: r.sortOrder,
    }));

    parsed.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json(parsed);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/features GET]", detail);
    return NextResponse.json([], { status: 200 });
  }
}
