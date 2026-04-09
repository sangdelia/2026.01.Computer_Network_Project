"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Opinion, SortType } from "@/lib/types";
import { dailyIssues, mockOpinions } from "@/lib/mock-data";
import { TopicHeader } from "@/components/topic-header";
import { SortTab } from "@/components/sort-tab";
import { OpinionList } from "@/components/opinion-list";
import { WriteButton } from "@/components/write-button";
import { OpinionDetail } from "@/components/opinion-detail";
import { WriteModal } from "@/components/write-modal";
import { ArrowLeft } from "lucide-react";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.id);
  
  const topic = dailyIssues.find((t) => t.id === topicId) || dailyIssues[0];
  
  const [opinions, setOpinions] = useState<Opinion[]>(
    mockOpinions.filter((o) => o.topicId === topicId || topicId === 1)
  );
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [sort, setSort] = useState<SortType>("latest");

  const sortedOpinions = useMemo(() => {
    const sorted = [...opinions];
    if (sort === "latest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      sorted.sort((a, b) => b.agreeCount - a.agreeCount);
    }
    return sorted;
  }, [opinions, sort]);

  const handleSelectOpinion = (opinion: Opinion) => {
    setSelectedOpinion(opinion);
  };

  const handleBackToList = () => {
    setSelectedOpinion(null);
  };

  const handleWriteOpinion = (summary: string, content: string) => {
    const newOpinion: Opinion = {
      id: Date.now(),
      topicId: topic.id,
      authorId: 3,
      authorNickname: "나",
      summary,
      content,
      agreeCount: 0,
      disagreeCount: 0,
      commentCount: 0,
      myReaction: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOpinions((prev) => [newOpinion, ...prev]);
    setShowWriteModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>칠판으로 돌아가기</span>
          </button>
        </div>
      </div>

      <TopicHeader topic={topic} />

      <main className="flex h-[calc(100vh-180px)]">
        {/* Left: Opinion List */}
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="max-w-full">
            <SortTab
              sort={sort}
              onChange={setSort}
              totalCount={opinions.length}
            />

            <OpinionList
              opinions={sortedOpinions}
              onSelectOpinion={handleSelectOpinion}
            />
          </div>
        </div>

        {/* Right: Opinion Detail or Placeholder */}
        <div className="w-1/2 overflow-y-auto bg-secondary/30">
          {selectedOpinion ? (
            <div className="p-6">
              <OpinionDetail opinion={selectedOpinion} onBack={handleBackToList} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-2">
                  의견을 선택해주세요
                </p>
                <p className="text-sm text-muted-foreground">
                  왼쪽 목록에서 의견을 클릭하면 상세 내용이 표시됩니다
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <WriteButton onClick={() => setShowWriteModal(true)} />

      {showWriteModal && (
        <WriteModal
          topicTitle={topic.title}
          onClose={() => setShowWriteModal(false)}
          onSubmit={handleWriteOpinion}
        />
      )}
    </div>
  );
}
