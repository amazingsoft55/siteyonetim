import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { plans, features } from "@/db/schema";

export async function GET() {
  try {
    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    let planRows: typeof plans.$inferSelect[];
    try {
      planRows = await d.db
        .select()
        .from(plans)
        .where(eq(plans.active, true));
    } catch {
      planRows = [];
    }

    const allFeatureIds = new Set<string>();
    for (const p of planRows) {
      const ids = typeof p.featureIds === "string" ? JSON.parse(p.featureIds) as string[] : [];
      for (const id of ids) allFeatureIds.add(id);
    }

    let allFeatures: typeof features.$inferSelect[] = [];
    if (allFeatureIds.size > 0) {
      try {
        allFeatures = await d.db
          .select()
          .from(features)
          .where(inArray(features.id, Array.from(allFeatureIds)));
      } catch {
        allFeatures = [];
      }
    }

    const featureMap = new Map(allFeatures.map((f) => [f.id, f.name]));

    const parsed = planRows.map((r) => {
      const featureIds = typeof r.featureIds === "string" ? JSON.parse(r.featureIds) as string[] : [];
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        price: r.price,
        originalPrice: r.originalPrice,
        period: r.period,
        featureIds,
        features: featureIds.map((id) => featureMap.get(id) || id),
        highlight: r.highlight,
        badge: r.badge,
        cta: r.cta,
        sortOrder: r.sortOrder,
      };
    });

    parsed.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json(parsed);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/plans GET]", detail);
    return NextResponse.json([], { status: 200 });
  }
}
