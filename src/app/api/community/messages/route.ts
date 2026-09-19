import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  communityMessages,
  communityChannels,
  communityPolls,
  communityPollVotes,
  users,
} from "@/db/schema";
import { eq, desc, asc, and, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json({ error: "Kanal ID zorunludur" }, { status: 400 });
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Mesajları çek
    const rawMessages = await db
      .select({
        id: communityMessages.id,
        channelId: communityMessages.channelId,
        userId: communityMessages.userId,
        content: communityMessages.content,
        imageUrl: communityMessages.imageUrl,
        isPinned: communityMessages.isPinned,
        pollId: communityMessages.pollId,
        createdAt: communityMessages.createdAt,
        authorName: users.name,
        authorApartmentNo: users.apartmentNo,
        authorRole: users.role,
      })
      .from(communityMessages)
      .leftJoin(users, eq(communityMessages.userId, users.id))
      .where(eq(communityMessages.channelId, channelId))
      .orderBy(asc(communityMessages.createdAt))
      .limit(100);

    // Eğer anket içeren mesajlar varsa anket detaylarını topla
    const pollIds = rawMessages
      .map((m) => m.pollId)
      .filter((id): id is string => Boolean(id));

    const pollMap = new Map<
      string,
      {
        id: string;
        question: string;
        options: string[];
        expiresAt: string | null;
        totalVotes: number;
        userVotedOption: number | null;
        optionsWithVotes: { text: string; count: number; percent: number }[];
      }
    >();

    if (pollIds.length > 0) {
      const polls = await db
        .select()
        .from(communityPolls)
        .where(inArray(communityPolls.id, pollIds));

      const votes = await db
        .select()
        .from(communityPollVotes)
        .where(inArray(communityPollVotes.pollId, pollIds));

      for (const poll of polls) {
        let parsedOptions: string[] = [];
        try {
          parsedOptions = JSON.parse(poll.options || "[]");
        } catch {
          parsedOptions = [];
        }

        const pollVotes = votes.filter((v) => v.pollId === poll.id);
        const totalVotes = pollVotes.length;

        const userVote = pollVotes.find((v) => v.userId === session.userId);
        const userVotedOption = userVote !== undefined ? userVote.optionIndex : null;

        const optionsWithVotes = parsedOptions.map((opt, idx) => {
          const count = pollVotes.filter((v) => v.optionIndex === idx).length;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return {
            text: opt,
            count,
            percent,
          };
        });

        pollMap.set(poll.id, {
          id: poll.id,
          question: poll.question,
          options: parsedOptions,
          expiresAt: poll.expiresAt,
          totalVotes,
          userVotedOption,
          optionsWithVotes,
        });
      }
    }

    const formattedMessages = rawMessages.map((m) => {
      const isAuthor = m.userId === session.userId;
      const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
      return {
        id: m.id,
        channelId: m.channelId,
        content: m.content,
        imageUrl: m.imageUrl,
        isPinned: m.isPinned,
        createdAt: m.createdAt,
        isMine: isAuthor,
        canDelete: isAuthor || isAdmin,
        author: {
          id: m.userId,
          name: m.authorName || "Komşu",
          apartmentNo: m.authorApartmentNo ? `Daire ${m.authorApartmentNo}` : "Sakin",
          role: m.authorRole,
        },
        poll: m.pollId ? pollMap.get(m.pollId) || null : null,
      };
    });

    return NextResponse.json(formattedMessages);
  } catch (err: unknown) {
    console.error("GET /api/community/messages error:", err);
    return NextResponse.json({ error: "Mesajlar alınamadı" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const body = await req.json().catch(() => ({}));
    const { channelId, content, imageUrl, poll } = body;

    if (!channelId || typeof channelId !== "string") {
      return NextResponse.json({ error: "Kanal ID zorunludur" }, { status: 400 });
    }

    // Kanal yetkisini kontrol et
    const [channel] = await db
      .select()
      .from(communityChannels)
      .where(eq(communityChannels.id, channelId))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Kanal bulunamadı" }, { status: 404 });
    }

    if (channel.isAnnouncementOnly && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu kanal yalnızca resmi duyurular içindir. Sakinler mesaj yazamaz." },
        { status: 403 }
      );
    }

    if (!content && !imageUrl && !poll) {
      return NextResponse.json({ error: "Mesaj içeriği boş olamaz" }, { status: 400 });
    }

    let createdPollId: string | null = null;

    // Eğer anket oluşturuluyorsa
    if (poll && typeof poll.question === "string" && Array.isArray(poll.options) && poll.options.length >= 2) {
      createdPollId = "poll_" + nanoid(10);
      await db.insert(communityPolls).values({
        id: createdPollId,
        siteId,
        channelId,
        createdBy: user.id,
        question: poll.question.trim(),
        options: JSON.stringify(poll.options.map((o: unknown) => String(o).trim()).filter(Boolean)),
        expiresAt: poll.expiresAt ? String(poll.expiresAt) : null,
      });
    }

    const messageId = "msg_" + nanoid(12);
    await db.insert(communityMessages).values({
      id: messageId,
      siteId,
      channelId,
      userId: user.id,
      content: content ? String(content).trim() : (poll ? poll.question : "Paylaşım"),
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      pollId: createdPollId,
    });

    return NextResponse.json({ success: true, messageId });
  } catch (err: unknown) {
    console.error("POST /api/community/messages error:", err);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");
    if (!messageId) {
      return NextResponse.json({ error: "Mesaj ID zorunludur" }, { status: 400 });
    }

    const [msg] = await db
      .select()
      .from(communityMessages)
      .where(eq(communityMessages.id, messageId))
      .limit(1);

    if (!msg) {
      return NextResponse.json({ error: "Mesaj bulunamadı" }, { status: 404 });
    }

    const isAuthor = msg.userId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Bu mesajı silme yetkiniz yok" }, { status: 403 });
    }

    await db.delete(communityMessages).where(eq(communityMessages.id, messageId));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("DELETE /api/community/messages error:", err);
    return NextResponse.json({ error: "Mesaj silinemedi" }, { status: 500 });
  }
}
