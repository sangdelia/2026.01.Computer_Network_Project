"use client";

import { Comment } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  onDelete?: () => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.authorNickname}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isMine && (
              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                내 댓글
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {comment.content}
          </p>
        </div>
        {comment.isMine && onDelete && (
          <button
            onClick={onDelete}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="댓글 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
