import type { CapacitorConfig } from "@capacitor/cli";
import { withRemoteServer } from "./capacitor.base";

/** Site yönetimi — sakin / site yöneticisi (girişten başlar). */
const config: CapacitorConfig = withRemoteServer(
  {
    appId: "com.siteyonetim.app",
    appName: "Site Yönetimi",
    webDir: "public",
    android: { path: "android" },
    ios: { path: "ios" },
  },
  "/login",
);

export default config;
