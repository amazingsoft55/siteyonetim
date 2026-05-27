/** Node.js sürecinde SQLite (`better-sqlite3`) kullanılabilmesi için */
const nextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
