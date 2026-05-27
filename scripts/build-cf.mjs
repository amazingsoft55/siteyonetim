/** Yerel veya CI: OpenNext derlemesi (iç `npm run build` yalnızca Next çalıştırır). */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["opennextjs-cloudflare", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, SITEYONETIM_NEXT_ONLY: "1" },
});

process.exit(result.status === null ? 1 : result.status);
