"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostIt } from "@/components/post-it";

interface TopicWithCount {
  id: number;
  title: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then(({ data }) => setTopics(data ?? []))
      .catch(() => setTopics([]));

    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
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
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } else {
      setLoginError(error?.message ?? "로그인 실패");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="min-h-screen chalkboard wooden-frame relative overflow-hidden">
      <header className="pt-12 pb-8 text-center relative z-10">
        <h1 className="chalk-text text-6xl font-bold tracking-wide">Daily Issues</h1>
        <p className="chalk-text-dim text-2xl mt-4">- 오늘의 토론 주제 -</p>
        <div className="chalk-text-dim text-lg mt-2 opacity-60">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
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

      {/* 로그인 / 유저 정보 */}
      <div className="absolute bottom-8 right-8">
        {user ? (
          <div className="chalk-text text-xl text-right">
            <p className="mb-2">Welcome, {user.nickname}!</p>
            <button onClick={handleLogout} className="chalk-button text-base">Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-2 items-end">
            <input
              type="text"
              placeholder="ID"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              className="chalk-input text-lg w-48"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="chalk-input text-lg w-48"
            />
            {loginError && <p className="chalk-text text-sm text-red-300">{loginError}</p>}
            <button type="submit" className="chalk-button text-base w-48">Login</button>
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

      <div className="absolute bottom-8 left-8 chalk-text-dim text-lg opacity-70 max-w-xs">
        <p>* 포스트잇을 클릭하면</p>
        <p className="ml-4">토론에 참여할 수 있습니다</p>
      </div>
    </div>
  );
}
