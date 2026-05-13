"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostIt } from "@/components/post-it";

interface TopicWithCount {
  id: number;
  title: string;
  isActive: boolean;
  createdAt: string;
  opinionCount: number;
}

interface User {
  id: number;
  nickname: string;
  email: string;
}

const postItColors: Array<"yellow" | "pink" | "blue" | "green" | "orange"> = [
  "yellow", "pink", "blue", "green", "orange",
];
const postItRotations = [-3, 2, -1, 3, -2];

export default function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicWithCount[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then(({ data }) => setTopics(data ?? []))
      .catch(() => setTopics([]));

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(({ success, data }) => { if (success) setUser(data); })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const { success, data, error } = await res.json();
    if (success) {
      setUser(data);
    } else {
      setLoginError(error?.message ?? "로그인 실패");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };


  return (
    <div className="min-h-screen chalkboard wooden-frame relative overflow-y-auto md:overflow-hidden flex flex-col">
      <header className="pt-8 md:pt-12 pb-6 md:pb-8 text-center relative z-10">
        <h1 className="chalk-text text-4xl md:text-6xl font-bold tracking-wide">Daily Issues</h1>
        <p className="chalk-text-dim text-xl md:text-2xl mt-3 md:mt-4">- 오늘의 토론 주제 -</p>
        <div className="chalk-text-dim text-base md:text-lg mt-2 opacity-60">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-6 md:py-8 px-4 relative z-10">
        {/* 오늘의 토론 주제 */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-4xl w-full">
          {topics.filter((t) => t.isActive).map((topic, index) => (
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

        {/* 지난 토론 아카이브 */}
        {topics.some((t) => !t.isActive) && (
          <div className="mt-10 w-full max-w-2xl relative z-10">
            <button
              onClick={() => setShowArchive((v) => !v)}
              className="chalk-text-dim text-lg opacity-70 hover:opacity-100 transition-opacity w-full text-center"
            >
              {showArchive ? "▲" : "▼"} 지난 토론 보기 ({topics.filter((t) => !t.isActive).length}개)
            </button>
            {showArchive && (
              <ul className="mt-3 space-y-2">
                {topics.filter((t) => !t.isActive).map((topic) => (
                  <li key={topic.id}>
                    <button
                      onClick={() => router.push(`/topic/${topic.id}`)}
                      className="chalk-text-dim text-base opacity-60 hover:opacity-90 transition-opacity w-full text-left px-2 py-1 truncate"
                    >
                      · {topic.title}
                      <span className="ml-2 text-sm opacity-60">({Number(topic.opinionCount)}개 의견)</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      <div className="hidden md:block absolute top-20 left-8 chalk-text-dim text-4xl opacity-30 rotate-12">*</div>
      <div className="hidden md:block absolute top-40 right-16 chalk-text-dim text-3xl opacity-20 -rotate-6">~</div>
      <div className="hidden md:block absolute bottom-40 left-16 chalk-text-dim text-5xl opacity-25 rotate-45">+</div>

      {/* 로그인 / 유저 정보 - 모바일: 하단 인라인, 데스크탑: 절대 위치 */}
      <div className="relative md:absolute md:bottom-8 md:right-8 z-10 px-4 pb-6 md:p-0 flex justify-end md:block">
        {user ? (
          <div className="chalk-text text-xl text-right">
            <p className="mb-2">Welcome, {user.nickname}!</p>
            <button onClick={handleLogout} className="chalk-button text-base">Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-2 items-end w-48">
            <input
              type="text"
              placeholder="ID"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              className="chalk-input text-lg w-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="chalk-input text-lg w-full"
            />
            {loginError && <p className="chalk-text text-sm text-red-300">{loginError}</p>}
            <button type="submit" className="chalk-button text-base w-full">Login</button>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="chalk-text text-sm opacity-70 hover:opacity-100 underline"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>

      <div className="hidden md:block absolute bottom-8 left-8 chalk-text-dim text-lg opacity-70 max-w-xs">
        <p>* 포스트잇을 클릭하면</p>
        <p className="ml-4">토론에 참여할 수 있습니다</p>
      </div>
    </div>
  );
}
