import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { users } from "@/db/schema";
import { deleteUserCascade, deleteSiteCascade } from "@/lib/user-cascade-delete";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let body: { password?: unknown; deleteSiteAlso?: unknown };
  try {
    body = (await request.json()) as { password?: unknown; deleteSiteAlso?: unknown };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const deleteSiteAlso = Boolean(body.deleteSiteAlso);

  if (!password) {
    return NextResponse.json(
      { error: "Hesabınızı kalıcı olarak silmek için mevcut şifrenizi girmelisiniz." },
      { status: 400 }
    );
  }

  try {
    const userRows = await d.db.select().from(users).where(eq(users.id, session.id)).limit(1);
    const user = userRows[0];
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı hesabı bulunamadı." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Girdiğiniz şifre hatalı. Güvenlik gerekçesiyle hesap silinemedi." },
        { status: 400 }
      );
    }

    // Süper yönetici hesabı silinemez
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Süper yönetici hesabı bu panelden silinemez." },
        { status: 403 }
      );
    }

    // Yönetici ve siteyi de silmek istiyorsa
    if (user.role === "ADMIN" && user.siteId && deleteSiteAlso) {
      await deleteSiteCascade(d.db, user.siteId);
    } else {
      await deleteUserCascade(d.db, user.id);
    }

    const response = NextResponse.json({
      ok: true,
      message: "Hesabınız ve tüm ilişkili verileriniz kalıcı olarak başarıyla silindi.",
    });

    // Oturum çerezini temizle
    response.cookies.set("session", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return jsonSqlError(error, "Hesap silinirken bir hata oluştu.");
  }
}
