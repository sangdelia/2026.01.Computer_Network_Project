"use client";

import { cn } from "@/lib/utils";

interface PostItProps {
  title: string;
  opinionCount: number;
  color: "yellow" | "pink" | "blue" | "green" | "orange";
  rotation?: number;
  onClick: () => void;
}

const colorStyles = {
  yellow: "bg-amber-200 text-amber-900",
  pink: "bg-pink-200 text-pink-900",
  blue: "bg-sky-200 text-sky-900",
  green: "bg-emerald-200 text-emerald-900",
  orange: "bg-orange-200 text-orange-900",
};

export function PostIt({ title, opinionCount, color, rotation = 0, onClick }: PostItProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "postit w-44 h-44 p-4 flex flex-col cursor-pointer",
        colorStyles[color]
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="flex-1 flex items-center justify-center">
        <p className="text-center text-sm font-medium leading-snug line-clamp-4">
          {title}
        </p>
      </div>
      <div className="mt-auto pt-2 border-t border-current/20">
        <p className="text-xs text-center opacity-70">
          {opinionCount}개의 의견
        </p>
      </div>
    </button>
  );
}
