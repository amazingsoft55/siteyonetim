import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { tryGetDb } from "@/lib/cloudflare-db";
import { users } from "@/db/schema";

export const runtime = "edge";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

function noDb() {
  return NextResponse.json({ error: "Veritabanı bağlamı yok." }, { status: 503 });
}

const publicUserColumns = {
  id: users.id,
  name: users.name,
  emailOrPhone: users.emailOrPhone,
  role: users.role,
  siteId: users.siteId,
  apartmentNo: users.apartmentNo,
  createdAt: users.createdAt,
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = tryGetDb();
  if (!d.ok) return noDb();

  const list = await d.db
    .select(publicUserColumns)
    .from(users)
    .where(and(eq(users.siteId, session.siteId), eq(users.role, "USER")));

  return NextResponse.json(list);
}

type Body = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  apartmentNo?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = tryGetDb();
  if (!d.ok) return noDb();

  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const emailOrPhone =
    typeof raw.emailOrPhone === "string" ? raw.emailOrPhone.replace(/\s+/g, "").trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const apartmentNo =
    typeof raw.apartmentNo === "string" && raw.apartmentNo.trim().length > 0
      ? raw.apartmentNo.trim()
      : undefined;

  if (!name || !emailOrPhone || !password) {
    return NextResponse.json(
      { error: "Ad, oturum (e‑posta/telefon) ve şifre zorunludur." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const dup = await d.db.select().from(users).where(eq(users.emailOrPhone, emailOrPhone)).limit(1);
  if (dup.length) {
    return NextResponse.json({ error: "Bu oturum adı başka kullanıcıda kullanılıyor." }, { status: 409 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  await d.db.insert(users).values({
    id,
    name,
    emailOrPhone,
    passwordHash,
    role: "USER",
    siteId: session.siteId,
    apartmentNo,
  });

  const row = await d.db.select(publicUserColumns).from(users).where(eq(users.id, id)).limit(1);
  return NextResponse.json(row[0]);
}
