import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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
  mustChangePassword: users.mustChangePassword,
};

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

type PatchBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  siteId?: unknown;
  apartmentNo?: unknown | null;
  role?: unknown;
  forcePasswordChange?: unknown;
};

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) {
    return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });
  }

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const existing = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!existing[0]) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const curr = existing[0];
  let nextName = curr.name;
  let nextEmail = curr.emailOrPhone;
  let nextHash = curr.passwordHash;
  let nextSite = curr.siteId;
  let nextApt = curr.apartmentNo;
  let nextRole = curr.role as "SUPER_ADMIN" | "ADMIN" | "USER";
  let nextMustChange = curr.mustChangePassword === true;

  if (typeof raw.forcePasswordChange === "boolean") {
    nextMustChange = raw.forcePasswordChange;
  }

  if (typeof raw.name === "string" && raw.name.trim().length > 0) nextName = raw.name.trim();

  if (typeof raw.emailOrPhone === "string") {
    const e = raw.emailOrPhone.replace(/\s+/g, "").trim();
    if (e.length > 0) {
      const other = await d.db
        .select()
        .from(users)
        .where(eq(users.emailOrPhone, e))
        .limit(1);
      if (other[0] && other[0].id !== targetId) {
        return NextResponse.json({ error: "Bu e‑posta/telefon başka kullanıcıda kullanılıyor." }, { status: 409 });
      }
      nextEmail = e;
    }
  }

  if (typeof raw.password === "string" && raw.password.length > 0) {
    if (raw.password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
    }
    nextHash = await bcrypt.hash(raw.password, 10);
    nextMustChange = false;
  }

  if (typeof raw.siteId === "string" && raw.siteId.trim().length > 0) {
    nextSite = raw.siteId.trim();
  } else if (raw.siteId === null) {
    nextSite = null;
  }

  if (raw.apartmentNo === null) {
    nextApt = null;
  } else if (typeof raw.apartmentNo === "string") {
    const a = raw.apartmentNo.trim();
    nextApt = a.length > 0 ? a : null;
  }

  if (raw.role === "ADMIN" || raw.role === "USER" || raw.role === "SUPER_ADMIN") {
    nextRole = raw.role as typeof nextRole;
  }

  if (curr.role === "SUPER_ADMIN" && nextRole !== "SUPER_ADMIN") {
    const supers = await d.db.select().from(users).where(eq(users.role, "SUPER_ADMIN"));
    if (supers.length <= 1) {
      return NextResponse.json(
        { error: "Tek süper yönetici kalırken rol düşürülemez." },
        { status: 403 },
      );
    }
  }

  if (nextRole === "ADMIN" || nextRole === "USER") {
    if (!nextSite) {
      return NextResponse.json({ error: "ADMIN ve USER için site gereklidir." }, { status: 400 });
    }
  }

  if (nextRole === "SUPER_ADMIN") {
    nextSite = null;
    nextApt = null;
  }

  await d.db
    .update(users)
    .set({
      name: nextName,
      emailOrPhone: nextEmail,
      passwordHash: nextHash,
      siteId: nextSite,
      apartmentNo: nextApt,
      role: nextRole,
      mustChangePassword: nextMustChange,
    })
    .where(eq(users.id, targetId));

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
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const { id: targetId } = await ctx.params;
  if (!targetId) return NextResponse.json({ error: "Kimlik eksik" }, { status: 400 });
  if (targetId === session.id) {
    return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 403 });
  }

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const victim = await d.db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!victim[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (victim[0].role === "SUPER_ADMIN") {
    const allS = await d.db.select().from(users).where(eq(users.role, "SUPER_ADMIN"));
    if (allS.length <= 1) {
      return NextResponse.json({ error: "Son süper yönetici silinemez." }, { status: 403 });
    }
  }

  await d.db.delete(requests).where(eq(requests.userId, targetId));
  await d.db.delete(payments).where(eq(payments.userId, targetId));

  await d.db.delete(users).where(eq(users.id, targetId));
  return NextResponse.json({ success: true });
}
