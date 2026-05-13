import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } }, { status: 401 });

  const { id } = await params;
  const commentId = Number(id);
  const userId = user.id;

  const [rows] = await execute(
    "SELECT author_id, opinion_id FROM comments WHERE id = ?",
    [commentId]
  ) as any;

  if (!rows.length) {
    return NextResponse.json({ success: false, error: { code: "COMMENT_NOT_FOUND", message: "댓글을 찾을 수 없습니다." } }, { status: 404 });
  }
  if (rows[0].author_id !== userId) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "권한이 없습니다." } }, { status: 403 });
  }

  await execute("DELETE FROM comments WHERE id = ?", [commentId]);
  await execute(
    "UPDATE opinions SET comment_count = comment_count - 1 WHERE id = ?",
    [rows[0].opinion_id]
  );

  return NextResponse.json({ success: true, data: null });
}
