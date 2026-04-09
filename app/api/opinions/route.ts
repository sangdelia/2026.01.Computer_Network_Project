import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const sort = searchParams.get("sort") || "latest";

  if (!topicId) {
    return NextResponse.json({ success: false, error: { code: "MISSING_TOPIC_ID", message: "topicId가 필요합니다." } }, { status: 400 });
  }

  const orderBy = sort === "popular" ? "o.agree_count DESC" : "o.created_at DESC";

  const [rows] = await execute(
    `SELECT o.id, o.summary, u.nickname AS authorNickname,
            o.agree_count AS agreeCount, o.disagree_count AS disagreeCount,
            o.comment_count AS commentCount, o.created_at AS createdAt
     FROM opinions o
     JOIN users u ON o.author_id = u.id
     WHERE o.topic_id = ?
     ORDER BY ${orderBy}`,
    [topicId]
  );

  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topicId, authorId, summary, content } = body;

  if (!summary || summary.length < 10 || summary.length > 100) {
    return NextResponse.json({ success: false, error: { code: "INVALID_SUMMARY_LENGTH", message: "요약문은 10~100자여야 합니다." } }, { status: 400 });
  }
  if (!content || content.length < 50 || content.length > 5000) {
    return NextResponse.json({ success: false, error: { code: "INVALID_CONTENT_LENGTH", message: "전문은 50~5000자여야 합니다." } }, { status: 400 });
  }

  const [result] = await execute(
    "INSERT INTO opinions (topic_id, author_id, summary, content) VALUES (?, ?, ?, ?)",
    [topicId, authorId, summary, content]
  ) as any;

  return NextResponse.json({ success: true, data: { id: result.insertId } }, { status: 201 });
}
