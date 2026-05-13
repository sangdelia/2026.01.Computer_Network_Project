import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { execute } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const [rows] = await execute(
    "SELECT id, nickname, email, password AS hashedPassword FROM users WHERE email = ?",
    [username]
  ) as any;

  if (!rows.length) {
    return NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 올바르지 않습니다." } }, { status: 401 });
  }

  const user = rows[0];
  const valid = await compare(password, user.hashedPassword);
  if (!valid) {
    return NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 올바르지 않습니다." } }, { status: 401 });
  }

  const payload = { id: user.id, nickname: user.nickname, email: user.email };
  const token = signToken(payload);

  const res = NextResponse.json({ success: true, data: payload });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
