import { NextResponse } from "next/server";
import { eq, or, sql } from "drizzle-orm";
import { getPlatformDb } from "@/db/platform";
import { sites } from "@/db/schema";
import { databaseUnavailable } from "@/server/database/access";
import { parseInviteCodeInput, generateSiteInviteCode } from "@/lib/site-code";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawCode = url.searchParams.get("code")?.trim();

  if (!rawCode) {
    return NextResponse.json(
      { ok: false, valid: false, error: "Lütfen bir site katılım kodu girin." },
      { status: 400 }
    );
  }

  const parsed = parseInviteCodeInput(rawCode);
  if (!parsed.siteCodeOnly) {
    return NextResponse.json(
      { ok: false, valid: false, error: "Geçersiz kod formatı." },
      { status: 400 }
    );
  }

  let db;
  try {
    db = await getPlatformDb();
  } catch {
    return await databaseUnavailable();
  }

  // 1. invite_code veya id ile eşleşen siteyi ara
  const siteRows = await db
    .select({
      id: sites.id,
      name: sites.name,
      address: sites.address,
      inviteCode: sites.inviteCode,
    })
    .from(sites)
    .where(
      or(
        eq(sql`UPPER(${sites.inviteCode})`, parsed.siteCodeOnly.toUpperCase()),
        eq(sql`UPPER(${sites.id})`, parsed.siteCodeOnly.toUpperCase()),
        eq(sites.id, parsed.siteCodeOnly)
      )
    )
    .limit(1);

  let site = siteRows[0];

  // 2. Eğer bulunamadıysa ve sitede henüz invite_code atanmamışsa (tüm siteleri kontrol et)
  if (!site) {
    const allSites = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
        inviteCode: sites.inviteCode,
      })
      .from(sites);

    for (const s of allSites) {
      const expectedCode = s.inviteCode || generateSiteInviteCode(s.name, s.id);
      if (expectedCode.toUpperCase() === parsed.siteCodeOnly.toUpperCase()) {
        site = s;
        // Eksikse veritabanında kodunu güncelle
        if (!s.inviteCode) {
          try {
            await db
              .update(sites)
              .set({ inviteCode: expectedCode })
              .where(eq(sites.id, s.id));
            site.inviteCode = expectedCode;
          } catch {}
        }
        break;
      }
    }
  }

  if (!site) {
    return NextResponse.json({
      ok: false,
      valid: false,
      error: "Geçersiz katılım kodu. Lütfen yöneticinizin verdiği kodu kontrol edin.",
    });
  }

  const finalInviteCode = site.inviteCode || generateSiteInviteCode(site.name, site.id);

  return NextResponse.json({
    ok: true,
    valid: true,
    site: {
      id: site.id,
      name: site.name,
      address: site.address || "Belirtilmemiş",
      inviteCode: finalInviteCode,
      apartmentNo: parsed.apartmentNo,
    },
  });
}
