"use client";

import { SortType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SortTabProps {
  sort: SortType;
  onChange: (sort: SortType) => void;
  totalCount: number;
}

export function SortTab({ sort, onChange, totalCount }: SortTabProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">
        총 <span className="font-semibold text-foreground">{totalCount}</span>
        개의 의견
      </p>
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        <button
          onClick={() => onChange("latest")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            sort === "latest"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          최신순
        </button>
        <button
          onClick={() => onChange("popular")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            sort === "popular"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          인기순
        </button>
      </div>
    </div>
  );
}
