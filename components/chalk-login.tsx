"use client";

import { useState } from "react";
import Link from "next/link";

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
            placeholder="Enter ID"
          />
        </div>
        
        <div className="space-y-1">
          <label className="chalk-text-dim text-lg block">PW:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="chalk-input"
            placeholder="Enter Password"
          />
        </div>
        
        <button type="submit" className="chalk-button w-full mt-4">
          Enter
        </button>
        
        <Link 
          href="/signup"
          className="chalk-text-dim text-sm text-center mt-2 block hover:opacity-100 opacity-60 transition-opacity underline"
        >
          * New here? Sign up *
        </Link>
      </form>
    </div>
  );
}
