import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
function apiMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } })
      .response;
    if (typeof response?.data?.detail === "string") return response.data.detail;
  }
  return "Registration failed. This email may already be registered.";
}
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await register({ name, email, password });
      if (response.requires_email_confirmation) {
        setMessage(
          "Account created. Check your inbox to confirm your email, then sign in.",
        );
        setTimeout(
          () =>
            navigate("/login", {
              replace: true,
              state: { notice: "Confirm your email before signing in." },
            }),
          1200,
        );
      } else {
        setMessage("Account created successfully.");
        setTimeout(() => navigate("/dashboard", { replace: true }), 500);
      }
    } catch (err: unknown) {
      setError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-5 py-12 text-[#C5C6C7]">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="mb-10 flex items-center justify-center gap-3 text-xl font-bold text-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]">
            <BookOpen size={21} />
          </span>
          Doc<span className="text-[#66FCF1]">Hub</span>
        </Link>
        <div className="rounded-3xl border border-white/8 bg-[#11151c] p-7 shadow-2xl shadow-black/30 sm:p-9">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-[#45A29E]">
              Get started
            </p>
            <h1 className="text-3xl font-bold text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Join your team’s secure knowledge workspace.
            </p>
          </div>
          {error && (
            <p className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-300">
              {message}
            </p>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Full name
              </label>
              <input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C10] px-4 py-3 text-sm text-white outline-none focus:border-[#45A29E]"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C10] px-4 py-3 text-sm text-white outline-none focus:border-[#45A29E]"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C10] px-4 py-3 text-sm text-white outline-none focus:border-[#45A29E]"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C10] px-4 py-3 text-sm text-white outline-none focus:border-[#45A29E]"
              />
            </div>
            <div className="rounded-xl bg-white/[.03] p-3 text-xs leading-5 text-slate-500">
              New accounts are assigned the{" "}
              <span className="font-semibold text-slate-300">user</span> role.
              Administrator privileges can only be granted by an existing
              administrator.
            </div>
            <button
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#66FCF1] px-4 py-3.5 text-sm font-bold text-[#0B0C10] disabled:opacity-50"
            >
              {busy ? (
                "Creating account"
              ) : (
                <>
                  Create account <UserPlus size={16} />
                </>
              )}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#66FCF1] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
