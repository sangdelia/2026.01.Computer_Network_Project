"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostIt } from "@/components/post-it";
import { ChalkLogin } from "@/components/chalk-login";

interface TopicWithCount {
  id: number;
  title: string;
  createdAt: string;
  opinionCount: number;
}

const postItColors: Array<"yellow" | "pink" | "blue" | "green" | "orange"> = [
  "yellow",
  "pink",
  "blue",
  "green",
  "orange",
];

const postItRotations = [-3, 2, -1, 3, -2];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicWithCount[]>([]);

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then(({ data }) => setTopics(data));
  }, []);

  const handleLogin = (username: string, _password: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  return (
    <div className="min-h-screen chalkboard wooden-frame relative overflow-hidden">
      <header className="pt-12 pb-8 text-center relative z-10">
        <h1 className="chalk-text text-6xl font-bold tracking-wide">
          Daily Issues
        </h1>
        <p className="chalk-text-dim text-2xl mt-4">
          - 오늘의 토론 주제 -
        </p>
        <div className="chalk-text-dim text-lg mt-2 opacity-60">
          2026년 4월 9일
        </div>
      </header>

      <main className="flex justify-center items-center py-8 px-4 relative z-10">
        <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
          {topics.map((topic, index) => (
            <PostIt
              key={topic.id}
              title={topic.title}
              opinionCount={Number(topic.opinionCount)}
              color={postItColors[index % postItColors.length]}
              rotation={postItRotations[index % postItRotations.length]}
              onClick={() => router.push(`/topic/${topic.id}`)}
            />
          ))}
        </div>
      </main>

      <div className="absolute top-20 left-8 chalk-text-dim text-4xl opacity-30 rotate-12">*</div>
      <div className="absolute top-40 right-16 chalk-text-dim text-3xl opacity-20 -rotate-6">~</div>
      <div className="absolute bottom-40 left-16 chalk-text-dim text-5xl opacity-25 rotate-45">+</div>

      {!isLoggedIn ? (
        <ChalkLogin onLogin={handleLogin} />
      ) : (
        <div className="absolute bottom-8 right-8 chalk-text text-xl">
          <p className="mb-2">Welcome, {currentUser}!</p>
          <button
            onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }}
            className="chalk-button text-base"
          >
            Logout
          </button>
        </div>
      )}

      <div className="absolute bottom-8 left-8 chalk-text-dim text-lg opacity-70 max-w-xs">
        <p>* 포스트잇을 클릭하면</p>
        <p className="ml-4">토론에 참여할 수 있습니다</p>
      </div>
    </div>
  );
}
