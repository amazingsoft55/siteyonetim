import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { features } from "@/db/schema";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    let rows: typeof features.$inferSelect[];
    try {
      rows = await d.db.select().from(features);
    } catch {
      rows = [];
    }

    const parsed = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      category: r.category,
      active: r.active,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt,
    }));

    parsed.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json(parsed);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/features GET]", detail);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const body = await req.json() as Record<string, unknown>;
    const { name, description, icon, category, sortOrder, active } = body;

    if (!name) {
      return NextResponse.json({ error: "Özellik adı zorunludur." }, { status: 400 });
    }

    const id = `feat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await d.db.insert(features).values({
      id,
      name: String(name),
      description: description ? String(description) : null,
      icon: icon ? String(icon) : null,
      category: category ? String(category) : "genel",
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
      active: active === false ? false : true,
    });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/features POST]", detail);
    return NextResponse.json({ error: "Özellik oluşturulamadı.", detail }, { status: 500 });
  }
}
