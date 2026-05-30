import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { plans, features } from "@/db/schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const { id } = await params;
    const rows = await d.db.select().from(plans).where(eq(plans.id, id)).limit(1);
    if (!rows[0]) {
      return NextResponse.json({ error: "Paket bulunamadı." }, { status: 404 });
    }

    const r = rows[0];
    const featureIds = typeof r.featureIds === "string" ? JSON.parse(r.featureIds) as string[] : [];

    let featureNames: string[] = [];
    if (featureIds.length > 0) {
      try {
        const featureRows = await d.db
          .select()
          .from(features)
          .where(inArray(features.id, featureIds));
        featureNames = featureRows.map((f) => f.name);
      } catch {
        featureNames = featureIds;
      }
    }

    return NextResponse.json({
      id: r.id,
      name: r.name,
      description: r.description,
      price: r.price,
      originalPrice: r.originalPrice,
      period: r.period,
      featureIds,
      features: featureNames,
      highlight: r.highlight,
      badge: r.badge,
      cta: r.cta,
      sortOrder: r.sortOrder,
      active: r.active,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/plans/[id] GET]", detail);
    return NextResponse.json({ error: "Paket okunamadı." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.name != null) updates.name = String(body.name);
    if (body.description != null) updates.description = String(body.description);
    if (body.price != null) updates.price = Number(body.price);
    if (body.originalPrice != null) updates.originalPrice = Number(body.originalPrice);
    if (body.period != null) updates.period = String(body.period);
    if (body.featureIds != null) updates.featureIds = JSON.stringify(body.featureIds);
    if (body.highlight != null) updates.highlight = body.highlight === true || body.highlight === 1;
    if (body.badge != null) updates.badge = String(body.badge);
    if (body.cta != null) updates.cta = String(body.cta);
    if (body.sortOrder != null) updates.sortOrder = Number(body.sortOrder);
    if (body.active != null) updates.active = body.active === true || body.active === 1;

    const result = await d.db.update(plans).set(updates).where(eq(plans.id, id));

    return NextResponse.json({ ok: true, changes: result.changes });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/plans/[id] PATCH]", detail);
    return NextResponse.json({ error: "Paket güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const { id } = await params;
    const result = await d.db.delete(plans).where(eq(plans.id, id));

    return NextResponse.json({ ok: true, changes: result.changes });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/plans/[id] DELETE]", detail);
    return NextResponse.json({ error: "Paket silinemedi." }, { status: 500 });
  }
}
