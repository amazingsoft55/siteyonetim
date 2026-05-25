import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/db";
import { users, sites, payments, announcements, requests } from "@/db/schema";
import * as bcrypt from "bcryptjs";

export const runtime = "edge";

export async function GET() {
  try {
    let dbBinding: D1Database | undefined;
    try {
      const { env } = getRequestContext() as { env: { DB?: D1Database } };
      dbBinding = env.DB;
    } catch {
      return NextResponse.json(
        { error: "Seed için Cloudflare D1 bağlamı gerekli (yerelde wrangler pages dev)." },
        { status: 503 },
      );
    }

    const db = getDb(dbBinding);

    // Veritabanının dolu olup olmadığını kontrol et
    const existingSites = await db.select().from(sites).limit(1);
    if (existingSites.length > 0) {
      return NextResponse.json({ message: "Veritabanı zaten dolu, seeding iptal edildi." });
    }

    // 1. Örnek Site Oluştur
    const siteId = "site-1";
    await db.insert(sites).values({
      id: siteId,
      name: "Gül Apartmanı",
      address: "Çankaya, Ankara",
    });

    // 2. Şifreleri hashle (Tüm şifreler "123456" olarak belirlenecek, süper admin hariç)
    const superAdminPassword = await bcrypt.hash("admin123", 10);
    const defaultPassword = await bcrypt.hash("123456", 10);

    // 3. Kullanıcıları Oluştur
    await db.insert(users).values([
      {
        id: "superadmin",
        name: "Sistem Yöneticisi",
        emailOrPhone: "superadmin",
        passwordHash: superAdminPassword,
        role: "SUPER_ADMIN",
      },
      {
        id: "admin-1",
        name: "Apartman Yöneticisi",
        emailOrPhone: "admin",
        passwordHash: superAdminPassword,
        role: "ADMIN",
        siteId: siteId,
      },
      {
        id: "user-1",
        name: "Ahmet Yılmaz",
        emailOrPhone: "5555555555",
        passwordHash: defaultPassword,
        role: "USER",
        siteId: siteId,
        apartmentNo: "Daire 5",
      },
      {
        id: "user-2",
        name: "Ayşe Kaya",
        emailOrPhone: "5321234567",
        passwordHash: defaultPassword,
        role: "USER",
        siteId: siteId,
        apartmentNo: "Daire 12",
      }
    ]);

    // 4. Örnek Duyurular Oluştur
    await db.insert(announcements).values([
      {
        id: "ann-1",
        siteId: siteId,
        title: "Asansör Bakımı",
        content: "Bu perşembe saat 10:00 ile 14:00 arasında asansör bakımı yapılacaktır.",
      },
      {
        id: "ann-2",
        siteId: siteId,
        title: "Yönetim Toplantısı",
        content: "Pazar günü saat 19:00'da sığınakta toplantı yapılacaktır, katılım zorunludur.",
      }
    ]);

    // 5. Örnek Aidatlar Oluştur
    await db.insert(payments).values([
      {
        id: "pay-1",
        userId: "user-1",
        siteId: siteId,
        amount: 500,
        title: "Ocak 2024 Aidatı",
        status: "UNPAID",
        dueDate: "2024-01-31",
      },
      {
        id: "pay-2",
        userId: "user-1",
        siteId: siteId,
        amount: 500,
        title: "Şubat 2024 Aidatı",
        status: "UNPAID",
        dueDate: "2024-02-28",
      },
      {
        id: "pay-3",
        userId: "user-2",
        siteId: siteId,
        amount: 500,
        title: "Ocak 2024 Aidatı",
        status: "PAID",
        dueDate: "2024-01-31",
      }
    ]);

    // 6. Örnek Talepler Oluştur
    await db.insert(requests).values([
      {
        id: "req-1",
        userId: "user-1",
        siteId: siteId,
        subject: "Boru Sızıntısı",
        description: "Banyodan alt kata su sızıyor, acil usta çağırabilir miyiz?",
        status: "OPEN",
      }
    ]);

    return NextResponse.json({ message: "Veritabanı başarıyla oluşturuldu ve örnek veriler eklendi!" });
  } catch (error: any) {
    return NextResponse.json({ error: "Seeding başarısız", details: error.message }, { status: 500 });
  }
}
