"use client";

import { Comment } from "@/lib/types";
import { CommentItem } from "./comment-item";

interface CommentListProps {
  comments: Comment[];
  onDeleteComment?: (commentId: number) => void;
}

export function CommentList({ comments, onDeleteComment }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={
            comment.isMine && onDeleteComment
              ? () => onDeleteComment(comment.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}
