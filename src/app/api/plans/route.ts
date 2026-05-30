import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { plans } from "@/db/schema";

export async function GET() {
  try {
    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    let rows: typeof plans.$inferSelect[];
    try {
      rows = await d.db
        .select()
        .from(plans)
        .where(eq(plans.active, true));
    } catch {
      rows = [];
    }

    const parsed = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: r.price,
      originalPrice: r.originalPrice,
      period: r.period,
      features: typeof r.features === "string" ? JSON.parse(r.features) as string[] : r.features,
      highlight: r.highlight,
      badge: r.badge,
      cta: r.cta,
      sortOrder: r.sortOrder,
    }));

    parsed.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json(parsed);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/plans GET]", detail);
    return NextResponse.json([], { status: 200 });
  }
}
