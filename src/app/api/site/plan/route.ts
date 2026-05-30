import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { getSitePlan } from "@/lib/plan-guard";
import { PLAN_FEATURES, FEATURE_LABELS, PLAN_DETAILS } from "@/lib/features";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

/** Kullanıcının sitesinin plan bilgisi ve özellikleri */
export async function GET() {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const planInfo = await getSitePlan(d.db, session.siteId);

  return NextResponse.json({
    plan: planInfo.plan,
    planName: PLAN_DETAILS[planInfo.plan].name,
    maxSites: planInfo.maxSites,
    maxUsers: planInfo.maxUsers,
    features: planInfo.features.map((f) => ({
      key: f,
      label: FEATURE_LABELS[f],
      enabled: true,
    })),
    allFeatures: Object.entries(FEATURE_LABELS).map(([key, label]) => ({
      key,
      label,
      enabled: planInfo.features.includes(key as keyof typeof FEATURE_LABELS),
    })),
  });
}
