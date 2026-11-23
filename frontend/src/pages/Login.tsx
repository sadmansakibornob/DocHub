import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-7 rounded-2xl border border-[#45A29E]/20 bg-[#1F2833] p-8 shadow-xl"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]">
            <BookOpen size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#C5C6C7]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#C5C6C7]/60">
              Sign in to continue to DocHub.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#C5C6C7]"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45A29E]"
              />

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-lg border border-[#45A29E]/25 bg-[#0B0C10] py-3 pl-10 pr-4 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#C5C6C7]"
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45A29E]"
              />

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[#45A29E]/25 bg-[#0B0C10] py-3 pl-10 pr-4 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#66FCF1] p-3 text-sm font-bold text-[#0B0C10] transition hover:bg-[#45A29E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-sm text-[#C5C6C7]/60">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#66FCF1] transition hover:text-[#45A29E]"
          >
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
