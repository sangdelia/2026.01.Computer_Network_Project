import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const [rows] = await pool.execute(
    "SELECT id, title, created_at AS createdAt FROM topics WHERE is_active = TRUE ORDER BY id ASC"
  );
  return NextResponse.json({ success: true, data: rows });
}
