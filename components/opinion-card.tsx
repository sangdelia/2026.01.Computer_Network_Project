"use client";

import { Opinion } from "@/lib/types";
import { formatRelativeTime, calculateAgreeRate, cn } from "@/lib/utils";
import { ThumbsUp, MessageCircle } from "lucide-react";

interface OpinionCardProps {
  opinion: Opinion;
  onClick: () => void;
}

export function OpinionCard({ opinion, onClick }: OpinionCardProps) {
  const agreeRate = calculateAgreeRate(opinion.agreeCount, opinion.disagreeCount);

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer border-b border-border px-4 py-5 transition-colors hover:bg-secondary/50 sm:px-6 lg:px-8"
    >
      <p className="mb-3 line-clamp-2 text-base font-medium leading-relaxed text-foreground group-hover:text-primary sm:text-lg">
        {opinion.summary}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="font-medium">{opinion.authorNickname}</span>
        <span className="text-border">|</span>
        <span>{formatRelativeTime(opinion.createdAt)}</span>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            <span>{opinion.agreeCount}</span>
            {agreeRate !== null && (
              <span className={cn(
                "ml-1 text-xs",
                agreeRate >= 70 ? "text-agree" : agreeRate <= 30 ? "text-disagree" : ""
              )}>
                ({agreeRate}%)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>{opinion.commentCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
