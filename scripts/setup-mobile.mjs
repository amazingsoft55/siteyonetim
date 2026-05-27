/**
 * Capacitor native projelerini hazırlar (site + süper yönetici).
 * CAPACITOR_SERVER_URL veya NEXT_PUBLIC_SITE_URL canlı site kökü olmalıdır.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function run(cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const origin =
  process.env.CAPACITOR_SERVER_URL?.trim()?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "");

if (!origin) {
  console.error(
    "[mobile] CAPACITOR_SERVER_URL veya NEXT_PUBLIC_SITE_URL tanımlayın (ör. https://siteyonetim.xxx.workers.dev)",
  );
  process.exit(1);
}

console.log(`[mobile] Sunucu: ${origin}`);

const stringsPath = path.join(root, "android/app/src/main/res/values/strings.xml");
if (fs.existsSync(stringsPath)) {
  let xml = fs.readFileSync(stringsPath, "utf8");
  xml = xml.replace(/<string name="app_name">.*?<\/string>/, "<string name=\"app_name\">Site Yönetimi</string>");
  xml = xml.replace(
    /<string name="title_activity_main">.*?<\/string>/,
    "<string name=\"title_activity_main\">Site Yönetimi</string>",
  );
  fs.writeFileSync(stringsPath, xml);
}

run("npx", ["cap", "sync", "--config", "capacitor.config.ts"]);

const superAndroid = path.join(root, "android-super-admin");
if (!fs.existsSync(superAndroid)) {
  console.log("[mobile] Süper yönetici Android projesi oluşturuluyor…");
  run("npx", ["cap", "add", "android", "--config", "capacitor.super-admin.config.ts"]);
} else {
  run("npx", ["cap", "sync", "--config", "capacitor.super-admin.config.ts"]);
}

const superStrings = path.join(superAndroid, "app/src/main/res/values/strings.xml");
if (fs.existsSync(superStrings)) {
  let xml = fs.readFileSync(superStrings, "utf8");
  xml = xml.replace(/<string name="app_name">.*?<\/string>/, "<string name=\"app_name\">SY Süper Yönetici</string>");
  xml = xml.replace(
    /<string name="title_activity_main">.*?<\/string>/,
    "<string name=\"title_activity_main\">SY Süper Yönetici</string>",
  );
  fs.writeFileSync(superStrings, xml);
}

console.log("\n[mobile] Hazır.");
console.log("  Site yönetimi APK:  npm run mobile:android");
console.log("  Süper admin APK:    npm run mobile:android:super");
console.log("  iOS (Mac):          npm run mobile:ios  /  npm run mobile:ios:super");
