import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownToLine,
  Ban,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  ShieldAlert,
  Users,
  Layers3,
  RefreshCw,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import adminService, {
  type AdminStats,
  type ArticleStatus,
  type FailedLogin,
} from "../services/adminService";
import type { User, UserRole } from "../types/user";
import type { Article } from "../types/article";

type Tab = "overview" | "users" | "content" | "activity" | "security";

const articleStatusTone: Record<string, string> = {
  draft: "bg-amber-400/10 text-amber-300",
  review: "bg-violet-400/10 text-violet-300",
  published: "bg-emerald-400/10 text-emerald-300",
};

export default function AdminDashboard({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [security, setSecurity] = useState<FailedLogin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [articleStatus, setArticleStatus] = useState("");
  const [logSearch, setLogSearch] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [detail, setDetail] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [updatingArticleId, setUpdatingArticleId] = useState<number | null>(
    null,
  );

  const limit = 20;

  async function loadStats() {
    try {
      setStats(await adminService.dashboard());
    } catch {
      setError("Unable to load administration data.");
    }
  }

  async function loadUsers() {
    setLoading(true);

    try {
      const r = await adminService.users({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        limit,
        offset: page * limit,
      });

      setUsers(r.items);
      setTotal(r.total);
      setSelected([]);
    } catch {
      setError("Unable to load users. Verify administrator permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function loadContent() {
    setLoading(true);

    try {
      const [a, g] = await Promise.all([
        adminService.articles({
          status: articleStatus || undefined,
          limit,
          offset: page * limit,
        }),
        adminService.groups({
          limit,
          offset: page * limit,
        }),
      ]);

      setArticles(a.items);
      setGroups(g.items);
      setSelectedArticles([]);
      setSelectedGroups([]);
      setTotal(a.total + g.total);
    } catch {
      setError("Unable to load moderation data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    setLoading(true);

    try {
      const r = await adminService.audit({
        search: logSearch || undefined,
        limit,
        offset: page * limit,
      });

      setLogs(r.items);
      setTotal(r.total);
    } catch {
      setError("Unable to load audit log.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSecurity() {
    setLoading(true);

    try {
      const attempts = await adminService.failedLogins();
      setSecurity(attempts);
    } catch {
      setError("Unable to load security events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStats();
  }, []);

  // Load the selected tab's data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab === "users") void loadUsers();
    if (tab === "content") void loadContent();
    if (tab === "activity") void loadLogs();
    if (tab === "security") void loadSecurity();
  }, [tab, page, search, role, status, articleStatus, logSearch]);

  async function inspect(id: string) {
    try {
      setDetail(await adminService.user(id));
    } catch {
      setError("Unable to load user detail.");
    }
  }

  async function changeRole(u: User, r: UserRole) {
    try {
      await adminService.role(u.id, r);
      await loadUsers();
      await loadStats();
    } catch {
      setError(
        "Role change rejected. You cannot change your own role or demote the last administrator.",
      );
    }
  }

  async function ban(u: User) {
    if (u.role === "admin") return;

    const why = reason.trim() || prompt("Reason for ban (required):") || "";

    if (why.trim().length < 3) {
      setError("A ban reason of at least 3 characters is required.");
      return;
    }

    try {
      await adminService.ban(u.id, why);
      setReason("");
      await loadUsers();
      await loadStats();

      if (detail?.id === u.id) await inspect(u.id);
    } catch {
      setError("Ban failed. Administrators cannot ban another administrator.");
    }
  }

  async function unban(u: User) {
    try {
      await adminService.unban(u.id);
      await loadUsers();
      await loadStats();
    } catch {
      setError("Unban failed.");
    }
  }

  async function bulkBan() {
    const why = reason.trim();

    if (selected.length === 0 || why.length < 3) {
      setError(
        "Select users and provide a ban reason (at least 3 characters).",
      );
      return;
    }

    try {
      await adminService.bulkBan(selected, why);
      setReason("");
      await loadUsers();
      await loadStats();
    } catch {
      setError(
        "Bulk ban rejected. Your account and administrator accounts cannot be included.",
      );
    }
  }

  async function bulkUnban() {
    if (!selected.length) return;

    try {
      await adminService.bulkUnban(selected);
      await loadUsers();
      await loadStats();
    } catch {
      setError("Bulk unban failed.");
    }
  }

  async function updateArticleStatus(
    article: Article,
    newStatus: ArticleStatus,
  ) {
    if (article.status === newStatus) return;

    setUpdatingArticleId(article.id);
    setError("");

    try {
      await adminService.updateArticleStatus(article.id, newStatus);

      setArticles((current) =>
        current.map((item) =>
          item.id === article.id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch {
      setError(
        `Could not update the status of article #${article.id}. Please try again.`,
      );
    } finally {
      setUpdatingArticleId(null);
    }
  }

  async function deleteArticle(id: number) {
    if (!confirm("Permanently delete this record?")) return;

    try {
      await adminService.deleteArticle(id);
      await loadContent();
      await loadStats();
    } catch {
      setError("Could not delete record.");
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm("Permanently delete this group?")) return;

    try {
      await adminService.deleteGroup(id);
      await loadContent();
      await loadStats();
    } catch {
      setError("Could not delete group.");
    }
  }

  const tabs: [Tab, string, any][] = [
    ["overview", "Overview", Activity],
    ["users", "Users", Users],
    ["content", "Content", BookOpen],
    ["activity", "Audit log", Layers3],
    ["security", "Security", ShieldAlert],
  ];

  // Security statistics are derived from the actual API array.
  const securityByIp = security.reduce<Record<string, number>>((acc, item) => {
    const ip = item.ip_address || "Unknown IP";
    acc[ip] = (acc[ip] || 0) + 1;
    return acc;
  }, {});

  const securityByAccount = security.reduce<Record<string, number>>(
    (acc, item) => {
      const email = item.email || "Unknown account";
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    },
    {},
  );

  const content = (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Dashboard tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/8 pb-4">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setPage(0);
              setTab(id);
            }}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === id
                ? "bg-[#45A29E]/15 text-[#66FCF1]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total users", value: stats?.users_total, icon: Users },
              {
                label: "Banned users",
                value: stats?.banned_users,
                icon: Ban,
              },
              {
                label: "Knowledge records",
                value: stats?.records_total,
                icon: BookOpen,
              },
              {
                label: "Shared groups",
                value: stats?.groups_total,
                icon: Layers3,
              },
            ].map((x) => (
              <div
                key={x.label}
                className="rounded-2xl border border-white/8 bg-[#11151c] p-5"
              >
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{x.label}</span>
                  <x.icon size={17} className="text-[#45A29E]" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {x.value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#11151c] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                New activity · last 7 days
              </h3>
              <button
                type="button"
                onClick={() => void loadStats()}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "New users", value: stats?.new_users_7d },
                { label: "New records", value: stats?.new_records_7d },
                { label: "New groups", value: stats?.new_groups_7d },
              ].map((x) => (
                <div key={x.label} className="rounded-xl bg-white/[.03] p-4">
                  <p className="text-xs text-slate-500">{x.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#66FCF1]">
                    {x.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users */}
      {tab === "users" && (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                placeholder="Search name or email"
                className="w-full rounded-xl border border-white/10 bg-[#11151c] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#45A29E]"
              />
            </div>

            <select
              value={role}
              onChange={(e) => {
                setPage(0);
                setRole(e.target.value);
              }}
              className="rounded-xl border border-white/10 bg-[#11151c] px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setPage(0);
                setStatus(e.target.value);
              }}
              className="rounded-xl border border-white/10 bg-[#11151c] px-3 py-2 text-sm"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

            <button
              type="button"
              onClick={() =>
                void adminService.export("users", { role, status })
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              <ArrowDownToLine size={15} />
              CSV
            </button>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#45A29E]/20 bg-[#45A29E]/5 p-3">
              <span className="mr-auto text-sm text-slate-300">
                {selected.length} selected
              </span>

              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ban reason (required)"
                className="min-w-[180px] rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-xs"
              />

              <button
                type="button"
                onClick={() => void bulkBan()}
                className="rounded-lg bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300"
              >
                Bulk ban
              </button>

              <button
                type="button"
                onClick={() => void bulkUnban()}
                className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300"
              >
                Bulk unban
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#11151c]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={
                        users.length > 0 && selected.length === users.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? users.map((u) => u.id) : [],
                        )
                      }
                    />
                  </th>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[.02]">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={(e) =>
                          setSelected((s) =>
                            e.target.checked
                              ? [...s, u.id]
                              : s.filter((x) => x !== u.id),
                          )
                        }
                      />
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => void inspect(u.id)}
                        className="text-left"
                      >
                        <p className="font-medium text-white hover:text-[#66FCF1]">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </button>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          void changeRole(u, e.target.value as UserRole)
                        }
                        className="rounded-lg border border-white/10 bg-[#0B0C10] px-2 py-1.5 text-xs"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          u.is_banned
                            ? "bg-rose-400/10 text-rose-300"
                            : "bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {u.is_banned ? "Banned" : "Active"}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-slate-500">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        {u.is_banned ? (
                          <button
                            type="button"
                            onClick={() => void unban(u)}
                            className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-400/10"
                            title="Unban"
                          >
                            <UserCheck size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={u.role === "admin"}
                            onClick={() => void ban(u)}
                            className="rounded-lg p-2 text-rose-300 hover:bg-rose-400/10 disabled:opacity-30"
                            title="Ban"
                          >
                            <Ban size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void inspect(u.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
                          title="Details"
                        >
                          <Search size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <p className="p-5 text-center text-sm text-slate-500">Loading…</p>
            )}

            {!loading && !users.length && (
              <p className="p-8 text-center text-sm text-slate-500">
                No users match these filters.
              </p>
            )}
          </div>

          <Pager page={page} total={total} limit={limit} setPage={setPage} />
        </>
      )}

      {/* Content management */}
      {tab === "content" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Record status</span>
              <select
                value={articleStatus}
                onChange={(e) => {
                  setPage(0);
                  setArticleStatus(e.target.value);
                }}
                className="rounded-xl border border-white/10 bg-[#11151c] px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                void adminService.export("articles", { status: articleStatus })
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"
            >
              <ArrowDownToLine size={15} />
              Export records
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white">Knowledge records</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Review article content and monitor publication status.
                </p>
              </div>

              <button
                type="button"
                disabled={!selectedArticles.length}
                onClick={async () => {
                  if (
                    !confirm(
                      `Delete ${selectedArticles.length} selected records?`,
                    )
                  ) {
                    return;
                  }

                  try {
                    await adminService.bulkDeleteArticles(selectedArticles);
                    await loadContent();
                    await loadStats();
                  } catch {
                    setError("Bulk record deletion failed.");
                  }
                }}
                className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-300 disabled:opacity-30"
              >
                Delete selected ({selectedArticles.length})
              </button>
            </div>

            <div className="divide-y divide-white/6">
              {articles.map((a) => {
                const currentStatus = String(a.status).toLowerCase();
                const isUpdating = updatingArticleId === a.id;

                return (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center gap-3 py-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(a.id)}
                      onChange={(e) =>
                        setSelectedArticles((v) =>
                          e.target.checked
                            ? [...v, a.id]
                            : v.filter((x) => x !== a.id),
                        )
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {a.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Article #{a.id} · Author: {a.author_id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          articleStatusTone[currentStatus] ??
                          "bg-slate-400/10 text-slate-300"
                        }`}
                      >
                        {a.status}
                      </span>

                      <select
                        aria-label={`Change status of article ${a.id}`}
                        value={currentStatus}
                        disabled={isUpdating}
                        onChange={(e) =>
                          void updateArticleStatus(
                            a,
                            e.target.value as ArticleStatus,
                          )
                        }
                        className="rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-xs text-slate-200 outline-none transition hover:border-[#45A29E] focus:border-[#45A29E] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                      </select>

                      {isUpdating && (
                        <RefreshCw
                          size={14}
                          className="animate-spin text-[#66FCF1]"
                          aria-label="Saving status"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/articles/${a.id}`}
                        title="Read article"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#45A29E]/30 bg-[#45A29E]/5 px-3 py-2 text-xs font-semibold text-[#66FCF1] hover:bg-[#45A29E]/15"
                      >
                        <BookOpen size={14} />
                        Read
                      </Link>

                      <button
                        type="button"
                        onClick={() => void deleteArticle(a.id)}
                        title="Delete article"
                        className="rounded-lg p-2 text-rose-300 hover:bg-rose-400/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!articles.length && (
                <p className="py-5 text-sm text-slate-500">No records found.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">Shared groups</h3>

              <button
                type="button"
                disabled={!selectedGroups.length}
                onClick={async () => {
                  if (
                    !confirm(`Delete ${selectedGroups.length} selected groups?`)
                  ) {
                    return;
                  }

                  try {
                    await adminService.bulkDeleteGroups(selectedGroups);
                    await loadContent();
                    await loadStats();
                  } catch {
                    setError("Bulk group deletion failed.");
                  }
                }}
                className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-300 disabled:opacity-30"
              >
                Delete selected ({selectedGroups.length})
              </button>
            </div>

            <div className="divide-y divide-white/6">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g.id)}
                    onChange={(e) =>
                      setSelectedGroups((v) =>
                        e.target.checked
                          ? [...v, g.id]
                          : v.filter((x) => x !== g.id),
                      )
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{g.name}</p>
                    <p className="text-xs text-slate-500">{g.id}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void deleteGroup(g.id)}
                    className="rounded-lg p-2 text-rose-300 hover:bg-rose-400/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {!groups.length && (
                <p className="py-5 text-sm text-slate-500">No groups found.</p>
              )}
            </div>
          </div>

          <Pager page={page} total={total} limit={limit} setPage={setPage} />
        </>
      )}

      {/* Audit log */}
      {tab === "activity" && (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={logSearch}
                onChange={(e) => {
                  setPage(0);
                  setLogSearch(e.target.value);
                }}
                placeholder="Filter by action"
                className="w-full rounded-xl border border-white/10 bg-[#11151c] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#45A29E]"
              />
            </div>

            <button
              type="button"
              onClick={() => void adminService.export("activity")}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
            >
              <ArrowDownToLine size={15} />
              Export activity
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#11151c]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/8 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">IP address</th>
                  <th className="p-4">Browser / device</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {logs.map((l, i) => (
                  <tr key={l.id || i}>
                    <td className="p-4 font-medium text-[#66FCF1]">
                      {l.action}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {l.actor_id || "System"}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {l.target_type || "—"} {l.target_id || ""}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {l.ip_address || "—"}
                    </td>
                    <td className="max-w-[220px] truncate p-4 text-xs text-slate-500">
                      {l.user_agent || "—"}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {l.created_at
                        ? new Date(l.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!logs.length && (
              <p className="p-8 text-center text-sm text-slate-500">
                No audit events found.
              </p>
            )}
          </div>

          <Pager page={page} total={total} limit={limit} setPage={setPage} />
        </>
      )}

      {/* Security */}
      {tab === "security" && (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <ShieldAlert size={17} className="text-amber-300" />
                Failed logins by IP
              </h3>

              {Object.entries(securityByIp)
                .sort((a, b) => b[1] - a[1])
                .map(([ip, count]) => (
                  <div
                    key={ip}
                    className="flex justify-between border-b border-white/6 py-3 text-sm"
                  >
                    <span className="text-slate-300">{ip}</span>
                    <span className="font-semibold text-amber-300">
                      {count}
                    </span>
                  </div>
                ))}

              {!Object.keys(securityByIp).length && (
                <p className="text-sm text-slate-500">
                  No failed login attempts.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <Shield size={17} className="text-rose-300" />
                Failed logins by account
              </h3>

              {Object.entries(securityByAccount)
                .sort((a, b) => b[1] - a[1])
                .map(([email, count]) => (
                  <div
                    key={email}
                    className="flex justify-between border-b border-white/6 py-3 text-sm"
                  >
                    <span className="text-slate-300">{email}</span>
                    <span className="font-semibold text-rose-300">{count}</span>
                  </div>
                ))}

              {!Object.keys(securityByAccount).length && (
                <p className="text-sm text-slate-500">
                  No failed login attempts.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">
                Recent failed login attempts
              </h3>

              <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                {security.length} attempts
              </span>

              <button
                type="button"
                onClick={() => void loadSecurity()}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-white/8 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3">Email</th>
                    <th className="p-3">IP address</th>
                    <th className="p-3">Failure reason</th>
                    <th className="p-3">Browser / device</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/6">
                  {security.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-white/[.02]">
                      <td className="p-3 text-slate-300">{attempt.email}</td>

                      <td className="p-3 text-xs text-slate-400">
                        {attempt.ip_address || "Unknown"}
                      </td>

                      <td className="p-3 text-xs text-rose-300">
                        {attempt.failure_reason || "Not recorded"}
                      </td>

                      <td className="max-w-[220px] truncate p-3 text-xs text-slate-500">
                        {attempt.user_agent || "Unknown"}
                      </td>

                      <td className="whitespace-nowrap p-3 text-xs text-slate-500">
                        {attempt.created_at
                          ? new Date(attempt.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && !security.length && (
              <p className="p-6 text-center text-sm text-slate-500">
                No failed login attempts recorded.
              </p>
            )}

            {loading && (
              <p className="p-5 text-center text-sm text-slate-500">
                Loading security events…
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );

  const pageContent = (
    <>
      {content}

      {/* User detail modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#11151c] p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#45A29E]">
                  User detail
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {detail.name}
                </h2>
                <p className="text-sm text-slate-400">{detail.email}</p>
              </div>

              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Role" value={detail.role} />
              <Info
                label="Status"
                value={detail.is_banned ? "Banned" : "Active"}
              />
              <Info
                label="Created"
                value={
                  detail.created_at
                    ? new Date(detail.created_at).toLocaleDateString()
                    : "—"
                }
              />
            </div>

            {detail.ban_reason && (
              <p className="mt-4 rounded-lg bg-rose-400/5 p-3 text-sm text-rose-300">
                Ban reason: {detail.ban_reason}
              </p>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <DetailList
                title="Recent records"
                rows={detail.records || []}
                render={(x: any) => `${x.title} · ${x.status}`}
              />

              <DetailList
                title="Group memberships"
                rows={detail.groups || []}
                render={(x: any) => `${x.name} · ${x.id}`}
              />

              <DetailList
                title="Sessions"
                rows={detail.sessions || []}
                render={(x: any) =>
                  `${x.created_at || "Session"} · ${x.ip_address || "Unknown IP"} · ${x.user_agent || "Unknown device"}`
                }
              />

              <DetailList
                title="Recent activity"
                rows={detail.recent_activity || []}
                render={(x: any) => `${x.action} · ${x.created_at || ""}`}
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await adminService.revokeSessions(detail.id);
                  await inspect(detail.id);
                } catch {
                  setError("Could not revoke sessions.");
                }
              }}
              className="mt-5 rounded-lg border border-rose-300/20 px-4 py-2 text-sm text-rose-300 hover:bg-rose-300/10"
            >
              Revoke all sessions
            </button>
          </div>
        </div>
      )}
    </>
  );

  return embedded ? (
    pageContent
  ) : (
    <AppShell
      title="Administration"
      description="Manage platform access, content moderation, and security activity."
    >
      {pageContent}
    </AppShell>
  );
}

function Pager({
  page,
  total,
  limit,
  setPage,
}: {
  page: number;
  total: number;
  limit: number;
  setPage: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>
        {total} results · page {page + 1} of{" "}
        {Math.max(1, Math.ceil(total / limit))}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="rounded-lg border border-white/10 p-2 disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>

        <button
          type="button"
          disabled={(page + 1) * limit >= total}
          onClick={() => setPage(page + 1)}
          className="rounded-lg border border-white/10 p-2 disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium capitalize text-white">{value}</p>
    </div>
  );
}

function DetailList({
  title,
  rows,
  render,
}: {
  title: string;
  rows: any[];
  render: (x: any) => string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-white">
        {title} ({rows.length})
      </h3>

      <div className="max-h-40 space-y-2 overflow-y-auto">
        {rows.map((x, i) => (
          <p
            key={x.id || i}
            className="rounded-lg bg-white/[.03] p-2 text-xs text-slate-400"
          >
            {render(x)}
          </p>
        ))}

        {!rows.length && (
          <p className="text-xs text-slate-600">No data available.</p>
        )}
      </div>
    </div>
  );
}
