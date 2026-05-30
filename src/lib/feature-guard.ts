import { NextResponse } from "next/server";
import type { PlatformDatabase } from "@/db/platform";
import { getSitePlan } from "@/lib/plan-guard";
import { hasFeature, type FeatureKey } from "@/lib/features";

/**
 * API route'larda feature kontrolü yapar.
 * Erişim yoksa 403 döner, erişim varsa null döner.
 */
export async function requireFeature(
  db: PlatformDatabase,
  siteId: string | null | undefined,
  feature: FeatureKey,
): Promise<NextResponse | null> {
  const planInfo = await getSitePlan(db, siteId);
  if (!hasFeature(planInfo, feature)) {
    return NextResponse.json(
      {
        error: `Bu özellik ${planInfo.plan} paketinde mevcut değil.`,
        code: "FEATURE_NOT_AVAILABLE",
        requiredFeature: feature,
        currentPlan: planInfo.plan,
      },
      { status: 403 },
    );
  }
  return null;
}
