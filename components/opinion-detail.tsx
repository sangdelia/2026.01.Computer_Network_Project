"use client";

import { useState } from "react";
import { Opinion, Comment, ReactionType } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { ReactionBar } from "./reaction-bar";
import { CommentList } from "./comment-list";
import { CommentInput } from "./comment-input";
import { ArrowLeft, MoreVertical, Pencil, Trash2, MessageCircle } from "lucide-react";
import { mockComments } from "@/lib/mock-data";

interface OpinionDetailProps {
  opinion: Opinion;
  onBack: () => void;
}

export function OpinionDetail({ opinion, onBack }: OpinionDetailProps) {
  const [currentOpinion, setCurrentOpinion] = useState(opinion);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [showMenu, setShowMenu] = useState(false);

  const handleReact = (type: ReactionType) => {
    setCurrentOpinion((prev) => {
      const wasAgree = prev.myReaction === "AGREE";
      const wasDisagree = prev.myReaction === "DISAGREE";
      const isClicking = type;

      let newAgreeCount = prev.agreeCount;
      let newDisagreeCount = prev.disagreeCount;
      let newReaction: ReactionType | null = type;

      // 같은 버튼 다시 클릭 -> 취소
      if ((wasAgree && isClicking === "AGREE") || (wasDisagree && isClicking === "DISAGREE")) {
        newReaction = null;
        if (wasAgree) newAgreeCount--;
        if (wasDisagree) newDisagreeCount--;
      } else {
        // 다른 버튼 클릭 또는 처음 클릭
        if (wasAgree) newAgreeCount--;
        if (wasDisagree) newDisagreeCount--;
        if (isClicking === "AGREE") newAgreeCount++;
        if (isClicking === "DISAGREE") newDisagreeCount++;
      }

      return {
        ...prev,
        agreeCount: newAgreeCount,
        disagreeCount: newDisagreeCount,
        myReaction: newReaction,
      };
    });
  };

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now(),
      content,
      authorNickname: "나",
      createdAt: new Date().toISOString(),
      isMine: true,
    };
    setComments((prev) => [...prev, newComment]);
    setCurrentOpinion((prev) => ({
      ...prev,
      commentCount: prev.commentCount + 1,
    }));
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCurrentOpinion((prev) => ({
      ...prev,
      commentCount: prev.commentCount - 1,
    }));
  };

  const isMyOpinion = currentOpinion.authorId === 3; // Mock: 현재 사용자 ID가 3이라고 가정

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </button>

          {isMyOpinion && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="더보기"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-popover p-1 shadow-lg">
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary">
                    <Pencil className="h-4 w-4" />
                    수정
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary */}
        <div className="mb-6 rounded-lg bg-secondary/50 p-4">
          <p className="text-lg font-semibold leading-relaxed">
            {currentOpinion.summary}
          </p>
        </div>

        {/* Author & Date */}
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {currentOpinion.authorNickname}
          </span>
          <span>|</span>
          <span>{formatRelativeTime(currentOpinion.createdAt)}</span>
          {currentOpinion.updatedAt !== currentOpinion.createdAt && (
            <span className="text-xs">(수정됨)</span>
          )}
        </div>

        {/* Content */}
        <article className="prose prose-neutral mb-8 max-w-none">
          {currentOpinion.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Reaction Bar */}
        <ReactionBar
          agreeCount={currentOpinion.agreeCount}
          disagreeCount={currentOpinion.disagreeCount}
          myReaction={currentOpinion.myReaction}
          onReact={handleReact}
        />

        {/* Comments Section */}
        <section className="mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <MessageCircle className="h-5 w-5" />
            댓글 {currentOpinion.commentCount}개
          </h2>

          <CommentList
            comments={comments}
            onDeleteComment={handleDeleteComment}
          />

          <div className="mt-4">
            <CommentInput onSubmit={handleAddComment} />
          </div>
        </section>
      </main>
    </div>
  );
}
