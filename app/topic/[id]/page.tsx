"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Opinion, Comment, SortType } from "@/lib/types";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Send, Pencil, Trash2 } from "lucide-react";
import { formatRelativeTime, calculateAgreeRate, cn } from "@/lib/utils";


const POST_IT_COLORS = ["post-it-yellow", "post-it-pink", "post-it-blue", "post-it-green", "post-it-orange"];
const ROTATIONS = [-2, 1, -1, 2, -1.5];

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.id);

  const [currentUser, setCurrentUser] = useState<{ id: number; nickname: string } | null>(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicColorIndex, setTopicColorIndex] = useState(0);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [selectedColor, setSelectedColor] = useState(POST_IT_COLORS[0]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sort, setSort] = useState<SortType>("latest");
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  useEffect(() => {
    setIsHydrated(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(({ success, data }) => { if (success) setCurrentUser(data); })
      .catch(() => {});
  }, []);

  // 주제 정보 + 색상 인덱스
  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then(({ data }) => {
        if (!data) return;
        const idx = data.findIndex((t: { id: number }) => t.id === topicId);
        const topic = data[idx >= 0 ? idx : 0];
        setTopicTitle(topic?.title ?? "");
        setTopicColorIndex(idx >= 0 ? idx : 0);
      })
      .catch(() => {});
  }, [topicId]);

  // 의견 목록 조회
  const fetchOpinions = useCallback(() => {
    fetch(`/api/opinions?topicId=${topicId}&sort=${sort}`)
      .then((res) => res.json())
      .then(({ data }) => setOpinions(data ?? []))
      .catch(() => setOpinions([]));
  }, [topicId, sort]);

  useEffect(() => { fetchOpinions(); }, [fetchOpinions]);

  // 댓글 조회
  const fetchComments = useCallback((opinionId: number) => {
    fetch(`/api/opinions/${opinionId}/comments`)
      .then((res) => res.json())
      .then(({ data }) => setComments(data ?? []));
  }, []);

  const topicColor = POST_IT_COLORS[topicColorIndex];

  const sortedOpinions = useMemo(() => {
    const sorted = [...opinions];
    if (sort === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      sorted.sort((a, b) => b.agreeCount - a.agreeCount);
    }
    return sorted;
  }, [opinions, sort]);

  const handleSelectOpinion = (opinion: Opinion, index: number) => {
    setSelectedOpinion(opinion);
    setSelectedColor(POST_IT_COLORS[index % POST_IT_COLORS.length]);
    fetchComments(opinion.id);
    setNewComment("");
    setMobileTab("detail");
  };

  // 반응 (공감/비공감)
  const handleReact = async (type: "AGREE" | "DISAGREE") => {
    if (!selectedOpinion || !currentUser) return;
    const res = await fetch(`/api/opinions/${selectedOpinion.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const { data } = await res.json();
    if (data) {
      setSelectedOpinion((prev) => prev ? { ...prev, agreeCount: data.agreeCount, disagreeCount: data.disagreeCount, myReaction: data.myReaction } : prev);
      setOpinions((prev) => prev.map((o) => o.id === selectedOpinion.id ? { ...o, agreeCount: data.agreeCount, disagreeCount: data.disagreeCount, myReaction: data.myReaction } : o));
    }
  };

  // 댓글 제출
  const handleSubmitComment = async () => {
    if (!selectedOpinion || !newComment.trim() || !currentUser) return;
    const res = await fetch(`/api/opinions/${selectedOpinion.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      setNewComment("");
      fetchComments(selectedOpinion.id);
      setSelectedOpinion((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
      setOpinions((prev) => prev.map((o) => o.id === selectedOpinion.id ? { ...o, commentCount: o.commentCount + 1 } : o));
    }
  };

  // 의견 삭제
  const handleDeleteOpinion = async () => {
    if (!selectedOpinion || !currentUser) return;
    if (!confirm("의견을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/opinions/${selectedOpinion.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSelectedOpinion(null);
      fetchOpinions();
    }
  };

  // 의견 수정
  const handleEditOpinion = async (summary: string, content: string) => {
    if (!selectedOpinion || !currentUser) return;
    const res = await fetch(`/api/opinions/${selectedOpinion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, content }),
    });
    if (res.ok) {
      setShowEditModal(false);
      setSelectedOpinion((prev) => prev ? { ...prev, summary, content } : prev);
      fetchOpinions();
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser || !selectedOpinion) return;
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchComments(selectedOpinion.id);
      setSelectedOpinion((prev) => prev ? { ...prev, commentCount: prev.commentCount - 1 } : prev);
      setOpinions((prev) => prev.map((o) => o.id === selectedOpinion.id ? { ...o, commentCount: o.commentCount - 1 } : o));
    }
  };

  // 의견 작성
  const handleWriteOpinion = async (summary: string, content: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/opinions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, summary, content }),
    });
    if (res.ok) {
      setShowWriteModal(false);
      fetchOpinions();
    }
  };

  return (
    <div className="chalkboard min-h-screen">
      <div className="chalkboard-inner min-h-screen p-3 md:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button
            onClick={() => router.push("/")}
            className="chalk-text flex items-center gap-1 md:gap-2 text-lg md:text-2xl hover:opacity-80 transition-opacity font-medium"
          >
            <ArrowLeft className="h-5 w-5 md:h-7 md:w-7" />
            <span className="hidden sm:inline">Back to Board</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="chalk-text text-xl md:text-4xl text-center flex-1 font-bold px-2">
            - Daily Issue #{topicId} -
          </div>
          <div className="w-16 md:w-32" />
        </div>

        {/* Topic Title */}
        <div className="flex justify-center mb-4 md:mb-8">
          <div className={cn("post-it w-full max-w-2xl p-3 md:p-6", topicColor)} style={{ transform: "rotate(-1deg)" }}>
            <h1 className="text-lg md:text-2xl font-bold text-center text-gray-800 leading-relaxed">
              {topicTitle}
            </h1>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden mb-3 border-b-2 border-white/20">
          <button
            onClick={() => setMobileTab("list")}
            className={cn("flex-1 py-2 chalk-text text-lg transition-opacity", mobileTab === "list" ? "opacity-100 border-b-2 border-white" : "opacity-50")}
          >
            의견 목록
          </button>
          <button
            onClick={() => setMobileTab("detail")}
            className={cn("flex-1 py-2 chalk-text text-lg transition-opacity", mobileTab === "detail" ? "opacity-100 border-b-2 border-white" : "opacity-50")}
          >
            의견 상세
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
          {/* Left: Opinion List */}
          <div className={cn("md:w-1/2 flex-col min-h-0", mobileTab === "list" ? "flex flex-1" : "hidden md:flex")}>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSort("latest")}
                className={cn("chalk-text text-xl font-medium transition-opacity", sort === "latest" ? "opacity-100" : "opacity-60 hover:opacity-80")}
              >
                [ Latest ]
              </button>
              <button
                onClick={() => setSort("popular")}
                className={cn("chalk-text text-xl font-medium transition-opacity", sort === "popular" ? "opacity-100" : "opacity-60 hover:opacity-80")}
              >
                [ Popular ]
              </button>
              <span className="chalk-text text-xl ml-auto font-medium">
                Total: {opinions.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {sortedOpinions.map((opinion, index) => (
                <div
                  key={opinion.id}
                  onClick={() => handleSelectOpinion(opinion, index)}
                  className={cn(
                    "post-it cursor-pointer transition-all hover:scale-[1.02]",
                    POST_IT_COLORS[index % POST_IT_COLORS.length],
                    selectedOpinion?.id === opinion.id && "ring-4 ring-white/50"
                  )}
                  style={{ transform: `rotate(${ROTATIONS[index % ROTATIONS.length]}deg)` }}
                >
                  <p className="font-medium text-gray-800 line-clamp-2 mb-3">{opinion.summary}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{opinion.authorNickname}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />{opinion.agreeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />{opinion.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentUser ? (
              <button
                onClick={() => setShowWriteModal(true)}
                className="chalk-button mt-4 flex items-center justify-center gap-2"
              >
                <Pencil className="h-5 w-5" />
                Write Opinion
              </button>
            ) : (
              <p className="chalk-text text-center mt-4 opacity-50 text-lg">
                로그인 후 의견을 작성할 수 있습니다
              </p>
            )}
          </div>

          {/* Right: Opinion Detail */}
          <div className={cn("md:w-1/2 flex-col min-h-0", mobileTab === "detail" ? "flex flex-1" : "hidden md:flex")}>
            {selectedOpinion ? (
              <div className={cn("post-it flex-1 overflow-y-auto", selectedColor)} style={{ transform: "rotate(0.5deg)" }}>
                <div className="p-2">
                  <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-gray-300 border-dashed">
                    <h2 className="text-xl font-bold text-gray-800 flex-1 pr-2">
                      {selectedOpinion.summary}
                    </h2>
                    {currentUser && (selectedOpinion as any).authorId === currentUser.id && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="수정"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleDeleteOpinion}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                    <span className="font-medium">{selectedOpinion.authorNickname}</span>
                    <span>|</span>
                    <span suppressHydrationWarning>
                      {isHydrated ? formatRelativeTime(selectedOpinion.createdAt) : "..."}
                    </span>
                  </div>
                  <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                    {selectedOpinion.content}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-4 py-4 border-t-2 border-b-2 border-gray-300 border-dashed">
                    <button
                      onClick={() => handleReact("AGREE")}
                      disabled={!currentUser}
                      title={!currentUser ? "로그인이 필요합니다" : undefined}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                        !currentUser && "opacity-40 cursor-not-allowed",
                        currentUser && selectedOpinion.myReaction === "AGREE"
                          ? "bg-blue-400 text-white"
                          : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                      )}
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span className="font-medium">{selectedOpinion.agreeCount}</span>
                    </button>
                    <button
                      onClick={() => handleReact("DISAGREE")}
                      disabled={!currentUser}
                      title={!currentUser ? "로그인이 필요합니다" : undefined}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                        !currentUser && "opacity-40 cursor-not-allowed",
                        currentUser && selectedOpinion.myReaction === "DISAGREE"
                          ? "bg-red-400 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-600"
                      )}
                    >
                      <ThumbsDown className="h-5 w-5" />
                      <span className="font-medium">{selectedOpinion.disagreeCount}</span>
                    </button>
                    {calculateAgreeRate(selectedOpinion.agreeCount, selectedOpinion.disagreeCount) !== null && (
                      <span className="ml-auto text-sm text-gray-600">
                        Support Rate: {calculateAgreeRate(selectedOpinion.agreeCount, selectedOpinion.disagreeCount)}%
                      </span>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="mt-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Comments ({selectedOpinion.commentCount})
                    </h3>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-white/50 rounded p-2 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{comment.authorNickname}</span>
                            <span className="text-gray-500 text-xs" suppressHydrationWarning>
                              {isHydrated ? formatRelativeTime(comment.createdAt) : "..."}
                            </span>
                            {currentUser && (comment as any).authorId === currentUser.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    {currentUser ? (
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 rounded bg-white/70 border border-gray-300 text-sm text-gray-800 placeholder-gray-500"
                        />
                        <button
                          onClick={handleSubmitComment}
                          className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        로그인 후 댓글을 작성할 수 있습니다
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="chalk-text text-center">
                  <p className="text-3xl mb-3 font-bold">Select an opinion</p>
                  <p className="chalk-text text-xl opacity-70">Click on a post-it to see details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showWriteModal && (
        <WriteOpinionModal
          topicTitle={topicTitle}
          onClose={() => setShowWriteModal(false)}
          onSubmit={handleWriteOpinion}
        />
      )}
      {showEditModal && selectedOpinion && (
        <EditOpinionModal
          initialSummary={selectedOpinion.summary}
          initialContent={selectedOpinion.content}
          topicTitle={topicTitle}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditOpinion}
        />
      )}
    </div>
  );
}

function EditOpinionModal({
  initialSummary,
  initialContent,
  topicTitle,
  onClose,
  onSubmit,
}: {
  initialSummary: string;
  initialContent: string;
  topicTitle: string;
  onClose: () => void;
  onSubmit: (summary: string, content: string) => void;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [content, setContent] = useState(initialContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="post-it post-it-blue w-full max-w-xl mx-4" style={{ transform: "rotate(1deg)" }}>
        <div className="p-2">
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Edit Opinion</h2>
          <p className="text-sm text-gray-600 text-center mb-4">Topic: {topicTitle}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary (10-100 characters)
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white/70 text-gray-800"
              />
              <span className="text-xs text-gray-500">{summary.length}/100</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Opinion (50-5000 characters)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={5000}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white/70 text-gray-800 resize-none"
              />
              <span className="text-xs text-gray-500">{content.length}/5000</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 border-2 border-gray-400 rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => summary.length >= 10 && content.length >= 50 && onSubmit(summary, content)}
              disabled={summary.length < 10 || content.length < 50}
              className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WriteOpinionModal({
  topicTitle,
  onClose,
  onSubmit,
}: {
  topicTitle: string;
  onClose: () => void;
  onSubmit: (summary: string, content: string) => void;
}) {
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="post-it post-it-yellow w-full max-w-xl mx-4" style={{ transform: "rotate(-1deg)" }}>
        <div className="p-2">
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Write Your Opinion</h2>
          <p className="text-sm text-gray-600 text-center mb-4">Topic: {topicTitle}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary (10-100 characters)
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={100}
                placeholder="Summarize your opinion in one sentence"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white/70 text-gray-800"
              />
              <span className="text-xs text-gray-500">{summary.length}/100</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Opinion (50-5000 characters)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={5000}
                rows={8}
                placeholder="Share your detailed thoughts..."
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white/70 text-gray-800 resize-none"
              />
              <span className="text-xs text-gray-500">{content.length}/5000</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 border-2 border-gray-400 rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => summary.length >= 10 && content.length >= 50 && onSubmit(summary, content)}
              disabled={summary.length < 10 || content.length < 50}
              className="flex-1 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
