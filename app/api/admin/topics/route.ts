import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { getUser } from "@/lib/auth";

// 어드민 전용: 주제 수동 추가
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "관리자만 접근 가능합니다." } }, { status: 403 });
  }

  const { title } = await req.json();
  if (!title || title.trim().length < 5 || title.trim().length > 60) {
    return NextResponse.json({ success: false, error: { code: "INVALID_TITLE", message: "주제는 5~60자여야 합니다." } }, { status: 400 });
  }

  const [result] = await execute(
    "INSERT INTO topics (title, is_active) VALUES (?, TRUE)",
    [title.trim()]
  ) as any;

  return NextResponse.json({ success: true, data: { id: result.insertId, title: title.trim() } }, { status: 201 });
}

// 어드민 전용: 주제 활성/비활성 토글
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "관리자만 접근 가능합니다." } }, { status: 403 });
  }

  const { topicId, isActive } = await req.json();
  await execute("UPDATE topics SET is_active = ? WHERE id = ?", [isActive, topicId]);
  return NextResponse.json({ success: true });
}
