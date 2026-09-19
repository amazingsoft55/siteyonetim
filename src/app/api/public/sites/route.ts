import { NextResponse } from "next/server";
import { getPlatformDb } from "@/db/platform";
import { sites } from "@/db/schema";
import { databaseUnavailable } from "@/server/database/access";
import type { PlatformDatabase } from "@/db/platform";

export async function GET() {
  try {
    let db: PlatformDatabase;
    try {
      db = await getPlatformDb();
    } catch {
      return await databaseUnavailable();
    }

    const list = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
      })
      .from(sites);

    return NextResponse.json(list);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Siteler yüklenemedi", details: msg }, { status: 500 });
  }
}
