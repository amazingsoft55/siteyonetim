/** After @cloudflare/next-on-pages: don't upload _worker.js as raw static asset (Wrangler migrates Pages → Workers pattern). */
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), ".vercel", "output", "static");
const ignore = path.join(dir, ".assetsignore");

if (!fs.existsSync(dir)) {
  console.error(
    "cf-pages-assetsignore: missing .vercel/output/static — run pages:build (next-on-pages) first.",
  );
  process.exit(1);
}
fs.writeFileSync(ignore, "_worker.js\n");
