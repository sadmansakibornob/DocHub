import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({ name, email, password });
      navigate("/login");
    } catch {
      setError("Registration failed. Please check your information.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-[#45A29E]/20 bg-[#1F2833] p-8 shadow-xl"
      >
        {/* Logo and Heading */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]">
            <BookOpen size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#C5C6C7]">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[#C5C6C7]/60">
              Join the DocHub community and start sharing knowledge.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">

          {/* Full Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-[#C5C6C7]"
            >
              Full name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45A29E]"
              />

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="w-full rounded-lg border border-[#45A29E]/25 bg-[#0B0C10] py-3 pl-10 pr-4 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-lg border border-[#45A29E]/25 bg-[#0B0C10] py-3 pl-10 pr-4 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
              />
            </div>

            <p className="text-xs text-[#C5C6C7]/40">
              Password must contain at least 8 characters.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#66FCF1] p-3 text-sm font-bold text-[#0B0C10] transition hover:bg-[#45A29E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-[#C5C6C7]/60">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#66FCF1] transition hover:text-[#45A29E]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
