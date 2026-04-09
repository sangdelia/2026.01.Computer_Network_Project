export interface Topic {
  id: number;
  title: string;
  createdAt: string;
}

export interface Opinion {
  id: number;
  topicId: number;
  authorId: number;
  authorNickname: string;
  summary: string;
  content: string;
  agreeCount: number;
  disagreeCount: number;
  commentCount: number;
  myReaction: "AGREE" | "DISAGREE" | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  authorNickname: string;
  createdAt: string;
  isMine: boolean;
}

export type ReactionType = "AGREE" | "DISAGREE";
export type SortType = "latest" | "popular";
