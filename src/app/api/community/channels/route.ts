import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { communityChannels, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
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

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const siteId = session.siteId || "default_site";

    // Kanalları getir
    let channels = await d.db
      .select()
      .from(communityChannels)
      .where(eq(communityChannels.siteId, siteId))
      .orderBy(asc(communityChannels.sortOrder));

    // Eğer henüz kanal oluşturulmamışsa varsayılan kanalları oluştur
    if (channels.length === 0) {
      const inserted = [];
      for (const def of DEFAULT_CHANNELS) {
        const id = "ch_" + nanoid(10);
        await d.db.insert(communityChannels).values({
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
    if (!session || !session.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Kanal oluşturma yetkiniz yok" }, { status: 403 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const siteId = session.siteId || "default_site";
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
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
    await d.db.insert(communityChannels).values({
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
