import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opinionId = Number(id);

  const [rows] = await execute(
    `SELECT c.id, c.content, u.nickname AS authorNickname, c.author_id AS authorId, c.created_at AS createdAt
     FROM comments c
     JOIN users u ON c.author_id = u.id
     WHERE c.opinion_id = ?
     ORDER BY c.created_at ASC`,
    [opinionId]
  );

  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } }, { status: 401 });

  const { id } = await params;
  const opinionId = Number(id);
  const { content } = await req.json();
  const userId = user.id;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ success: false, error: { code: "BLANK_COMMENT", message: "댓글 내용을 입력해주세요." } }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ success: false, error: { code: "INVALID_COMMENT_LENGTH", message: "댓글은 500자 이하여야 합니다." } }, { status: 400 });
  }

  const [result] = await execute(
    "INSERT INTO comments (opinion_id, author_id, content) VALUES (?, ?, ?)",
    [opinionId, userId, content.trim()]
  ) as any;

  await execute(
    "UPDATE opinions SET comment_count = comment_count + 1 WHERE id = ?",
    [opinionId]
  );

  return NextResponse.json({ success: true, data: { id: result.insertId } }, { status: 201 });
}
