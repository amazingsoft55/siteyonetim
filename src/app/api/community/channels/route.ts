import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { communityChannels, communityMessages, users } from "@/db/schema";
import { eq, asc, desc, sql, and } from "drizzle-orm";
import { nanoid } from "nanoid";

const DEFAULT_CHANNELS = [
  {
    name: "📢 Resmi Duyurular",
    slug: "duyurular",
    description: "Yönetim tarafından paylaşılan resmi bina duyuruları ve kararlar.",
    icon: "Megaphone",
    isAnnouncementOnly: true,
    sortOrder: 1,
  },
  {
    name: "💬 Komşu Sohbeti",
    slug: "sohbet",
    description: "Bina sakinleri arası tanışma, sohbet ve günlük iletişim.",
    icon: "MessageSquare",
    isAnnouncementOnly: false,
    sortOrder: 2,
  },
  {
    name: "🤝 Yardımlaşma & Ödünç",
    slug: "yardimlasma",
    description: "Merdiven, matkap, acil alet veya komşu desteği paylaşımları.",
    icon: "HeartHandshake",
    isAnnouncementOnly: false,
    sortOrder: 3,
  },
  {
    name: "🏷️ İkinci El & Takas",
    slug: "ikinci-el",
    description: "Kullanılmayan mobilya, kitap, çocuk eşyası devri ve satışı.",
    icon: "ShoppingBag",
    isAnnouncementOnly: false,
    sortOrder: 4,
  },
  {
    name: "🐾 Evcil Hayvanlar",
    slug: "evcil-hayvanlar",
    description: "Bina içi kedi, köpek ve evcil hayvan dostlarımız için yardımlaşma.",
    icon: "Sparkles",
    isAnnouncementOnly: false,
    sortOrder: 5,
  },
  {
    name: "💡 Öneri & Fikirler",
    slug: "oneri-fikirler",
    description: "Bina yaşam kalitesini artıracak yapıcı fikir ve öneriler.",
    icon: "Lightbulb",
    isAnnouncementOnly: false,
    sortOrder: 6,
  },
];

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const siteId = user.siteId || "default_site";

    // Kanalları getir
    let channels = await db
      .select()
      .from(communityChannels)
      .where(eq(communityChannels.siteId, siteId))
      .orderBy(asc(communityChannels.sortOrder));

    // Eğer henüz kanal oluşturulmamışsa varsayılan kanalları oluştur
    if (channels.length === 0) {
      const inserted = [];
      for (const def of DEFAULT_CHANNELS) {
        const id = "ch_" + nanoid(10);
        await db.insert(communityChannels).values({
          id,
          siteId,
          name: def.name,
          slug: def.slug,
          description: def.description,
          icon: def.icon,
          isAnnouncementOnly: def.isAnnouncementOnly,
          sortOrder: def.sortOrder,
        });
        inserted.push({
          id,
          siteId,
          name: def.name,
          slug: def.slug,
          description: def.description,
          icon: def.icon,
          isAnnouncementOnly: def.isAnnouncementOnly,
          sortOrder: def.sortOrder,
          createdAt: new Date().toISOString(),
        });
      }
      channels = inserted;
    }

    return NextResponse.json(channels);
  } catch (err: unknown) {
    console.error("GET /api/community/channels error:", err);
    return NextResponse.json({ error: "Kanallar alınamadı" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Kanal oluşturma yetkiniz yok" }, { status: 403 });
    }

    const siteId = user.siteId || "default_site";
    const body = await req.json().catch(() => ({}));
    const { name, description, icon, isAnnouncementOnly } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Kanal adı zorunludur" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
      .slice(0, 40);

    const id = "ch_" + nanoid(10);
    await db.insert(communityChannels).values({
      id,
      siteId,
      name: name.trim(),
      slug,
      description: description ? String(description).trim() : null,
      icon: icon ? String(icon).trim() : "MessageSquare",
      isAnnouncementOnly: !!isAnnouncementOnly,
      sortOrder: 10,
    });

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    console.error("POST /api/community/channels error:", err);
    return NextResponse.json({ error: "Kanal oluşturulamadı" }, { status: 500 });
  }
}
