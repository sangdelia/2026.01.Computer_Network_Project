import OpenAI from "openai";
import { execute } from "./db";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateDailyTopics(): Promise<{ id: number; title: string }[]> {
  // 기존 활성 주제 모두 비활성화
  await execute("UPDATE topics SET is_active = FALSE WHERE is_active = TRUE");

  // 최근 30개 주제 조회 (중복 방지)
  const [recent] = await execute(
    "SELECT title FROM topics ORDER BY created_at DESC LIMIT 30"
  ) as any;
  const recentTitles = recent.length
    ? recent.map((t: { title: string }) => t.title).join("\n- ")
    : "없음";

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `오늘의 Daily Issue 토론 주제 5개를 생성해줘.
조건:
- 한국 사회에서 찬성/반대가 명확히 갈리는 시사적 주제
- 각 주제는 20~40자 이내 문장
- 아래 기존 주제와 겹치지 말 것:
- ${recentTitles}

응답 형식 (번호와 주제만, 다른 설명 없이):
1. 주제 문장
2. 주제 문장
3. 주제 문장
4. 주제 문장
5. 주제 문장`,
      },
    ],
  });

  const raw = completion.choices[0].message.content?.trim() ?? "";
  const lines = raw.split("\n").filter((l) => /^\d+\./.test(l.trim()));
  const titles = lines
    .map((l) => l.replace(/^\d+\.\s*/, "").replace(/^["「]|["」]$/g, "").trim())
    .filter((t) => t.length >= 5 && t.length <= 60)
    .slice(0, 5);

  const inserted: { id: number; title: string }[] = [];
  for (const title of titles) {
    const [result] = await execute(
      "INSERT INTO topics (title, is_active) VALUES (?, TRUE)",
      [title]
    ) as any;
    inserted.push({ id: result.insertId, title });
  }

  return inserted;
}
