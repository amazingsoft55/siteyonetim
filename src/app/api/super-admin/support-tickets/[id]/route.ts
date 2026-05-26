import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { adminSupportTickets } from "@/db/schema";

export const runtime = "nodejs";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
}

type PatchBody = {
  status?: unknown;
  superAdminReply?: unknown;
};

function clamp(s: string, max: number) {
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Kimlik eksik." }, { status: 400 });

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const curr = await d.db.select().from(adminSupportTickets).where(eq(adminSupportTickets.id, id)).limit(1);

  if (!curr[0]) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  let nextStatus = curr[0].status as "OPEN" | "IN_PROGRESS" | "RESOLVED";
  if (
    raw.status === "OPEN" ||
    raw.status === "IN_PROGRESS" ||
    raw.status === "RESOLVED"
  ) {
    nextStatus = raw.status;
  }

  let nextReply = curr[0].superAdminReply ?? null;
  if ("superAdminReply" in raw && typeof raw.superAdminReply === "string") {
    const c = clamp(raw.superAdminReply, 8000);
    nextReply = c.length > 0 ? c : null;
  }

  const now = new Date().toISOString();

  await d.db
    .update(adminSupportTickets)
    .set({ status: nextStatus, superAdminReply: nextReply, updatedAt: now })
    .where(eq(adminSupportTickets.id, id));

  const out = await d.db.select().from(adminSupportTickets).where(eq(adminSupportTickets.id, id)).limit(1);

  return NextResponse.json(out[0]);
}
