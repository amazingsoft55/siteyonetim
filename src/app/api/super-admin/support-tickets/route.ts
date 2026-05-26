import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { tryGetDb } from "@/lib/cloudflare-db";
import { adminSupportTickets, sites, users } from "@/db/schema";

export const runtime = "edge";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
}

function noDb() {
  return NextResponse.json({ error: "Veritabanı bağlamı yok." }, { status: 503 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = tryGetDb();
  if (!d.ok) return noDb();

  const rows = await d.db
    .select({
      id: adminSupportTickets.id,
      subject: adminSupportTickets.subject,
      body: adminSupportTickets.body,
      status: adminSupportTickets.status,
      superAdminReply: adminSupportTickets.superAdminReply,
      createdAt: adminSupportTickets.createdAt,
      updatedAt: adminSupportTickets.updatedAt,
      siteId: adminSupportTickets.siteId,
      siteName: sites.name,
      adminUserId: adminSupportTickets.adminUserId,
      adminName: users.name,
      adminContact: users.emailOrPhone,
    })
    .from(adminSupportTickets)
    .innerJoin(sites, eq(adminSupportTickets.siteId, sites.id))
    .innerJoin(users, eq(adminSupportTickets.adminUserId, users.id))
    .orderBy(desc(adminSupportTickets.createdAt));

  return NextResponse.json(rows);
}
