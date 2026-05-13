import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "daily-issues-jwt-secret-2026";

export interface JWTPayload {
  id: number;
  nickname: string;
  email: string;
  isAdmin?: boolean;
}

export function signToken(payload: Omit<JWTPayload, "isAdmin">): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): Omit<JWTPayload, "isAdmin"> | null {
  try {
    return jwt.verify(token, SECRET) as Omit<JWTPayload, "isAdmin">;
  } catch {
    return null;
  }
}

export async function getUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const adminEmails = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim());
  return { ...payload, isAdmin: adminEmails.includes(payload.email) };
}
