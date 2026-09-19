/**
 * Cloudflare Workers Builds derleme betiği.
 * `opennextjs-cloudflare build` çağrısı Next.js derlemesini ve worker paketini tek seferde üretir.
 */
import { spawnSync } from "node:child_process";

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) {
    process.exit(result.status === null ? 1 : result.status);
  }
}

const isNextOnly = process.env.SITEYONETIM_NEXT_ONLY === "1";

if (isNextOnly) {
  run("npx", ["next", "build"]);
} else {
  console.log("[siteyonetim] Cloudflare OpenNext tek seferlik hızlı derleme başlatılıyor...");
  run("npx", ["opennextjs-cloudflare", "build"], { SITEYONETIM_NEXT_ONLY: "1" });
}
