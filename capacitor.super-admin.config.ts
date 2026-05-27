import type { CapacitorConfig } from "@capacitor/cli";
import { withRemoteServer } from "./capacitor.base";

/** Süper yönetici konsolu — ayrı uygulama kimliği (Play Store / App Store). */
const config: CapacitorConfig = withRemoteServer(
  {
    appId: "com.siteyonetim.superadmin",
    appName: "SY Süper Yönetici",
    webDir: "public",
    android: { path: "android-super-admin" },
    ios: { path: "ios-super-admin" },
  },
  "/super-admin",
);

export default config;
