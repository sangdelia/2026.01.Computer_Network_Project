"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validations = {
    username: formData.username.length >= 4 && formData.username.length <= 20,
    password: formData.password.length >= 8,
    confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
    nickname: formData.nickname.length >= 2 && formData.nickname.length <= 10,
  };

  const isValid = Object.values(validations).every(Boolean);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
      }),
    });

    const { success, data, error } = await res.json();
    setIsSubmitting(false);

    if (success) {
      router.push("/");
    } else {
      setErrorMsg(error?.message ?? "회원가입에 실패했습니다.");
    }
  };

  const ValidationIcon = ({ valid }: { valid: boolean }) => (
    valid ? (
      <Check className="h-5 w-5 text-green-400" />
    ) : (
      <X className="h-5 w-5 text-red-400" />
    )
  );

  return (
    <div className="chalkboard min-h-screen">
      <div className="chalkboard-inner min-h-screen p-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="chalk-text flex items-center gap-2 text-2xl hover:opacity-80 transition-opacity mb-8 font-medium"
        >
          <ArrowLeft className="h-7 w-7" />
          <span>Back to Board</span>
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="chalk-text text-6xl mb-4 font-bold">- Sign Up -</h1>
          <p className="chalk-text text-2xl">Join the discussion!</p>
        </div>

        {/* Form - Chalk style */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="chalk-text text-2xl font-medium">ID (Username)</label>
                {formData.username && <ValidationIcon valid={validations.username} />}
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="chalk-input text-2xl"
                placeholder="4-20 characters"
              />
              <p className="chalk-text text-base opacity-60">
                * 4~20 characters, alphanumeric only
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="chalk-text text-2xl font-medium">Password</label>
                {formData.password && <ValidationIcon valid={validations.password} />}
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="chalk-input text-2xl"
                placeholder="********"
              />
              <p className="chalk-text text-base opacity-60">
                * At least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="chalk-text text-2xl font-medium">Confirm PW</label>
                {formData.confirmPassword && <ValidationIcon valid={validations.confirmPassword} />}
              </div>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="chalk-input text-2xl"
                placeholder="********"
              />
              {formData.confirmPassword && !validations.confirmPassword && (
                <p className="chalk-text text-base text-red-300">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="chalk-text text-2xl font-medium">Nickname</label>
                {formData.nickname && <ValidationIcon valid={validations.nickname} />}
              </div>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="chalk-input text-2xl"
                placeholder="Your display name"
              />
              <p className="chalk-text text-base opacity-60">
                * 2~10 characters
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="chalk-text text-base text-red-300 text-center">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="chalk-button w-full text-2xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="chalk-text text-xl">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="chalk-text underline hover:opacity-80 font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>

          {/* Decorative doodles */}
          <div className="mt-12 flex justify-center gap-8">
            <div className="chalk-text text-4xl opacity-30">~</div>
            <div className="chalk-text text-4xl opacity-30">*</div>
            <div className="chalk-text text-4xl opacity-30">~</div>
          </div>
        </div>
      </div>
    </div>
  );
}
