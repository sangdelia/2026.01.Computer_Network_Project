import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const [opinions] = await execute(
    `SELECT o.id, o.summary, o.agree_count AS agreeCount, o.disagree_count AS disagreeCount,
            o.comment_count AS commentCount, o.created_at AS createdAt,
            t.title AS topicTitle, t.id AS topicId
     FROM opinions o
     JOIN topics t ON o.topic_id = t.id
     WHERE o.author_id = ?
     ORDER BY o.created_at DESC`,
    [user.id]
  ) as any;

  const [stats] = await execute(
    `SELECT
       COUNT(*) AS totalOpinions,
       COALESCE(SUM(agree_count), 0) AS totalAgrees,
       COALESCE(SUM(disagree_count), 0) AS totalDisagrees,
       COALESCE(SUM(comment_count), 0) AS totalComments
     FROM opinions WHERE author_id = ?`,
    [user.id]
  ) as any;

  return NextResponse.json({
    success: true,
    data: {
      user: { id: user.id, nickname: user.nickname, email: user.email },
      stats: stats[0],
      opinions,
    },
  });
}
