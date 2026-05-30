import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { deleteSiteCascade } from "@/lib/user-cascade-delete";
import { sites } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

type PatchBody = { plan?: unknown; planExpiresAt?: unknown };

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const { id: siteId } = await ctx.params;
  if (!siteId?.trim()) {
    return NextResponse.json({ error: "Site kimliği eksik" }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const allowedPlans = ["starter", "professional", "enterprise"];
  const plan = typeof raw.plan === "string" && allowedPlans.includes(raw.plan) ? raw.plan : undefined;
  const planExpiresAt = typeof raw.planExpiresAt === "string" ? raw.planExpiresAt : undefined;

  if (!plan && planExpiresAt === undefined) {
    return NextResponse.json({ error: "Güncellenecek alan belirtilmedi." }, { status: 400 });
  }

  try {
    const row = await d.db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    if (!row[0]) {
      return NextResponse.json({ error: "Site bulunamadı." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (plan) updateData.plan = plan;
    if (planExpiresAt !== undefined) updateData.planExpiresAt = planExpiresAt || null;

    await d.db.update(sites).set(updateData).where(eq(sites.id, siteId));
    const updated = await d.db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    return NextResponse.json(updated[0]);
  } catch (e) {
    return jsonSqlError(e, "Site güncellenemedi.");
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const { id: siteId } = await ctx.params;
  if (!siteId?.trim()) {
    return NextResponse.json({ error: "Site kimliği eksik" }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const row = await d.db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
  if (!row[0]) {
    return NextResponse.json({ error: "Site bulunamadı." }, { status: 404 });
  }

  try {
    await deleteSiteCascade(d.db, siteId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Site silinemedi.");
  }
}
