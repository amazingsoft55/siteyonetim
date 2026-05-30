import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { plans } from "@/db/schema";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    let rows: typeof plans.$inferSelect[];
    try {
      rows = await d.db.select().from(plans).orderBy(plans.sortOrder);
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
      active: r.active,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

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
    const { name, description, price, originalPrice, period, features, highlight, badge, cta, sortOrder, active } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "name ve price zorunludur." }, { status: 400 });
    }

    const id = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : "[]";

    await d.db.insert(plans).values({
      id,
      name: String(name),
      description: description ? String(description) : null,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      period: period ? String(period) : "/ay",
      features: featuresStr,
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
