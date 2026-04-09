"use client";

import { Plus } from "lucide-react";

interface WriteButtonProps {
  onClick: () => void;
}

export function WriteButton({ onClick }: WriteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
      aria-label="의견 작성"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
