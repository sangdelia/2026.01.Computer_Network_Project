import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const [rows] = await execute(
    "SELECT id, nickname, email FROM users WHERE email = ? AND password = ?",
    [username, password]
  ) as any;

  if (!rows.length) {
    return NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 올바르지 않습니다." } }, { status: 401 });
  }

  const user = rows[0];
  return NextResponse.json({
    success: true,
    data: { id: user.id, nickname: user.nickname, email: user.email },
  });
}
