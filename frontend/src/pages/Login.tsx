import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function apiMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } })
      .response;
    if (typeof response?.data?.detail === "string") return response.data.detail;
  }
  return "Sign in failed. Check your email and password.";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    notice?: string;
    from?: { pathname?: string };
  } | null;

  const notice = locationState?.notice;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function authenticate(
    accountEmail: string,
    accountPassword: string,
    role: "admin" | "user",
  ) {
    setError("");
    setBusy(true);

    try {
      await login({
        email: accountEmail,
        password: accountPassword,
      });

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      setError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    await authenticate(email, password, "user");
  }

  return (
    <div className="grid min-h-screen bg-[#0B0C10] text-[#C5C6C7] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/8 bg-[#101820] p-12 lg:flex">
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-[#45A29E]/15 blur-[110px]" />

        <Link
          to="/"
          className="relative flex items-center gap-3 text-xl font-bold text-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]">
            <BookOpen size={21} />
          </span>
          Doc<span className="text-[#66FCF1]">Hub</span>
        </Link>

        <div className="relative max-w-lg">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-[#45A29E]">
            Your knowledge workspace
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
            Good work deserves a{" "}
            <span className="text-[#66FCF1]">well-kept home.</span>
          </h1>
          <p className="mt-6 leading-8 text-slate-400">
            Sign in to access your documentation, collaborate with your group,
            and keep your team's knowledge moving.
          </p>
        </div>

        <p className="relative text-xs text-slate-600">
          DocHub · Secure knowledge sharing
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-12 flex items-center gap-3 text-lg font-bold text-white lg:hidden"
          >
            <BookOpen className="text-[#66FCF1]" /> DocHub
          </Link>

          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-[#45A29E]">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold text-white">Sign in to DocHub</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your account credentials to continue.
            </p>
          </div>

          {notice && (
            <p className="mb-5 rounded-xl border border-[#45A29E]/20 bg-[#45A29E]/5 p-3 text-sm text-[#66FCF1]">
              {notice}
            </p>
          )}

          {error && (
            <p className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#11151c] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-700 focus:border-[#45A29E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-xl border border-white/10 bg-[#11151c] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-700 focus:border-[#45A29E]"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#66FCF1] px-4 py-3.5 text-sm font-bold text-[#0B0C10] hover:bg-[#a1fff8] disabled:opacity-50"
            >
              {busy ? (
                "Signing in…"
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-semibold tracking-[.15em] text-slate-600">
                OR TRY A DEMO ACCOUNT
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  authenticate("user01@example.com", "12345678", "user")
                }
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#11151c] px-3 py-4 text-sm font-semibold text-slate-300 transition hover:border-[#45A29E] hover:bg-[#45A29E]/5 hover:text-[#66FCF1] disabled:opacity-50"
              >
                <User size={20} />
                Demo User
                <span className="text-[10px] font-normal text-slate-600">
                  Standard access
                </span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  authenticate("student01@example.com", "12345678", "admin")
                }
                className="flex flex-col items-center gap-2 rounded-xl border border-[#45A29E]/30 bg-[#45A29E]/5 px-3 py-4 text-sm font-semibold text-[#66FCF1] transition hover:bg-[#45A29E]/15 disabled:opacity-50"
              >
                <ShieldCheck size={20} />
                Demo Admin
                <span className="text-[10px] font-normal text-slate-500">
                  Administrator access
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <LockKeyhole size={13} />
            Protected by secure session authentication
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            New to DocHub?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#66FCF1] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
