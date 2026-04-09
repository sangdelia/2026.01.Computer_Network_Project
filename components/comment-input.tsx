"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface CommentInputProps {
  onSubmit: (content: string) => void;
}

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border pt-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-primary-foreground transition-opacity disabled:opacity-50"
          aria-label="댓글 등록"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-right text-xs text-muted-foreground">
        {content.length}/500
      </p>
    </form>
  );
}
