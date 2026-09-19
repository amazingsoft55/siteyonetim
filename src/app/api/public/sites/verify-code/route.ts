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

  let matchedSite: { id: string; name: string; address?: string | null; inviteCode?: string | null } | null = null;

  try {
    const siteRows = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
        inviteCode: sites.inviteCode,
      })
      .from(sites);

    for (const s of siteRows) {
      const expectedCode = s.inviteCode || generateSiteInviteCode(s.name, s.id);
      if (
        expectedCode.toUpperCase() === parsed.siteCodeOnly.toUpperCase() ||
        s.id.toUpperCase() === parsed.siteCodeOnly.toUpperCase()
      ) {
        matchedSite = {
          id: s.id,
          name: s.name,
          address: s.address,
          inviteCode: expectedCode,
        };
        break;
      }
    }
  } catch {
    // D1'de invite_code kolonu henüz yoksa temel alanlarla ara
    try {
      const basicSites = await db
        .select({
          id: sites.id,
          name: sites.name,
          address: sites.address,
        })
        .from(sites);

      for (const s of basicSites) {
        const expectedCode = generateSiteInviteCode(s.name, s.id);
        if (
          expectedCode.toUpperCase() === parsed.siteCodeOnly.toUpperCase() ||
          s.id.toUpperCase() === parsed.siteCodeOnly.toUpperCase()
        ) {
          matchedSite = {
            id: s.id,
            name: s.name,
            address: s.address,
            inviteCode: expectedCode,
          };
          break;
        }
      }
    } catch (queryErr) {
      console.error("Site verify sorgu hatası:", queryErr);
    }
  }

  if (!matchedSite) {
    return NextResponse.json({
      ok: false,
      valid: false,
      error: "Geçersiz katılım kodu. Lütfen yöneticinizin verdiği kodu kontrol edin.",
    });
  }

  const finalInviteCode = matchedSite.inviteCode || generateSiteInviteCode(matchedSite.name, matchedSite.id);

  return NextResponse.json({
    ok: true,
    valid: true,
    site: {
      id: matchedSite.id,
      name: matchedSite.name,
      address: matchedSite.address || "Belirtilmemiş",
      inviteCode: finalInviteCode,
      apartmentNo: parsed.apartmentNo,
    },
  });
}
