import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { deleteUserCascade } from "@/lib/user-cascade-delete";
import { users } from "@/db/schema";

const publicCols = {
  id: users.id,
  name: users.name,
  emailOrPhone: users.emailOrPhone,
  role: users.role,
  siteId: users.siteId,
  apartmentNo: users.apartmentNo,
  createdAt: users.createdAt,
};

const SITE_ROLES = ["ADMIN", "USER"] as const;

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

function sameSiteMember(
  u: { role: string; siteId: string | null },
  siteId: string,
): boolean {
  return (SITE_ROLES as readonly string[]).includes(u.role) && u.siteId === siteId;
}

type PatchBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  apartmentNo?: unknown | null;
  role?: unknown;
};

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const existing = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const u = existing[0];
  if (!sameSiteMember(u, session.siteId)) {
    return NextResponse.json({ error: "Bu hesap düzenlenemez." }, { status: 403 });
  }

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  if (targetId === session.id) {
    const nextLogin =
      typeof raw.emailOrPhone === "string" ?
        raw.emailOrPhone.replace(/\s+/g, "").trim()
      : u.emailOrPhone;
    const changingCredentials =
      nextLogin !== u.emailOrPhone ||
      (typeof raw.password === "string" && raw.password.length > 0);
    if (changingCredentials) {
      return NextResponse.json(
        {
          error: "Kendi e-posta veya şifrenizi buradan değiştiremezsiniz. Hesabım sayfasını kullanın.",
          redirect: "/admin/hesabim",
        },
        { status: 403 },
      );
    }
  }

  let nextName = u.name;
  let nextEmail = u.emailOrPhone;
  let nextHash = u.passwordHash;
  let nextApt = u.apartmentNo;
  let nextRole = u.role as "ADMIN" | "USER";

  if (typeof raw.name === "string" && raw.name.trim()) nextName = raw.name.trim();
  if (typeof raw.emailOrPhone === "string") {
    const e = raw.emailOrPhone.replace(/\s+/g, "").trim();
    if (e.length > 0) {
      const other = await d.db.select().from(users).where(eq(users.emailOrPhone, e)).limit(1);
      if (other[0] && other[0].id !== targetId) {
        return NextResponse.json({ error: "Bu oturum adı kullanımda." }, { status: 409 });
      }
      nextEmail = e;
    }
  }
  if (typeof raw.password === "string" && raw.password.length > 0) {
    if (raw.password.length < 6)
      return NextResponse.json({ error: "Şifre en az 6 karakter." }, { status: 400 });
    nextHash = await bcrypt.hash(raw.password, 10);
  }
  if (raw.role === "ADMIN" || raw.role === "USER") {
    if (targetId === session.id && raw.role === "USER") {
      return NextResponse.json({ error: "Kendi yönetici rolünüzü düşüremezsiniz." }, { status: 403 });
    }
    nextRole = raw.role;
  }
  if (nextRole === "USER") {
    if (raw.apartmentNo === null) nextApt = null;
    else if (typeof raw.apartmentNo === "string") {
      const a = raw.apartmentNo.trim();
      nextApt = a.length > 0 ? a : null;
    }
  } else {
    nextApt = null;
  }

  try {
    await d.db
      .update(users)
      .set({
        name: nextName,
        emailOrPhone: nextEmail,
        passwordHash: nextHash,
        apartmentNo: nextApt,
        role: nextRole,
      })
      .where(and(eq(users.id, targetId), eq(users.siteId, session.siteId)));

    const out = await d.db.select(publicCols).from(users).where(eq(users.id, targetId)).limit(1);
    return NextResponse.json({
      ...out[0],
      notice:
        typeof raw.emailOrPhone === "string" || typeof raw.password === "string" ?
          "E‑posta veya şifre değiştiyse kullanıcı tekrar giriş yapmalıdır."
        : undefined,
    });
  } catch (e) {
    return jsonSqlError(e, "Güncellenemedi.");
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });
  if (targetId === session.id) {
    return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 403 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const victim = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!victim[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (!sameSiteMember(victim[0], session.siteId)) {
    return NextResponse.json({ error: "Bu hesap silinemez." }, { status: 403 });
  }

  if (victim[0].role === "ADMIN") {
    const admins = await d.db
      .select()
      .from(users)
      .where(and(eq(users.siteId, session.siteId), eq(users.role, "ADMIN")));
    if (admins.length <= 1) {
      return NextResponse.json({ error: "Son yönetici silinemez." }, { status: 403 });
    }
  }

  try {
    await deleteUserCascade(d.db, targetId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Silinemedi.");
  }
}
