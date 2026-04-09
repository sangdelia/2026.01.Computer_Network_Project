"use client";

import { Topic } from "@/lib/types";

interface TopicHeaderProps {
  topic: Topic;
}

export function TopicHeader({ topic }: TopicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          현재 토론 주제
        </p>
        <h1 className="text-balance text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl">
          {topic.title}
        </h1>
      </div>
    </header>
  );
}
