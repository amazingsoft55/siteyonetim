/**
 * Paket bazlı özellik tanımları.
 * Her paket hangi özellikleri içereceği burada tanımlı.
 * Yeni özellik eklenirken FEATURE_KEYS ve PLAN_FEATURES güncellenmeli.
 */

export type PlanType = "starter" | "professional" | "enterprise";

/** Tüm kullanılabilir özellikler */
export const FEATURE_KEYS = [
  // -- Temel --
  "site_management",
  "user_management",
  "announcements",
  "requests",

  // -- Aidat --
  "payments",
  "payment_reports",

  // -- İletişim --
  "email_notifications",
  "push_notifications",

  // -- Raporlama --
  "basic_reports",
  "advanced_reports",
  "page_speed_insights",

  // -- Mobil --
  "pwa_app",

  // -- Yönetim --
  "multi_site",
  "support_tickets",
  "api_access",
  "custom_integrations",
  "dedicated_support",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Her paket hangi özellikleri içerir */
export const PLAN_FEATURES: Record<PlanType, FeatureKey[]> = {
  starter: [
    "site_management",
    "user_management",
    "announcements",
    "requests",
    "payments",
    "email_notifications",
  ],
  professional: [
    "site_management",
    "user_management",
    "announcements",
    "requests",
    "payments",
    "payment_reports",
    "email_notifications",
    "push_notifications",
    "basic_reports",
    "pwa_app",
    "support_tickets",
  ],
  enterprise: [
    "site_management",
    "user_management",
    "announcements",
    "requests",
    "payments",
    "payment_reports",
    "email_notifications",
    "push_notifications",
    "basic_reports",
    "advanced_reports",
    "page_speed_insights",
    "pwa_app",
    "multi_site",
    "support_tickets",
    "api_access",
    "custom_integrations",
    "dedicated_support",
  ],
};

/** Paket bilgileri */
export const PLAN_DETAILS: Record<PlanType, {
  name: string;
  maxSites: number;
  maxUsers: number;
  monthlyPrice: number;
  yearlyPrice: number;
}> = {
  starter: {
    name: "Başlangıç",
    maxSites: 1,
    maxUsers: 50,
    monthlyPrice: 49,
    yearlyPrice: 29,
  },
  professional: {
    name: "Profesyonel",
    maxSites: 3,
    maxUsers: 200,
    monthlyPrice: 99,
    yearlyPrice: 59,
  },
  enterprise: {
    name: "Kurumsal",
    maxSites: Infinity,
    maxUsers: Infinity,
    monthlyPrice: 199,
    yearlyPrice: 119,
  },
};

/** Özellik açıklamaları (admin paneli ve UI için) */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  site_management: "Site Yönetimi",
  user_management: "Kullanıcı Yönetimi",
  announcements: "Duyuru Sistemi",
  requests: "Talep Yönetimi",
  payments: "Aidat Takibi",
  payment_reports: "Ödeme Raporları",
  email_notifications: "E-posta Bildirimleri",
  push_notifications: "Push Bildirimleri",
  basic_reports: "Temel Raporlar",
  advanced_reports: "Gelişmiş Raporlar",
  page_speed_insights: "PageSpeed Analizi",
  pwa_app: "Mobil Uygulama (PWA)",
  multi_site: "Çoklu Site Yönetimi",
  support_tickets: "Destek Talepleri",
  api_access: "API Erişimi",
  custom_integrations: "Özel Entegrasyonlar",
  dedicated_support: "Dedicated Destek",
};

/** Özellik kategorileri (görsel gruplandırma için) */
export const FEATURE_CATEGORIES = [
  {
    name: "Temel",
    features: ["site_management", "user_management", "announcements", "requests"] as FeatureKey[],
  },
  {
    name: "Finans",
    features: ["payments", "payment_reports"] as FeatureKey[],
  },
  {
    name: "Bildirim",
    features: ["email_notifications", "push_notifications"] as FeatureKey[],
  },
  {
    name: "Raporlama",
    features: ["basic_reports", "advanced_reports", "page_speed_insights"] as FeatureKey[],
  },
  {
    name: "Platform",
    features: ["pwa_app", "multi_site", "support_tickets", "api_access", "custom_integrations", "dedicated_support"] as FeatureKey[],
  },
];

/** Sayfa → gerekli özellik eşlemesi */
export const PAGE_FEATURE_MAP: Record<string, FeatureKey[]> = {
  "/dashboard": ["site_management"],
  "/dashboard/payments": ["payments"],
  "/dashboard/payment": ["payments"],
  "/dashboard/announcements": ["announcements"],
  "/dashboard/requests": ["requests"],
  "/admin": ["site_management"],
  "/admin/kullanicilar": ["user_management"],
  "/admin/announcements": ["announcements"],
  "/admin/requests": ["requests"],
  "/admin/residents": ["payments"],
  "/admin/settings": ["site_management"],
  "/admin/destek": ["support_tickets"],
  "/admin/hesabim": ["site_management"],
  "/super-admin/insights/pagespeed": ["page_speed_insights"],
};

/** API → gerekli özellik eşlemesi */
export const API_FEATURE_MAP: Record<string, FeatureKey[]> = {
  "/api/announcements": ["announcements"],
  "/api/requests": ["requests"],
  "/api/payments": ["payments"],
  "/api/admin/users": ["user_management"],
  "/api/admin/residents": ["payments"],
  "/api/admin/support-tickets": ["support_tickets"],
};

/** Belirli bir plan, belirli bir özelliği içeriyor mu? */
export function hasFeature(planInfo: { plan: string } | null, feature: FeatureKey): boolean {
  if (!planInfo) return true;
  const planType = planInfo.plan as PlanType;
  const features = PLAN_FEATURES[planType];
  if (!features) return true;
  return features.includes(feature);
}
