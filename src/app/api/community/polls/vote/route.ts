import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { communityPolls, communityPollVotes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

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

    const body = await req.json().catch(() => ({}));
    const { pollId, optionIndex } = body;

    if (!pollId || typeof optionIndex !== "number") {
      return NextResponse.json({ error: "Anket ve seçenek bilgisi zorunludur" }, { status: 400 });
    }

    const [poll] = await db.select().from(communityPolls).where(eq(communityPolls.id, pollId)).limit(1);
    if (!poll) {
      return NextResponse.json({ error: "Anket bulunamadı" }, { status: 404 });
    }

    // Mevcut oyu kontrol et
    const [existingVote] = await db
      .select()
      .from(communityPollVotes)
      .where(
        and(
          eq(communityPollVotes.pollId, pollId),
          eq(communityPollVotes.userId, user.id)
        )
      )
      .limit(1);

    if (existingVote) {
      // Oyu güncelle
      await db
        .update(communityPollVotes)
        .set({ optionIndex })
        .where(eq(communityPollVotes.id, existingVote.id));
    } else {
      // Yeni oy kaydet
      const voteId = "vote_" + nanoid(10);
      await db.insert(communityPollVotes).values({
        id: voteId,
        pollId,
        userId: user.id,
        optionIndex,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/community/polls/vote error:", err);
    return NextResponse.json({ error: "Oy kaydedilemedi" }, { status: 500 });
  }
}
