import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { plans, features } from "@/db/schema";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    let planRows: typeof plans.$inferSelect[];
    try {
      planRows = await d.db.select().from(plans).orderBy(plans.sortOrder);
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
        active: r.active,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return NextResponse.json(parsed);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/plans GET]", detail);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const body = await req.json() as Record<string, unknown>;
    const { name, description, price, originalPrice, period, featureIds, highlight, badge, cta, sortOrder, active } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "name ve price zorunludur." }, { status: 400 });
    }

    const id = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const featureIdsStr = Array.isArray(featureIds) ? JSON.stringify(featureIds) : "[]";

    await d.db.insert(plans).values({
      id,
      name: String(name),
      description: description ? String(description) : null,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      period: period ? String(period) : "/ay",
      featureIds: featureIdsStr,
      highlight: highlight === true || highlight === 1,
      badge: badge ? String(badge) : null,
      cta: cta ? String(cta) : "Hemen Başla",
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
      active: active === false ? false : true,
    });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/plans POST]", detail);
    return NextResponse.json({ error: "Paket oluşturulamadı.", detail }, { status: 500 });
  }
}
