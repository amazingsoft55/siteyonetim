import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { emailNotConfiguredMessage, isEmailConfigured } from "@/lib/email-config";
import { issuePasswordResetEmail } from "@/lib/password-reset";
import { users } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const row = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
    if (!row[0]) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

    const u = row[0];
    if (u.siteId !== session.siteId || (u.role !== "ADMIN" && u.role !== "USER")) {
      return NextResponse.json({ error: "Bu hesap için mail gönderilemez." }, { status: 403 });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: emailNotConfiguredMessage() }, { status: 503 });
    }

    const send = await issuePasswordResetEmail(d.db, u);
    if (!send.ok) {
      return NextResponse.json({ error: send.error }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `${u.emailOrPhone} adresine şifre sıfırlama bağlantısı gönderildi.`,
    });
  } catch (e) {
    return jsonSqlError(e, "E-posta gönderilemedi.");
  }
}
