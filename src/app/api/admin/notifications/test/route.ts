import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { createNotification } from "@/lib/notify";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let body: { title?: string; body?: string; type?: string };
  try {
    body = (await request.json()) as { title?: string; body?: string; type?: string };
  } catch {
    body = {};
  }

  const title = body.title?.trim() || "Test Bildirimi 🔔";
  const content = body.body?.trim() || "Bu bir test bildirimidir. Sistem içi bildirim altyapınız başarıyla çalışmaktadır!";
  const type = (body.type || "SYSTEM") as "WELCOME" | "PAYMENT" | "ANNOUNCEMENT" | "REQUEST" | "SYSTEM";

  const success = await createNotification(d.db, {
    userId: session.id,
    title,
    body: content,
    type,
    href: "/dashboard",
  });

  if (!success) {
    return NextResponse.json({ error: "Test bildirimi veritabanına eklenemedi." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Test bildirimi başarıyla oluşturuldu! Bildirim zilinizden görüntüleyebilirsiniz.",
  });
}
