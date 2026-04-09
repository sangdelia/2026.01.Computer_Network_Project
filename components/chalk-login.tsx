"use client";

import { useState } from "react";

interface ChalkLoginProps {
  onLogin: (username: string, password: string) => void;
}

export function ChalkLogin({ onLogin }: ChalkLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="absolute bottom-8 right-8 w-64">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="chalk-text-dim text-2xl mb-4 text-center">
          - Login -
        </div>
        
        <div className="space-y-1">
          <label className="chalk-text-dim text-lg block">ID:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="chalk-input"
            placeholder="아이디 입력"
          />
        </div>
        
        <div className="space-y-1">
          <label className="chalk-text-dim text-lg block">PW:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="chalk-input"
            placeholder="비밀번호 입력"
          />
        </div>
        
        <button type="submit" className="chalk-button w-full mt-4">
          Enter
        </button>
        
        <div className="chalk-text-dim text-sm text-center mt-2 opacity-60">
          * 처음이라면 회원가입 *
        </div>
      </form>
    </div>
  );
}
