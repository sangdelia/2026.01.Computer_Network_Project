import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opinionId = Number(id);

  const [rows] = await pool.execute(
    `SELECT o.id, o.topic_id AS topicId, o.author_id AS authorId,
            u.nickname AS authorNickname, o.summary, o.content,
            o.agree_count AS agreeCount, o.disagree_count AS disagreeCount,
            o.comment_count AS commentCount,
            o.created_at AS createdAt, o.updated_at AS updatedAt
     FROM opinions o
     JOIN users u ON o.author_id = u.id
     WHERE o.id = ?`,
    [opinionId]
  ) as any;

  if (!rows.length) {
    return NextResponse.json({ success: false, error: { code: "OPINION_NOT_FOUND", message: "의견을 찾을 수 없습니다." } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opinionId = Number(id);
  const { summary, content, userId } = await req.json();

  const [rows] = await pool.execute("SELECT author_id FROM opinions WHERE id = ?", [opinionId]) as any;
  if (!rows.length) {
    return NextResponse.json({ success: false, error: { code: "OPINION_NOT_FOUND", message: "의견을 찾을 수 없습니다." } }, { status: 404 });
  }
  if (rows[0].author_id !== userId) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "권한이 없습니다." } }, { status: 403 });
  }

  await pool.execute(
    "UPDATE opinions SET summary = ?, content = ? WHERE id = ?",
    [summary, content, opinionId]
  );

  return NextResponse.json({ success: true, data: { id: opinionId } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opinionId = Number(id);
  const { userId } = await req.json();

  const [rows] = await pool.execute("SELECT author_id FROM opinions WHERE id = ?", [opinionId]) as any;
  if (!rows.length) {
    return NextResponse.json({ success: false, error: { code: "OPINION_NOT_FOUND", message: "의견을 찾을 수 없습니다." } }, { status: 404 });
  }
  if (rows[0].author_id !== userId) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "권한이 없습니다." } }, { status: 403 });
  }

  await pool.execute("DELETE FROM opinions WHERE id = ?", [opinionId]);
  return NextResponse.json({ success: true, data: null });
}
