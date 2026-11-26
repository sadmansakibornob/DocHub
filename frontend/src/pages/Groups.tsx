import { useEffect, useState } from "react";
import { Plus, Users, FolderOpen, Trash2, UserPlus, X } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import groupService, {
  type Group,
  type GroupMember,
} from "../services/groupService";
import type { Article } from "../types/article";
import articleService from "../services/articleService";
import { useAuth } from "../contexts/AuthContext";

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [renameName, setRenameName] = useState("");
  const [renameDescription, setRenameDescription] = useState("");

  const [newUserEmail, setNewUserEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"member" | "editor">("member");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  async function load() {
    try {
      setGroups(await groupService.list());
    } catch {
      setError("Unable to load groups.");
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function select(g: Group) {
    setError("");

    try {
      const [full, m, a, all] = await Promise.all([
        groupService.get(g.id),
        groupService.members(g.id),
        groupService.articles(g.id),
        articleService.getAll(),
      ]);

      setSelected(full);
      setRenameName(full.name);
      setRenameDescription(full.description || "");
      setMembers(m);
      setArticles(a);
      setMyArticles(all.filter((x: Article) => x.author_id === user?.id));
    } catch {
      setError(
        "Could not load group details. Only members can view this group.",
      );
    }
  }

  async function create() {
    if (name.trim().length < 2) return;

    setBusy(true);

    try {
      const g = await groupService.create({
        name: name.trim(),
        description,
      });

      setGroups((x) => [g, ...x]);
      setName("");
      setDescription("");
      await select(g);
    } catch {
      setError("Group creation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    if (!selected || !newUserEmail.trim()) return;

    const email = newUserEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setAddingMember(true);
    setError("");

    try {
      await groupService.addMember(selected.id, {
        email,
        role: memberRole,
      });

      setNewUserEmail("");
      await select(selected);
    } catch (err: any) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Could not add member. Check that the email belongs to a registered user and you are the group owner.",
      );
    } finally {
      setAddingMember(false);
    }
  }

  async function delGroup() {
    if (!selected || !confirm("Delete this group and its memberships?")) {
      return;
    }

    try {
      await groupService.remove(selected.id);
      setGroups((x) => x.filter((g) => g.id !== selected.id));
      setSelected(null);
    } catch {
      setError("Only the group owner can delete it.");
    }
  }

  async function removeMember(uid: string) {
    if (!selected) return;

    try {
      await groupService.removeMember(selected.id, uid);
      await select(selected);
    } catch {
      setError("Could not remove this member.");
    }
  }

  async function changeRole(uid: string, role: "member" | "editor") {
    if (!selected) return;

    try {
      await groupService.setMemberRole(selected.id, uid, role);
      await select(selected);
    } catch {
      setError("Only the owner can manage member roles.");
    }
  }

  async function assign(articleId: number) {
    if (!selected) return;

    try {
      await groupService.assignArticle(selected.id, articleId);
      await select(selected);
    } catch {
      setError(
        "Could not assign this record. You need to own it and be an owner/editor.",
      );
    }
  }

  async function unassign(articleId: number) {
    if (!selected) return;

    try {
      await groupService.unassignArticle(selected.id, articleId);
      await select(selected);
    } catch {
      setError("Could not unassign this record.");
    }
  }

  async function saveShared() {
    if (!selected || !editing) return;

    try {
      await groupService.updateArticle(selected.id, editing.id, {
        title: editTitle.trim(),
        content: editContent,
      });

      setEditing(null);
      await select(selected);
    } catch {
      setError(
        "Could not update shared record. Only owners and editors can edit.",
      );
    }
  }

  const owner = selected?.membership_role === "owner";

  return (
    <AppShell
      title="Shared groups"
      description="Collaborate around shared knowledge. Owners manage membership; editors can assign and update shared records."
    >
      {error && (
        <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
        <section className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Your groups</h2>
            <span className="text-xs text-slate-500">
              {groups.length} total
            </span>
          </div>

          <div className="space-y-2">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => void select(g)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selected?.id === g.id
                    ? "border-[#45A29E]/60 bg-[#45A29E]/10"
                    : "border-white/6 hover:bg-white/[.03]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-[#66FCF1]">
                    <Users size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {g.name}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {g.membership_role || "member"}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {groups.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                You haven't joined a group yet.
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-white/8 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Create a group
            </h3>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="mb-2 w-full rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2.5 text-sm outline-none focus:border-[#45A29E]"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2.5 text-sm outline-none focus:border-[#45A29E]"
            />

            <button
              disabled={busy || name.trim().length < 2}
              onClick={() => void create()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#66FCF1] px-3 py-2.5 text-sm font-bold text-[#0B0C10] disabled:opacity-40"
            >
              <Plus size={16} /> Create group
            </button>
          </div>
        </section>

        <section className="min-h-[520px] rounded-2xl border border-white/8 bg-[#11151c] p-5">
          {!selected ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
              <FolderOpen size={34} className="mb-3 text-slate-600" />
              <h2 className="font-semibold text-white">Select a group</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Choose a group to inspect members and shared records.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selected.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {selected.description || "No description provided."}
                  </p>

                  <p className="mt-2 text-xs capitalize text-[#45A29E]">
                    Your access: {selected.membership_role}
                  </p>

                  {owner && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        placeholder="Group name"
                        className="rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-xs"
                      />

                      <input
                        value={renameDescription}
                        onChange={(e) => setRenameDescription(e.target.value)}
                        placeholder="Description"
                        className="rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-xs"
                      />

                      <button
                        onClick={async () => {
                          try {
                            const updated = await groupService.update(
                              selected.id,
                              {
                                name: renameName,
                                description: renameDescription,
                              },
                            );

                            setSelected({
                              ...updated,
                              membership_role: "owner",
                            });

                            setGroups((gs) =>
                              gs.map((x) =>
                                x.id === updated.id ? updated : x,
                              ),
                            );
                          } catch {
                            setError("Could not rename group.");
                          }
                        }}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"
                      >
                        Save details
                      </button>
                    </div>
                  )}
                </div>

                {owner && (
                  <button
                    onClick={() => void delGroup()}
                    className="flex items-center gap-2 rounded-lg border border-rose-400/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-400/10"
                  >
                    <Trash2 size={14} /> Delete group
                  </button>
                )}
              </div>

              <div className="grid gap-6 pt-5 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      Members{" "}
                      <span className="text-slate-500">({members.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {members.map((m) => (
                      <div
                        key={m.user_id}
                        className="flex items-center gap-2 rounded-xl border border-white/6 p-3"
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#45A29E]/15 text-xs font-bold text-[#66FCF1]">
                          {m.users?.name?.slice(0, 1) || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {m.users?.name || m.user_id}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {m.users?.email || m.user_id}
                          </p>
                        </div>

                        {owner && m.role !== "owner" ? (
                          <>
                            <select
                              value={m.role}
                              onChange={(e) =>
                                void changeRole(
                                  m.user_id,
                                  e.target.value as "member" | "editor",
                                )
                              }
                              className="rounded-md border border-white/10 bg-[#0B0C10] px-2 py-1 text-xs"
                            >
                              <option value="member">Member</option>
                              <option value="editor">Editor</option>
                            </select>

                            <button
                              title="Remove member"
                              onClick={() => void removeMember(m.user_id)}
                              className="rounded-md p-1.5 text-slate-500 hover:text-rose-300"
                            >
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs capitalize text-[#45A29E]">
                            {m.role}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {owner && (
                    <div className="mt-4 rounded-xl border border-white/8 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Invite existing user by email
                      </p>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void add();
                        }}
                      >
                        <input
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="user@example.com"
                          required
                          autoComplete="email"
                          className="mb-2 w-full rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-sm outline-none focus:border-[#45A29E]"
                        />

                        <div className="flex gap-2">
                          <select
                            value={memberRole}
                            onChange={(e) =>
                              setMemberRole(
                                e.target.value as "member" | "editor",
                              )
                            }
                            className="flex-1 rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="editor">Editor</option>
                          </select>

                          <button
                            type="submit"
                            disabled={addingMember || !newUserEmail.trim()}
                            className="flex items-center justify-center gap-2 rounded-lg bg-[#66FCF1] px-3 py-2 text-xs font-bold text-[#0B0C10] disabled:opacity-40"
                          >
                            <UserPlus size={15} />
                            {addingMember ? "Adding..." : "Add"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-white">
                    Shared records
                  </h3>

                  <div className="space-y-2">
                    {articles.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 rounded-xl border border-white/6 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {a.title}
                          </p>

                          <p className="text-xs capitalize text-slate-500">
                            {a.status}
                          </p>
                        </div>

                        {(selected.membership_role === "owner" ||
                          selected.membership_role === "editor") && (
                          <button
                            onClick={() => {
                              setEditing(a);
                              setEditTitle(a.title);
                              setEditContent(a.content);
                            }}
                            className="rounded-md p-1.5 text-slate-500 hover:text-[#66FCF1]"
                            title="Edit shared record"
                          >
                            <span className="text-xs">Edit</span>
                          </button>
                        )}

                        {(selected.membership_role === "owner" ||
                          selected.membership_role === "editor") && (
                          <button
                            onClick={() => void unassign(a.id)}
                            className="rounded-md p-1.5 text-slate-500 hover:text-rose-300"
                            title="Remove from group"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}

                    {articles.length === 0 && (
                      <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">
                        No records assigned.
                      </p>
                    )}
                  </div>

                  {(selected.membership_role === "owner" ||
                    selected.membership_role === "editor") && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Assign one of your records
                      </p>

                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            void assign(Number(e.target.value));
                          }
                          e.target.value = "";
                        }}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2.5 text-sm"
                      >
                        <option value="">Select a record…</option>

                        {myArticles
                          .filter((a) => !articles.some((x) => x.id === a.id))
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title}
                            </option>
                          ))}
                      </select>

                      <p className="mt-2 text-[11px] text-slate-600">
                        The API enforces ownership and group editor permissions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#11151c] p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Edit shared record
            </h3>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2.5 text-sm text-white"
            />

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-white/10 bg-[#0B0C10] p-3 font-mono text-sm text-slate-200"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={() => void saveShared()}
                className="rounded-lg bg-[#66FCF1] px-4 py-2 text-sm font-bold text-[#0B0C10]"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
