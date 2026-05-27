import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { adminSupportTickets, sites, users } from "@/db/schema";


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

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
