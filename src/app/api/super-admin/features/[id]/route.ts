import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { features } from "@/db/schema";

type RouteParams = { params: Promise<{ id: string }> };

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

    const updates: Record<string, unknown> = {};
    if (body.name != null) updates.name = String(body.name);
    if (body.description != null) updates.description = String(body.description);
    if (body.icon != null) updates.icon = String(body.icon);
    if (body.category != null) updates.category = String(body.category);
    if (body.sortOrder != null) updates.sortOrder = Number(body.sortOrder);
    if (body.active != null) updates.active = body.active === true || body.active === 1;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const result = await d.db.update(features).set(updates).where(eq(features.id, id));

    return NextResponse.json({ ok: true, changes: result.changes });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/features/[id] PATCH]", detail);
    return NextResponse.json({ error: "Özellik güncellenemedi." }, { status: 500 });
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
    const result = await d.db.delete(features).where(eq(features.id, id));

    return NextResponse.json({ ok: true, changes: result.changes });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/features/[id] DELETE]", detail);
    return NextResponse.json({ error: "Özellik silinemedi." }, { status: 500 });
  }
}
