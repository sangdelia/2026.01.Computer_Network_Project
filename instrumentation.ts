export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { generateDailyTopics } = await import("./lib/generate-topics");

    // 매일 낮 12시에 오늘의 이슈 5개 자동 생성
    cron.schedule("0 12 * * *", async () => {
      console.log("[cron] 오늘의 Daily Issue 주제 생성 시작");
      try {
        const topics = await generateDailyTopics();
        console.log(`[cron] ${topics.length}개 주제 생성 완료:`, topics.map((t) => t.title));
      } catch (err) {
        console.error("[cron] 주제 생성 실패:", err);
      }
    }, { timezone: "Asia/Seoul" });

    console.log("[cron] Daily Issue 스케줄러 등록 완료 (매일 12:00 KST)");
  }
}
