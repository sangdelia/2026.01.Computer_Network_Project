"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Opinion, SortType } from "@/lib/types";
import { dailyIssues, mockOpinions } from "@/lib/mock-data";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Send, Pencil } from "lucide-react";
import { formatRelativeTime, calculateAgreeRate, cn } from "@/lib/utils";
import { mockComments } from "@/lib/mock-data";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.id);
  
  const topic = dailyIssues.find((t) => t.id === topicId) || dailyIssues[0];
  
  const [opinions, setOpinions] = useState<Opinion[]>(
    mockOpinions.filter((o) => o.topicId === topicId || topicId === 1)
  );
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [sort, setSort] = useState<SortType>("latest");
  const [newComment, setNewComment] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sortedOpinions = useMemo(() => {
    const sorted = [...opinions];
    if (sort === "latest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      sorted.sort((a, b) => b.agreeCount - a.agreeCount);
    }
    return sorted;
  }, [opinions, sort]);

  const handleSelectOpinion = (opinion: Opinion) => {
    setSelectedOpinion(opinion);
  };

  const handleWriteOpinion = (summary: string, content: string) => {
    const newOpinion: Opinion = {
      id: Date.now(),
      topicId: topic.id,
      authorId: 3,
      authorNickname: "익명의 토론자",
      summary,
      content,
      agreeCount: 0,
      disagreeCount: 0,
      commentCount: 0,
      myReaction: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOpinions((prev) => [newOpinion, ...prev]);
    setShowWriteModal(false);
  };

  return (
    <div className="chalkboard min-h-screen">
      <div className="chalkboard-inner min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="chalk-text flex items-center gap-2 text-2xl hover:opacity-80 transition-opacity font-medium"
          >
            <ArrowLeft className="h-7 w-7" />
            <span>Back to Board</span>
          </button>
          
          <div className="chalk-text text-4xl text-center flex-1 font-bold">
            - Daily Issue #{topicId} -
          </div>
          
          <div className="w-32" />
        </div>

        {/* Topic Title - Post-it style */}
        <div className="flex justify-center mb-8">
          <div 
            className="post-it post-it-yellow w-full max-w-2xl p-6"
            style={{ transform: "rotate(-1deg)" }}
          >
            <h1 className="text-2xl font-bold text-center text-gray-800 leading-relaxed">
              {topic.title}
            </h1>
            <p className="text-sm text-gray-600 text-center mt-2">
              {topic.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 h-[calc(100vh-280px)]">
          {/* Left: Opinion List */}
          <div className="w-1/2 flex flex-col">
            {/* Sort Tabs */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSort("latest")}
                className={cn(
                  "chalk-text text-xl font-medium transition-opacity",
                  sort === "latest" ? "opacity-100" : "opacity-60 hover:opacity-80"
                )}
              >
                [ Latest ]
              </button>
              <button
                onClick={() => setSort("popular")}
                className={cn(
                  "chalk-text text-xl font-medium transition-opacity",
                  sort === "popular" ? "opacity-100" : "opacity-60 hover:opacity-80"
                )}
              >
                [ Popular ]
              </button>
              <span className="chalk-text text-xl ml-auto font-medium">
                Total: {opinions.length}
              </span>
            </div>

            {/* Opinion Cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {sortedOpinions.map((opinion, index) => {
                const colors = ["post-it-yellow", "post-it-pink", "post-it-blue", "post-it-green", "post-it-orange"];
                const rotations = [-2, 1, -1, 2, -1.5];
                return (
                  <div
                    key={opinion.id}
                    onClick={() => handleSelectOpinion(opinion)}
                    className={cn(
                      "post-it cursor-pointer transition-all hover:scale-[1.02]",
                      colors[index % colors.length],
                      selectedOpinion?.id === opinion.id && "ring-4 ring-white/50"
                    )}
                    style={{ transform: `rotate(${rotations[index % rotations.length]}deg)` }}
                  >
                    <p className="font-medium text-gray-800 line-clamp-2 mb-3">
                      {opinion.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{opinion.authorNickname}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {opinion.agreeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {opinion.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Write Button */}
            <button
              onClick={() => setShowWriteModal(true)}
              className="chalk-button mt-4 flex items-center justify-center gap-2"
            >
              <Pencil className="h-5 w-5" />
              Write Opinion
            </button>
          </div>

          {/* Right: Opinion Detail */}
          <div className="w-1/2 flex flex-col">
            {selectedOpinion ? (
              <div className="post-it post-it-yellow flex-1 overflow-y-auto" style={{ transform: "rotate(0.5deg)" }}>
                <div className="p-2">
                  {/* Summary */}
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-gray-300 border-dashed">
                    {selectedOpinion.summary}
                  </h2>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                    <span className="font-medium">{selectedOpinion.authorNickname}</span>
                    <span>|</span>
                    <span suppressHydrationWarning>
                      {isHydrated ? formatRelativeTime(selectedOpinion.createdAt) : "..."}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                    {selectedOpinion.content}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-4 py-4 border-t-2 border-b-2 border-gray-300 border-dashed">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                      <ThumbsUp className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-600">{selectedOpinion.agreeCount}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">{selectedOpinion.disagreeCount}</span>
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
                      {mockComments.slice(0, 3).map((comment) => (
                        <div key={comment.id} className="bg-white/50 rounded p-2 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{comment.authorNickname}</span>
                            <span className="text-gray-500 text-xs" suppressHydrationWarning>
                              {isHydrated ? formatRelativeTime(comment.createdAt) : "..."}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Comment Input */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 rounded bg-white/70 border border-gray-300 text-sm text-gray-800 placeholder-gray-500"
                      />
                      <button className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
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

      {/* Write Modal */}
      {showWriteModal && (
        <WriteOpinionModal
          topicTitle={topic.title}
          onClose={() => setShowWriteModal(false)}
          onSubmit={handleWriteOpinion}
        />
      )}
    </div>
  );
}

// Write Modal Component
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

  const handleSubmit = () => {
    if (summary.length >= 10 && content.length >= 50) {
      onSubmit(summary, content);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="post-it post-it-yellow w-full max-w-xl mx-4" style={{ transform: "rotate(-1deg)" }}>
        <div className="p-2">
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
            Write Your Opinion
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            Topic: {topicTitle}
          </p>

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
              onClick={handleSubmit}
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
