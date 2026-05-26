import { defineConfig } from "drizzle-kit";

/** drizzle-kit konsolu; yerel SQLite dosya yolu DATABASE_PATH ile aynı kuraldır */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/siteyonetim.db",
  },
});
