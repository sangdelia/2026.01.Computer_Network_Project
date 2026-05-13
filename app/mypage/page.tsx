"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Opinion {
  id: number;
  summary: string;
  agreeCount: number;
  disagreeCount: number;
  commentCount: number;
  createdAt: string;
  topicTitle: string;
  topicId: number;
}

interface Stats {
  totalOpinions: number;
  totalAgrees: number;
  totalDisagrees: number;
  totalComments: number;
}

export default function MyPage() {
  const router = useRouter();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [nickname, setNickname] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    fetch("/api/mypage")
      .then((res) => {
        if (res.status === 401) { router.push("/"); return null; }
        return res.json();
      })
      .then((json) => {
        if (!json?.success) return;
        setOpinions(json.data.opinions);
        setStats(json.data.stats);
        setNickname(json.data.user.nickname);
      })
      .catch(() => router.push("/"));
  }, [router]);

  return (
    <div className="chalkboard min-h-screen">
      <div className="chalkboard-inner min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/")}
            className="chalk-text flex items-center gap-2 text-xl hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-6 w-6" />
            <span>Back</span>
          </button>
          <h1 className="chalk-text text-3xl md:text-4xl font-bold flex-1 text-center">
            - My Page -
          </h1>
          <div className="w-16" />
        </div>

        {/* 닉네임 */}
        {nickname && (
          <p className="chalk-text text-2xl text-center mb-8 opacity-80">
            {nickname} 님의 활동 내역
          </p>
        )}

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { label: "작성한 의견", value: stats.totalOpinions, color: "post-it-yellow" },
              { label: "받은 응원 👍", value: stats.totalAgrees, color: "post-it-blue" },
              { label: "받은 반론 👎", value: stats.totalDisagrees, color: "post-it-pink" },
              { label: "달린 댓글", value: stats.totalComments, color: "post-it-green" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`post-it ${color} text-center`}>
                <p className="text-2xl font-bold text-gray-800">{Number(value)}</p>
                <p className="text-sm text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* 응원 환산 안내 (향후 확장) */}
        {stats && Number(stats.totalAgrees) > 0 && (
          <div className="max-w-2xl mx-auto mb-8 post-it post-it-orange text-center" style={{ transform: "rotate(-0.5deg)" }}>
            <p className="text-gray-700 text-sm font-medium">
              🎁 응원 {Number(stats.totalAgrees)}개 × 100원 = <span className="text-lg font-bold">{(Number(stats.totalAgrees) * 100).toLocaleString()}원</span> 상당
            </p>
            <p className="text-gray-500 text-xs mt-1">* 경품 교환 기능은 향후 업데이트 예정입니다</p>
          </div>
        )}

        {/* 내 의견 목록 */}
        <div className="max-w-2xl mx-auto">
          <h2 className="chalk-text text-2xl font-bold mb-4">내가 작성한 의견</h2>
          {opinions.length === 0 ? (
            <p className="chalk-text-dim text-center opacity-60 text-lg mt-8">아직 작성한 의견이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {opinions.map((op, i) => (
                <div
                  key={op.id}
                  onClick={() => router.push(`/topic/${op.topicId}`)}
                  className="post-it cursor-pointer hover:scale-[1.01] transition-all"
                  style={{ background: "linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)" }}
                >
                  <p className="text-xs text-gray-500 mb-1 truncate">📌 {op.topicTitle}</p>
                  <p className="font-medium text-gray-800 mb-2">{op.summary}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />{op.agreeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />{op.disagreeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />{op.commentCount}
                    </span>
                    <span className="ml-auto text-xs opacity-60" suppressHydrationWarning>
                      {isHydrated ? formatRelativeTime(op.createdAt) : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
