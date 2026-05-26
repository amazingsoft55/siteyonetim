import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import { users, payments, requests } from "@/db/schema";

export const runtime = "edge";

const publicCols = {
  id: users.id,
  name: users.name,
  emailOrPhone: users.emailOrPhone,
  role: users.role,
  siteId: users.siteId,
  apartmentNo: users.apartmentNo,
  createdAt: users.createdAt,
};

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

type PatchBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  apartmentNo?: unknown | null;
};

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const existing = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const u = existing[0];
  if (u.role !== "USER" || u.siteId !== session.siteId) {
    return NextResponse.json(
      { error: "Sadece kendi sitenizdeki sakin hesapları düzenleyebilirsiniz." },
      { status: 403 },
    );
  }

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  let nextName = u.name;
  let nextEmail = u.emailOrPhone;
  let nextHash = u.passwordHash;
  let nextApt = u.apartmentNo;

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
  if (raw.apartmentNo === null) nextApt = null;
  else if (typeof raw.apartmentNo === "string") {
    const a = raw.apartmentNo.trim();
    nextApt = a.length > 0 ? a : null;
  }

  await d.db
    .update(users)
    .set({ name: nextName, emailOrPhone: nextEmail, passwordHash: nextHash, apartmentNo: nextApt })
    .where(and(eq(users.id, targetId), eq(users.role, "USER"), eq(users.siteId, session.siteId)));

  const out = await d.db.select(publicCols).from(users).where(eq(users.id, targetId)).limit(1);
  return NextResponse.json({
    ...out[0],
    notice:
      typeof raw.emailOrPhone === "string" || typeof raw.password === "string"
        ? "E‑posta veya şifre değiştiyse kullanıcı tekrar giriş yapmalıdır."
        : undefined,
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const victim = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!victim[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (victim[0].role !== "USER" || victim[0].siteId !== session.siteId) {
    return NextResponse.json({ error: "Bu hesap silinemez." }, { status: 403 });
  }

  await d.db.delete(requests).where(eq(requests.userId, targetId));
  await d.db.delete(payments).where(eq(payments.userId, targetId));
  await d.db.delete(users).where(eq(users.id, targetId));

  return NextResponse.json({ success: true });
}
