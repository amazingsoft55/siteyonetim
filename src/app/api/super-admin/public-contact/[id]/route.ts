import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getSession } from "@/lib/session";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import { jsonSqlError } from "@/lib/db-query-error";
import { platformPublicContact } from "@/db/schema";

export const runtime = "edge";

type PatchBody = {
  status?: unknown;
  superAdminReply?: unknown;
};

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Kimlik eksik." }, { status: 400 });
  }

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const nextStatus =
    raw.status === "OPEN" || raw.status === "IN_PROGRESS" || raw.status === "RESOLVED" ?
      raw.status
    : undefined;
  const reply =
    typeof raw.superAdminReply === "string" ? raw.superAdminReply.trim().slice(0, 8000) : undefined;

  if (!nextStatus && reply === undefined) {
    return NextResponse.json({ error: "status veya yanıt gerekli." }, { status: 400 });
  }

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const nowIso = new Date().toISOString();

  try {
    const payload: Partial<{
      updatedAt: string;
      status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
      superAdminReply: string | null;
    }> = { updatedAt: nowIso };

    if (nextStatus !== undefined) payload.status = nextStatus;
    if (reply !== undefined) payload.superAdminReply = reply.length > 0 ? reply : null;

    await d.db.update(platformPublicContact).set(payload).where(eq(platformPublicContact.id, id.trim()));
  } catch (e) {
    return jsonSqlError(e, "Güncellenemedi.");
  }

  return NextResponse.json({ ok: true });
}
