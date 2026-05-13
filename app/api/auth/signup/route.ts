import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { execute } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password, nickname } = await req.json();

  if (!username || username.length < 4 || username.length > 20) {
    return NextResponse.json({ success: false, error: { code: "INVALID_USERNAME", message: "아이디는 4~20자여야 합니다." } }, { status: 400 });
  }
  if (!nickname || nickname.length < 2 || nickname.length > 10) {
    return NextResponse.json({ success: false, error: { code: "INVALID_NICKNAME", message: "닉네임은 2~10자여야 합니다." } }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ success: false, error: { code: "INVALID_PASSWORD", message: "비밀번호는 8자 이상이어야 합니다." } }, { status: 400 });
  }

  const [existing] = await execute(
    "SELECT id FROM users WHERE email = ? OR nickname = ?",
    [username, nickname]
  ) as any;

  if (existing.length > 0) {
    return NextResponse.json({ success: false, error: { code: "DUPLICATE_USER", message: "이미 사용 중인 아이디 또는 닉네임입니다." } }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);
  const [result] = await execute(
    "INSERT INTO users (nickname, email, password) VALUES (?, ?, ?)",
    [nickname, username, hashedPassword]
  ) as any;

  const payload = { id: result.insertId, nickname, email: username };
  const token = signToken(payload);

  const res = NextResponse.json({ success: true, data: payload }, { status: 201 });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
