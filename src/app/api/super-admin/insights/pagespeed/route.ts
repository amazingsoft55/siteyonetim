import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { platformInsights } from "@/db/schema";
import { getPublicSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

export const maxDuration = 60;

function scoreFrom(psi: Record<string, unknown>, cat: string): number | null {
  const lh = psi.lighthouseResult as Record<string, unknown> | undefined;
  const categories = lh?.categories as Record<string, { score: number | null }> | undefined;
  const raw = categories?.[cat]?.score;
  return raw === null || raw === undefined ? null : Math.round(Number(raw) * 100);
}

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "GOOGLE_PAGESPEED_API_KEY tanımlı değil.",
      },
      { status: 400 },
    );
  }

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  const siteUrl = getPublicSiteUrl();
  const qs = new URLSearchParams({
    url: siteUrl,
    key: apiKey,
    strategy: "mobile",
  });
  for (const c of ["PERFORMANCE", "SEO", "ACCESSIBILITY", "BEST_PRACTICES"]) qs.append("category", c);

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs.toString()}`;

  const ac = new AbortController();
  const kill = setTimeout(() => ac.abort(), 52000);

  try {
    const resp = await fetch(endpoint, {
      signal: ac.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(kill);

    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: "PageSpeed çağrısı başarısız.", detail: t.slice(0, 500) }, { status: 502 });
    }

    const body = (await resp.json()) as Record<string, unknown>;
    const now = new Date().toISOString();

    const payload = {
      analyzedUrl: siteUrl,
      fetchedAt: now,
      scores: {
        performance: scoreFrom(body, "performance"),
        seo: scoreFrom(body, "seo"),
        accessibility: scoreFrom(body, "accessibility"),
        bestPractices: scoreFrom(body, "best-practices"),
      },
      strategy: "mobile",
      source: "Google PageSpeed Insights API v5 (Lighthouse)",
    };

    const serialized = JSON.stringify(payload);

    await d.db
      .insert(platformInsights)
      .values({ key: "pagespeed", json: serialized, updatedAt: now })
      .onConflictDoUpdate({
        target: platformInsights.key,
        set: { json: serialized, updatedAt: now },
      });

    return NextResponse.json({ ok: true, ...payload });
  } catch (e) {
    clearTimeout(kill);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Lighthouse zaman aşımı veya ağ hatası.", detail: msg }, { status: 504 });
  }
}
