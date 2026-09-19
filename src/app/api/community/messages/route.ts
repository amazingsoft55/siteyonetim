import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import {
  communityMessages,
  communityChannels,
  communityPolls,
  communityPollVotes,
  users,
} from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json({ error: "Kanal ID zorunludur" }, { status: 400 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    // Mesajları çek
    const rawMessages = await d.db
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
      const polls = await d.db
        .select()
        .from(communityPolls)
        .where(inArray(communityPolls.id, pollIds));

      const votes = await d.db
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

        const userVote = pollVotes.find((v) => v.userId === session.id);
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
      const isAuthor = m.userId === session.id;
      const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";
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
    if (!session || !session.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const siteId = session.siteId || "default_site";
    const body = (await req.json().catch(() => ({}))) as {
      channelId?: string;
      content?: string;
      imageUrl?: string;
      poll?: {
        question?: string;
        options?: string[];
        expiresAt?: string;
      };
    };
    const { channelId, content, imageUrl, poll } = body;

    if (!channelId || typeof channelId !== "string") {
      return NextResponse.json({ error: "Kanal ID zorunludur" }, { status: 400 });
    }

    // Kanal yetkisini kontrol et
    const [channel] = await d.db
      .select()
      .from(communityChannels)
      .where(eq(communityChannels.id, channelId))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Kanal bulunamadı" }, { status: 404 });
    }

    if (channel.isAnnouncementOnly && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
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
      await d.db.insert(communityPolls).values({
        id: createdPollId,
        siteId,
        channelId,
        createdBy: session.id,
        question: poll.question.trim(),
        options: JSON.stringify(poll.options.map((o: unknown) => String(o).trim()).filter(Boolean)),
        expiresAt: poll.expiresAt ? String(poll.expiresAt) : null,
      });
    }

    const messageId = "msg_" + nanoid(12);
    await d.db.insert(communityMessages).values({
      id: messageId,
      siteId,
      channelId,
      userId: session.id,
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
    if (!session || !session.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");
    if (!messageId) {
      return NextResponse.json({ error: "Mesaj ID zorunludur" }, { status: 400 });
    }

    const [msg] = await d.db
      .select()
      .from(communityMessages)
      .where(eq(communityMessages.id, messageId))
      .limit(1);

    if (!msg) {
      return NextResponse.json({ error: "Mesaj bulunamadı" }, { status: 404 });
    }

    const isAuthor = msg.userId === session.id;
    const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Bu mesajı silme yetkiniz yok" }, { status: 403 });
    }

    await d.db.delete(communityMessages).where(eq(communityMessages.id, messageId));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("DELETE /api/community/messages error:", err);
    return NextResponse.json({ error: "Mesaj silinemedi" }, { status: 500 });
  }
}
