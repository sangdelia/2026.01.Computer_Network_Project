import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function GET() {
  const [rows] = await execute(
    `SELECT t.id, t.title, t.created_at AS createdAt,
            COUNT(o.id) AS opinionCount
     FROM topics t
     LEFT JOIN opinions o ON o.topic_id = t.id
     WHERE t.is_active = TRUE
     GROUP BY t.id
     ORDER BY t.id ASC`
  );
  return NextResponse.json({ success: true, data: rows });
}
