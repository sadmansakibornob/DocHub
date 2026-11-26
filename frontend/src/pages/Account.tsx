import { useEffect, useState } from "react";
import { ShieldCheck, MonitorSmartphone, KeyRound, Save } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";
import type { AuthSession } from "../types/user";
export default function Account() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    authService
      .getSessions()
      .then((rows) => {
        if (active) setSessions(rows);
      })
      .catch(() => {
        if (active) setError("Could not load active sessions.");
      });
    return () => {
      active = false;
    };
  }, []);
  async function saveProfile() {
    setMessage("");
    setError("");
    try {
      await authService.updateProfile(name.trim());
      await refreshUser();
      setMessage("Profile updated.");
    } catch {
      setError("Profile update failed.");
    }
  }
  async function changePassword() {
    setMessage("");
    setError("");
    try {
      await authService.changePassword(currentPassword, newPassword);
      await logout();
      setMessage("Password changed. Sign in again with your new password.");
    } catch {
      setError(
        "Password change failed. Check your current password and new password length.",
      );
    }
  }
  async function revoke(id: string) {
    try {
      await authService.revokeSession(id);
      setSessions((s) =>
        s.map((x) =>
          x.id === id ? { ...x, revoked_at: new Date().toISOString() } : x,
        ),
      );
    } catch {
      setError("Could not revoke this session.");
    }
  }
  return (
    <AppShell
      title="Account & security"
      description="Manage your profile, password, and authenticated sessions."
    >
      {(message || error) && (
        <div
          className={`mb-5 rounded-xl border p-3 text-sm ${error ? "border-rose-400/20 bg-rose-400/5 text-rose-300" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"}`}
        >
          {error || message}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/8 bg-[#11151c] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Profile information</h2>
              <p className="text-xs text-slate-500">Your account identity</p>
            </div>
          </div>
          <label className="mb-1 block text-xs text-slate-400">
            Display name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0B0C10] px-3 py-3 text-sm outline-none focus:border-[#45A29E]"
          />
          <label className="mb-1 mt-4 block text-xs text-slate-400">
            Email address
          </label>
          <input
            readOnly
            value={user?.email || ""}
            className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-white/[.02] px-3 py-3 text-sm text-slate-500"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs capitalize text-[#45A29E]">
              Role: {user?.role}
            </span>
            <button
              onClick={() => void saveProfile()}
              className="flex items-center gap-2 rounded-lg bg-[#66FCF1] px-4 py-2.5 text-sm font-bold text-[#0B0C10]"
            >
              <Save size={15} /> Save profile
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-white/8 bg-[#11151c] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Change password</h2>
              <p className="text-xs text-slate-500">
                All existing sessions will be revoked
              </p>
            </div>
          </div>
          <label className="mb-1 block text-xs text-slate-400">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mb-3 w-full rounded-xl border border-white/10 bg-[#0B0C10] px-3 py-3 text-sm outline-none focus:border-[#45A29E]"
          />
          <label className="mb-1 block text-xs text-slate-400">
            New password
          </label>
          <input
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0B0C10] px-3 py-3 text-sm outline-none focus:border-[#45A29E]"
          />
          <button
            disabled={!currentPassword || newPassword.length < 6}
            onClick={() => void changePassword()}
            className="mt-4 flex items-center gap-2 rounded-lg border border-violet-300/20 px-4 py-2.5 text-sm font-semibold text-violet-200 hover:bg-violet-300/10 disabled:opacity-40"
          >
            <KeyRound size={15} /> Update password
          </button>
        </section>
      </div>
      <section className="mt-6 rounded-2xl border border-white/8 bg-[#11151c] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#45A29E]/10 text-[#66FCF1]">
            <MonitorSmartphone size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Sessions</h2>
            <p className="text-xs text-slate-500">
              Review and revoke devices signed in to your account.
            </p>
          </div>
        </div>
        <div className="divide-y divide-white/6">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {s.user_agent || "Unknown device"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {s.ip_address || "IP unavailable"} · Started{" "}
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${s.revoked_at ? "text-rose-300" : "text-emerald-300"}`}
                >
                  {s.revoked_at ? "Revoked" : "Active"}
                </span>
                {!s.revoked_at && (
                  <button
                    onClick={() => void revoke(s.id)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-rose-300/30 hover:text-rose-300"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="py-6 text-sm text-slate-500">
              No session information available.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
