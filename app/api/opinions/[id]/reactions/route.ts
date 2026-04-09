import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opinionId = Number(id);
  const { userId, type } = await req.json();

  if (type !== "AGREE" && type !== "DISAGREE") {
    return NextResponse.json({ success: false, error: { code: "INVALID_REACTION_TYPE", message: "반응 타입이 올바르지 않습니다." } }, { status: 400 });
  }

  // 본인 의견 반응 방지
  const [opinionRows] = await pool.execute("SELECT author_id FROM opinions WHERE id = ?", [opinionId]) as any;
  if (!opinionRows.length) {
    return NextResponse.json({ success: false, error: { code: "OPINION_NOT_FOUND", message: "의견을 찾을 수 없습니다." } }, { status: 404 });
  }
  if (opinionRows[0].author_id === userId) {
    return NextResponse.json({ success: false, error: { code: "SELF_REACTION", message: "본인 의견에는 반응할 수 없습니다." } }, { status: 403 });
  }

  const [existing] = await pool.execute(
    "SELECT id, type FROM reactions WHERE opinion_id = ? AND user_id = ?",
    [opinionId, userId]
  ) as any;

  if (existing.length > 0) {
    if (existing[0].type === type) {
      // 같은 반응 → 취소
      await pool.execute("DELETE FROM reactions WHERE id = ?", [existing[0].id]);
      const col = type === "AGREE" ? "agree_count" : "disagree_count";
      await pool.execute(`UPDATE opinions SET ${col} = ${col} - 1 WHERE id = ?`, [opinionId]);
    } else {
      // 반응 전환
      await pool.execute("UPDATE reactions SET type = ? WHERE id = ?", [type, existing[0].id]);
      const dec = existing[0].type === "AGREE" ? "agree_count" : "disagree_count";
      const inc = type === "AGREE" ? "agree_count" : "disagree_count";
      await pool.execute(`UPDATE opinions SET ${dec} = ${dec} - 1, ${inc} = ${inc} + 1 WHERE id = ?`, [opinionId]);
    }
  } else {
    // 새 반응
    await pool.execute("INSERT INTO reactions (opinion_id, user_id, type) VALUES (?, ?, ?)", [opinionId, userId, type]);
    const col = type === "AGREE" ? "agree_count" : "disagree_count";
    await pool.execute(`UPDATE opinions SET ${col} = ${col} + 1 WHERE id = ?`, [opinionId]);
  }

  const [[opinion]] = await pool.execute(
    "SELECT agree_count AS agreeCount, disagree_count AS disagreeCount FROM opinions WHERE id = ?",
    [opinionId]
  ) as any;

  const [myReactionRows] = await pool.execute(
    "SELECT type FROM reactions WHERE opinion_id = ? AND user_id = ?",
    [opinionId, userId]
  ) as any;

  return NextResponse.json({
    success: true,
    data: {
      agreeCount: opinion.agreeCount,
      disagreeCount: opinion.disagreeCount,
      myReaction: myReactionRows.length ? myReactionRows[0].type : null,
    },
  });
}
