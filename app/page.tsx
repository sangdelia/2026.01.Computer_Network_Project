"use client";

import { useState, useMemo } from "react";
import { Opinion, SortType } from "@/lib/types";
import { mockTopic, mockOpinions } from "@/lib/mock-data";
import { TopicHeader } from "@/components/topic-header";
import { SortTab } from "@/components/sort-tab";
import { OpinionList } from "@/components/opinion-list";
import { WriteButton } from "@/components/write-button";
import { OpinionDetail } from "@/components/opinion-detail";
import { WriteModal } from "@/components/write-modal";

export default function Home() {
  const [opinions, setOpinions] = useState<Opinion[]>(mockOpinions);
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
      topicId: mockTopic.id,
      authorId: 3, // Mock 현재 사용자
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

  // 상세 화면 표시
  if (selectedOpinion) {
    return (
      <OpinionDetail opinion={selectedOpinion} onBack={handleBackToList} />
    );
  }

  // 목록 화면
  return (
    <div className="min-h-screen bg-background">
      <TopicHeader topic={mockTopic} />

      <main className="mx-auto max-w-3xl">
        <SortTab
          sort={sort}
          onChange={setSort}
          totalCount={opinions.length}
        />

        <OpinionList
          opinions={sortedOpinions}
          onSelectOpinion={handleSelectOpinion}
        />
      </main>

      <WriteButton onClick={() => setShowWriteModal(true)} />

      {showWriteModal && (
        <WriteModal
          topicTitle={mockTopic.title}
          onClose={() => setShowWriteModal(false)}
          onSubmit={handleWriteOpinion}
        />
      )}
    </div>
  );
}
