import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";

import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { payments, users } from "@/db/schema";
import { createNotification } from "@/lib/notify";
import { sendBrandedEmail } from "@/lib/send-email";
import { buildBrandedEmailHtml } from "@/lib/email-template";
import { looksLikeEmail } from "@/lib/password-reset";


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

function toClientPayment(row: {
  id: string;
  title: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
}) {
  const when = row.paidAt ?? row.createdAt ?? new Date().toISOString();
  const datePart = when.includes("T") ? new Date(when).toLocaleDateString("tr-TR") : when;
  return {
    id: row.id,
    period: row.title,
    amount: row.amount,
    date: datePart,
    status: row.status === "PAID" ? "Tamamlandı" : "Bekliyor",
    type: "Kayıt",
  };
}

/** Ödemeler API (sakin veya site yöneticisi görünümü) */
export async function GET() {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const order = desc(payments.createdAt);

    if (session.role === "USER") {
      const rows = await d.db.select().from(payments).where(eq(payments.userId, session.id)).orderBy(order);
      return NextResponse.json(rows.map(toClientPayment));
    }

    if (session.role === "ADMIN" && session.siteId) {
      const siteUsers = await d.db.select({ id: users.id }).from(users).where(eq(users.siteId, session.siteId));
      const ids = siteUsers.map((u) => u.id);
      if (ids.length === 0) return NextResponse.json([]);
      const rows = await d.db
        .select()
        .from(payments)
        .where(inArray(payments.userId, ids))
        .orderBy(order);
      return NextResponse.json(rows.map(toClientPayment));
    }

    if (session.role === "SUPER_ADMIN") {
      const rows = await d.db.select().from(payments).orderBy(order).limit(500);
      return NextResponse.json(rows.map(toClientPayment));
    }

    return forbidden();
  } catch (e) {
    return jsonSqlError(e, "Ödemeler listelenemedi.");
  }
}

type UserPostBody = {
  amount?: unknown;
  period?: unknown;
  type?: unknown;
};

type AdminPostBody = UserPostBody & {
  userId?: unknown;
  markPaid?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: AdminPostBody;
  try {
    raw = (await request.json()) as AdminPostBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const amount = Number(raw.amount);
  const periodRaw = typeof raw.period === "string" ? raw.period.trim() : "";
  const typ = typeof raw.type === "string" && raw.type.trim().length > 0 ? raw.type.trim() : "Ödemesi";
  const period = periodRaw || new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Geçerli tutar gereklidir." }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const title = `Aidat · ${period} (${typ})`;

  try {
    if (session.role === "USER") {
      if (!session.siteId) {
        return NextResponse.json({ error: "Site bilgisi eksik." }, { status: 400 });
      }
      await d.db.insert(payments).values({
        id,
        userId: session.id,
        siteId: session.siteId,
        amount,
        title,
        status: "PAID",
        paidAt: nowIso,
      });
      const row = await d.db.select().from(payments).where(eq(payments.id, id)).limit(1);

      createNotification(d.db, {
        userId: session.id,
        title: "Aidat Ödemesi Alındı",
        body: `${period} dönemine ait ${amount.toLocaleString("tr-TR")} TL ödemeniz kaydedildi.`,
        type: "PAYMENT",
        href: "/dashboard/payments",
      });

      return NextResponse.json({ success: true, payment: row[0] ? toClientPayment(row[0]) : null });
    }

    if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
      const targetUser = typeof raw.userId === "string" ? raw.userId.trim() : "";
      if (!targetUser) {
        return NextResponse.json({ error: "userId zorunludur." }, { status: 400 });
      }

      const u = await d.db.select().from(users).where(eq(users.id, targetUser)).limit(1);
      if (!u.length) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
      }

      if (session.role === "ADMIN" && session.siteId && u[0].siteId !== session.siteId) {
        return NextResponse.json({ error: "Bu kullanıcı sizin sitenize ait değil." }, { status: 403 });
      }

      const markPaid = raw.markPaid !== false;
      await d.db.insert(payments).values({
        id,
        userId: targetUser,
        siteId: u[0].siteId ?? null,
        amount,
        title,
        status: markPaid ? "PAID" : "UNPAID",
        paidAt: markPaid ? nowIso : null,
      });

      const row = await d.db.select().from(payments).where(eq(payments.id, id)).limit(1);

      createNotification(d.db, {
        userId: targetUser,
        title: markPaid ? "Aidat Ödemesi Tamamlandı" : "Yeni Aidat Borcu",
        body: markPaid
          ? `${period} dönemine ait ${amount.toLocaleString("tr-TR")} TL ödemeniz yönetici tarafından onaylandı.`
          : `${period} dönemine ait ${amount.toLocaleString("tr-TR")} TL aidat borcunuz eklendi.`,
        type: "PAYMENT",
        href: "/dashboard/payments",
      });

      // Kullanıcıya email bildirimi gönder
      if (looksLikeEmail(u[0].emailOrPhone)) {
        const html = buildBrandedEmailHtml({
          title: markPaid ? "Aidat Ödemesi Onaylandı" : "Yeni Aidat Borcu",
          intro: `Merhaba ${u[0].name},`,
          bodyHtml: `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3f3f46">
            ${period} dönemine ait <strong>${amount.toLocaleString("tr-TR")} TL</strong> aidatınız ${
              markPaid ? "yönetici tarafından onaylandı." : "hesabınıza eklendi."
            }
          </p>`,
          ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"}/dashboard/payments`,
          ctaLabel: "Ödemeleri Görüntüle",
          footerNote: "Bu e-posta site yönetimi tarafından gönderilen bir aidat bildirimdir.",
        });
        sendBrandedEmail({
          to: u[0].emailOrPhone,
          subject: markPaid ? "Aidat Ödemesi Onaylandı — Site Yönetimi" : "Yeni Aidat Borcu — Site Yönetimi",
          html,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, payment: row[0] ? toClientPayment(row[0]) : null });
    }

    return forbidden();
  } catch (e) {
    return jsonSqlError(e, "Ödeme kaydedilemedi.");
  }
}
