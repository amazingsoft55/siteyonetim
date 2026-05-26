import { NextResponse } from "next/server";
import { and, count, eq, gte, isNotNull } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import {
  sites,
  users,
  userPresence,
  pageVisitsDaily,
  platformInsights,
  adminSupportTickets,
  requests,
} from "@/db/schema";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Bu özet için süper yönetici gereklidir." }, { status: 403 });
    }

    const d = tryGetDb();
    if (!d.ok) return jsonDbUnavailable(d.error);

    const freshAt = new Date().toISOString();
  let dbLatencyMs: number | null = null;
  try {
    const t0 = Date.now();
    await d.db.select().from(sites).limit(1);
    dbLatencyMs = Math.max(0, Date.now() - t0);
  } catch {
    dbLatencyMs = null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const presenceSince = new Date(Date.now() - 180_000).toISOString();
  const loginSince = new Date(Date.now() - 86400_000).toISOString();

  let sitesCount = 0;
  try {
    const [r] = await d.db.select({ c: count() }).from(sites);
    sitesCount = r?.c ?? 0;
  } catch {
    sitesCount = 0;
  }

  const byRole: Record<string, number> = {};
  try {
    const rows = await d.db.select({ role: users.role, n: count() }).from(users).groupBy(users.role);
    for (const row of rows) byRole[row.role] = row.n ?? 0;
  } catch {
    /* şema uyumsuz */
  }

  const totalUsers = Object.values(byRole).reduce((a, b) => a + b, 0);

  let onlineUsers = 0;
  try {
    const [r] = await d.db
      .select({ c: count() })
      .from(userPresence)
      .where(gte(userPresence.lastPingAt, presenceSince));
    onlineUsers = r?.c ?? 0;
  } catch {
    onlineUsers = 0;
  }

  let logins24h = 0;
  try {
    const [lg] = await d.db
      .select({ c: count() })
      .from(users)
      .where(and(isNotNull(users.lastLoginAt), gte(users.lastLoginAt, loginSince)));
    logins24h = lg?.c ?? 0;
  } catch {
    logins24h = 0;
  }

  let publicViewsToday = 0;
  try {
    const rowsPv = await d.db.select().from(pageVisitsDaily).where(eq(pageVisitsDaily.day, today));
    publicViewsToday = rowsPv.reduce((acc, row) => acc + (row.cnt ?? 0), 0);
  } catch {
    publicViewsToday = 0;
  }

  let openSupport = 0;
  try {
    const [st] = await d.db
      .select({ c: count() })
      .from(adminSupportTickets)
      .where(eq(adminSupportTickets.status, "OPEN"));
    openSupport = st?.c ?? 0;
  } catch {
    openSupport = 0;
  }

  let openResidentReq = 0;
  try {
    const [rq] = await d.db.select({ c: count() }).from(requests).where(eq(requests.status, "OPEN"));
    openResidentReq = rq?.c ?? 0;
  } catch {
    openResidentReq = 0;
  }

  let pageSpeedCache: Record<string, unknown> | null = null;
  try {
    const row = await d.db.select().from(platformInsights).where(eq(platformInsights.key, "pagespeed")).limit(1);
    if (row[0]?.json) {
      pageSpeedCache = JSON.parse(row[0].json) as Record<string, unknown>;
    }
  } catch {
    pageSpeedCache = null;
  }

    const psiKey = !!process.env.GOOGLE_PAGESPEED_API_KEY?.trim();

    const body = {
      ok: true,
      freshAt,
      dbLatencyMs,
      presenceWindowMinutes: 3,
      totals: { sites: sitesCount, users: totalUsers, byRole },
      live: {
        onlineAuthenticatedUsersApprox: onlineUsers,
        distinctLoginsLast24h: logins24h,
      },
      publicSite: {
        pageViewsTrackedTodayUtc: publicViewsToday,
        coverage:
          "Yalnızca / · /iletisim · /hakkimizda · /kurulum; bot UA filtrelenir; oturumsuz kullanıcılar dahil.",
      },
      operations: {
        openAdminSupportTickets: openSupport,
        openResidentRequests: openResidentReq,
      },
      pageSpeed: {
        configured: psiKey,
        cached: pageSpeedCache,
        analyzeHint: psiKey ?
          'POST /api/super-admin/insights/pagespeed (UI’deki “Lighthouse güncelle” düğmesi)'
        : "Bulut konsolundan Google PageSpeed Insights API anahtarı ekleyin (GOOGLE_PAGESPEED_API_KEY).",
      },
      platformExplain:
        "Workers CPU yüzdesi kullanıcı uçundan okunmaz (Cloudflare sınırlaması); D1 yanıt süresi Lighthouse ve sayım verileri gerçektir.",
    };

    try {
      return NextResponse.json(body);
    } catch (serializeErr) {
      const msg = serializeErr instanceof Error ? serializeErr.message : String(serializeErr);
      return NextResponse.json(
        {
          ok: true,
          freshAt,
          dbLatencyMs,
          presenceWindowMinutes: 3,
          totals: { sites: sitesCount, users: totalUsers, byRole },
          live: {
            onlineAuthenticatedUsersApprox: onlineUsers,
            distinctLoginsLast24h: logins24h,
          },
          publicSite: {
            pageViewsTrackedTodayUtc: publicViewsToday,
            coverage: body.publicSite.coverage,
          },
          operations: body.operations,
          pageSpeed: {
            configured: psiKey,
            cached: null,
            analyzeHint: `Önbellek serileştirilemedi: ${msg}`,
          },
          platformExplain: body.platformExplain,
        },
        { status: 200 },
      );
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/dashboard GET]", detail);
    return NextResponse.json(
      {
        ok: false,
        error: "Özet oluşturulamadı (beklenmeyen sunucu hatası).",
        code: "DASHBOARD_UNHANDLED",
        detail,
        kurulumUrl: "/kurulum",
      },
      { status: 500 },
    );
  }
}
