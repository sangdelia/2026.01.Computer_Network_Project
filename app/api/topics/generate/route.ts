import { NextRequest, NextResponse } from "next/server";
import { generateDailyTopics } from "@/lib/generate-topics";

// 내부 크론 호출 전용 - 시크릿 키로 보호
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const topics = await generateDailyTopics();
    return NextResponse.json({ success: true, data: topics });
  } catch (err) {
    console.error("[generate-topics]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
