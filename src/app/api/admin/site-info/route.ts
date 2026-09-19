import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { getPlatformDb } from "@/db/platform";
import { sites } from "@/db/schema";
import { databaseUnavailable } from "@/server/database/access";
import { generateSiteInviteCode } from "@/lib/site-code";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") || !session.siteId) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  let db;
  try {
    db = await getPlatformDb();
  } catch {
    return await databaseUnavailable();
  }

  const siteRows = await db
    .select({
      id: sites.id,
      name: sites.name,
      address: sites.address,
      inviteCode: sites.inviteCode,
    })
    .from(sites)
    .where(eq(sites.id, session.siteId))
    .limit(1);

  const site = siteRows[0];
  if (!site) {
    return NextResponse.json({ error: "Site kaydı bulunamadı." }, { status: 404 });
  }

  let inviteCode = site.inviteCode;
  if (!inviteCode) {
    inviteCode = generateSiteInviteCode(site.name, site.id);
    try {
      await db.update(sites).set({ inviteCode }).where(eq(sites.id, site.id));
    } catch {}
  }

  const base = getPublicSiteUrl(request).replace(/\/$/, "");
  const inviteLink = `${base}/kayit?kod=${encodeURIComponent(inviteCode)}`;

  return NextResponse.json({
    ok: true,
    siteId: site.id,
    siteName: site.name,
    address: site.address,
    inviteCode,
    inviteLink,
  });
}
