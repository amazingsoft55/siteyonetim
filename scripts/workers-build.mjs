/**
 * Cloudflare Workers Builds varsayılanı `npm run build` + `npx wrangler deploy` kullanır.
 * Wrangler deploy, OpenNext paketini (.open-next) bekler; yalnızca `next build` yetmez.
 *
 * WORKERS_CI=1 iken tam OpenNext derlemesi; opennext içinden gelen `npm run build` çağrısında
 * yalnızca Next (SITEYONETIM_NEXT_ONLY=1 ile sonsuz döngü önlenir).
 */
import { spawnSync } from "node:child_process";

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  process.exit(result.status === null ? 1 : result.status);
}

const workersCi = process.env.WORKERS_CI === "1";
const nextOnly = process.env.SITEYONETIM_NEXT_ONLY === "1";

if (workersCi && !nextOnly) {
  console.log("[siteyonetim] WORKERS_CI: opennextjs-cloudflare build");
  run("npx", ["opennextjs-cloudflare", "build"], { SITEYONETIM_NEXT_ONLY: "1" });
}

run("npx", ["next", "build"]);
