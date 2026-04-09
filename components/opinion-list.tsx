"use client";

import { Opinion } from "@/lib/types";
import { OpinionCard } from "./opinion-card";

interface OpinionListProps {
  opinions: Opinion[];
  onSelectOpinion: (opinion: Opinion) => void;
}

export function OpinionList({ opinions, onSelectOpinion }: OpinionListProps) {
  if (opinions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          아직 등록된 의견이 없습니다.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          첫 번째로 의견을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {opinions.map((opinion) => (
        <OpinionCard
          key={opinion.id}
          opinion={opinion}
          onClick={() => onSelectOpinion(opinion)}
        />
      ))}
    </div>
  );
}
