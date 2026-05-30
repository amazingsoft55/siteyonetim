import type { PlatformDatabase } from "@/db/platform";
import { sites } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { PlanType, FeatureKey } from "@/lib/features";
import { PLAN_FEATURES, PLAN_DETAILS } from "@/lib/features";

export type SitePlanInfo = {
  plan: PlanType;
  features: FeatureKey[];
  maxSites: number;
  maxUsers: number;
};

const DEFAULT_PLAN: SitePlanInfo = {
  plan: "starter",
  features: PLAN_FEATURES.starter,
  maxSites: PLAN_DETAILS.starter.maxSites,
  maxUsers: PLAN_DETAILS.starter.maxUsers,
};

/** Site ID'den plan bilgisini getir */
export async function getSitePlan(
  db: PlatformDatabase,
  siteId: string | null | undefined,
): Promise<SitePlanInfo> {
  if (!siteId) return DEFAULT_PLAN;

  try {
    const rows = await db
      .select({ plan: sites.plan })
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);

    const plan = (rows[0]?.plan as PlanType) || "starter";
    const validPlan = ["starter", "professional", "enterprise"].includes(plan) ? plan : "starter";

    return {
      plan: validPlan,
      features: PLAN_FEATURES[validPlan],
      maxSites: PLAN_DETAILS[validPlan].maxSites,
      maxUsers: PLAN_DETAILS[validPlan].maxUsers,
    };
  } catch {
    return DEFAULT_PLAN;
  }
}

/** Belirli bir özelliğe sahip mi? */
export function hasFeature(sitePlan: SitePlanInfo, feature: FeatureKey): boolean {
  return sitePlan.features.includes(feature);
}

/** Birden fazla özellikten herhangi birine sahip mi? */
export function hasAnyFeature(sitePlan: SitePlanInfo, features: FeatureKey[]): boolean {
  return features.some((f) => sitePlan.features.includes(f));
}

/** Tüm özelliklere sahip mi? */
export function hasAllFeatures(sitePlan: SitePlanInfo, features: FeatureKey[]): boolean {
  return features.every((f) => sitePlan.features.includes(f));
}
