import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const sort = searchParams.get("sort") || "latest";
  const user = await getUser();
  const userId = user?.id ?? null;

  if (!topicId) {
    return NextResponse.json({ success: false, error: { code: "MISSING_TOPIC_ID", message: "topicId가 필요합니다." } }, { status: 400 });
  }

  const orderBy = sort === "popular" ? "o.agree_count DESC" : "o.created_at DESC";

  const [rows] = await execute(
    `SELECT o.id, o.topic_id AS topicId, o.author_id AS authorId,
            u.nickname AS authorNickname, o.summary, o.content,
            o.agree_count AS agreeCount, o.disagree_count AS disagreeCount,
            o.comment_count AS commentCount, o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            r.type AS myReaction
     FROM opinions o
     JOIN users u ON o.author_id = u.id
     LEFT JOIN reactions r ON r.opinion_id = o.id AND r.user_id = ?
     WHERE o.topic_id = ?
     ORDER BY ${orderBy}`,
    [userId, topicId]
  );

  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } }, { status: 401 });
  }

  const { topicId, summary, content } = await req.json();

  const [topicRows] = await execute("SELECT is_active FROM topics WHERE id = ?", [topicId]) as any;
  if (!topicRows.length) {
    return NextResponse.json({ success: false, error: { code: "TOPIC_NOT_FOUND", message: "주제를 찾을 수 없습니다." } }, { status: 404 });
  }
  if (!topicRows[0].is_active) {
    return NextResponse.json({ success: false, error: { code: "TOPIC_CLOSED", message: "종료된 토론에는 의견을 작성할 수 없습니다." } }, { status: 403 });
  }

  if (!summary || summary.length < 10 || summary.length > 100) {
    return NextResponse.json({ success: false, error: { code: "INVALID_SUMMARY_LENGTH", message: "요약문은 10~100자여야 합니다." } }, { status: 400 });
  }
  if (!content || content.length < 50 || content.length > 5000) {
    return NextResponse.json({ success: false, error: { code: "INVALID_CONTENT_LENGTH", message: "전문은 50~5000자여야 합니다." } }, { status: 400 });
  }

  const [result] = await execute(
    "INSERT INTO opinions (topic_id, author_id, summary, content) VALUES (?, ?, ?, ?)",
    [topicId, user.id, summary, content]
  ) as any;

  return NextResponse.json({ success: true, data: { id: result.insertId } }, { status: 201 });
}
