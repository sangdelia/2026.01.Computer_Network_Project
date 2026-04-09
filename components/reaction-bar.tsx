"use client";

import { ReactionType } from "@/lib/types";
import { cn, calculateAgreeRate } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ReactionBarProps {
  agreeCount: number;
  disagreeCount: number;
  myReaction: ReactionType | null;
  onReact: (type: ReactionType) => void;
}

export function ReactionBar({
  agreeCount,
  disagreeCount,
  myReaction,
  onReact,
}: ReactionBarProps) {
  const agreeRate = calculateAgreeRate(agreeCount, disagreeCount);

  return (
    <div className="border-y border-border py-4">
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => onReact("AGREE")}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
            myReaction === "AGREE"
              ? "bg-agree text-agree-foreground"
              : "bg-secondary text-muted-foreground hover:bg-agree/10 hover:text-agree"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>공감</span>
          <span className="font-bold">{agreeCount}</span>
        </button>

        <button
          onClick={() => onReact("DISAGREE")}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
            myReaction === "DISAGREE"
              ? "bg-disagree text-disagree-foreground"
              : "bg-secondary text-muted-foreground hover:bg-disagree/10 hover:text-disagree"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>비공감</span>
          <span className="font-bold">{disagreeCount}</span>
        </button>
      </div>

      {agreeRate !== null && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>공감률</span>
            <span className="font-medium">{agreeRate}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-agree transition-all duration-300"
              style={{ width: `${agreeRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
