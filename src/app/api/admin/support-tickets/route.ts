import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import { adminSupportTickets } from "@/db/schema";

export const runtime = "edge";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
}

type Body = { subject?: unknown; body?: unknown };

function clamp(s: string, max: number) {
  const t = s.trim();
  if (t.length > max) return t.slice(0, max);
  return t;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const list = await d.db
    .select({
      id: adminSupportTickets.id,
      subject: adminSupportTickets.subject,
      body: adminSupportTickets.body,
      status: adminSupportTickets.status,
      superAdminReply: adminSupportTickets.superAdminReply,
      createdAt: adminSupportTickets.createdAt,
      updatedAt: adminSupportTickets.updatedAt,
      siteId: adminSupportTickets.siteId,
      adminUserId: adminSupportTickets.adminUserId,
    })
    .from(adminSupportTickets)
    .where(eq(adminSupportTickets.siteId, session.siteId))
    .orderBy(desc(adminSupportTickets.createdAt));

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const subject = typeof raw.subject === "string" ? clamp(raw.subject, 200) : "";
  const bodyText = typeof raw.body === "string" ? clamp(raw.body, 8000) : "";

  if (subject.length < 3 || bodyText.length < 10) {
    return NextResponse.json(
      {
        error: "Konu en az 3, açıklama en az 10 karakter olmalıdır.",
      },
      { status: 400 },
    );
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `stk-${Date.now()}`;

  await d.db.insert(adminSupportTickets).values({
    id,
    siteId: session.siteId,
    adminUserId: session.id,
    subject,
    body: bodyText,
    status: "OPEN",
  });

  const row = await d.db
    .select()
    .from(adminSupportTickets)
    .where(eq(adminSupportTickets.id, id))
    .limit(1);

  return NextResponse.json(row[0]);
}
