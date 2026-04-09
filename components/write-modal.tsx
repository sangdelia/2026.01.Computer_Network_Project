"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface WriteModalProps {
  topicTitle: string;
  onClose: () => void;
  onSubmit: (summary: string, content: string) => void;
}

export function WriteModal({ topicTitle, onClose, onSubmit }: WriteModalProps) {
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const isSummaryValid = summary.length >= 10 && summary.length <= 100;
  const isContentValid = content.length >= 50 && content.length <= 5000;
  const isValid = isSummaryValid && isContentValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(summary, content);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-background shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <h2 className="text-lg font-semibold">의견 작성</h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Topic */}
          <div className="mb-6 rounded-lg bg-secondary/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              토론 주제
            </p>
            <p className="font-medium">{topicTitle}</p>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <label
              htmlFor="summary"
              className="mb-2 block text-sm font-medium"
            >
              요약문 <span className="text-destructive">*</span>
            </label>
            <input
              id="summary"
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="핵심 주장을 한 문장으로 요약해주세요 (10~100자)"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={100}
            />
            <div className="mt-1.5 flex justify-between text-xs">
              <span
                className={
                  summary.length > 0 && !isSummaryValid
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {summary.length < 10
                  ? `${10 - summary.length}자 더 입력해주세요`
                  : "적절한 길이입니다"}
              </span>
              <span className="text-muted-foreground">
                {summary.length}/100
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium"
            >
              전문 본문 <span className="text-destructive">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="주장에 대한 근거와 상세 내용을 작성해주세요 (50~5000자)"
              rows={10}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={5000}
            />
            <div className="mt-1.5 flex justify-between text-xs">
              <span
                className={
                  content.length > 0 && !isContentValid
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {content.length < 50
                  ? `${50 - content.length}자 더 입력해주세요`
                  : "적절한 길이입니다"}
              </span>
              <span className="text-muted-foreground">
                {content.length}/5000
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              작성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
