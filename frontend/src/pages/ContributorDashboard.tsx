import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  Clock3,
  CheckCircle2,
  Pencil,
  Trash2,
  FolderKanban,
  BookOpen,
} from "lucide-react";
import articleService from "../services/articleService";
import type { Article } from "../types/article";
import { useAuth } from "../contexts/AuthContext";

const statusTone: Record<string, string> = {
  draft: "text-amber-300 bg-amber-300/10",
  review: "text-violet-300 bg-violet-300/10",
  published: "text-emerald-300 bg-emerald-300/10",
};

export default function ContributorDashboard() {
  const { user } = useAuth();

  const [items, setItems] = useState<Article[]>([]);
  const [publicItems, setPublicItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;

    (async () => {
      try {
        const all = await articleService.getAll();

        if (live) {
          setItems(all.filter((a) => a.author_id === user?.id));

          setPublicItems(
            all.filter(
              (a) => a.status === "published" && a.author_id !== user?.id,
            ),
          );
        }
      } catch {
        if (live) {
          setError(
            "Could not load your records. Check the API connection and try again.",
          );
        }
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [user?.id]);

  const filtered = useMemo(
    () =>
      items.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  async function remove(id: number) {
    if (!confirm("Delete this record permanently?")) return;

    try {
      await articleService.delete(id);
      setItems((x) => x.filter((a) => a.id !== id));
    } catch {
      setError("Delete failed. You may not own this record.");
    }
  }

  const count = (s: string) => items.filter((a) => a.status === s).length;

  return (
    <div className="space-y-7">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "My records", value: items.length, icon: FileText },
          { label: "Drafts", value: count("draft"), icon: Pencil },
          { label: "In review", value: count("review"), icon: Clock3 },
          {
            label: "Published",
            value: count("published"),
            icon: CheckCircle2,
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

            <p className="mt-4 text-3xl font-semibold text-white">{x.value}</p>
          </div>
        ))}
      </div>

      {/* My records */}
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#11151c]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 p-5">
          <div>
            <h2 className="font-semibold text-white">Your records</h2>
            <p className="mt-1 text-xs text-slate-500">
              Only records authored by your account are shown.
            </p>
          </div>

          <Link
            to="/articles/new/edit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#66FCF1] px-4 py-2.5 text-sm font-bold text-[#0B0C10] hover:bg-[#9bfff8]"
          >
            <Plus size={16} />
            New record
          </Link>
        </div>

        <div className="border-b border-white/8 p-4">
          <div className="relative max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your records"
              className="w-full rounded-xl border border-white/10 bg-[#0B0C10] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#45A29E]"
            />
          </div>
        </div>

        {error && <p className="px-5 pt-4 text-sm text-rose-300">{error}</p>}

        {loading ? (
          <p className="p-10 text-center text-sm text-slate-500">
            Loading records…
          </p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="mx-auto mb-3 text-slate-600" size={30} />

            <p className="font-medium text-white">No records found</p>

            <p className="mt-1 text-sm text-slate-500">
              Create your first knowledge article to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-white/[.02]"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/articles/${a.id}`}
                    className="font-semibold text-white hover:text-[#66FCF1]"
                  >
                    {a.title}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500">
                    Updated{" "}
                    {a.updated_at
                      ? new Date(a.updated_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusTone[a.status] || "bg-white/10 text-slate-300"
                  }`}
                >
                  {a.status}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/articles/${a.id}`}
                    title="Read article"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#45A29E]/30 bg-[#45A29E]/5 px-3 py-2 text-xs font-semibold text-[#66FCF1] hover:bg-[#45A29E]/15"
                  >
                    <BookOpen size={14} />
                    Read
                  </Link>

                  <Link
                    title="Edit"
                    to={`/articles/${a.id}/edit`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/8 hover:text-[#66FCF1]"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    type="button"
                    title="Delete"
                    onClick={() => void remove(a.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-400/10 hover:text-rose-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Published knowledge */}
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#11151c]">
        <div className="border-b border-white/8 p-5">
          <h2 className="font-semibold text-white">Published knowledge</h2>

          <p className="mt-1 text-xs text-slate-500">
            Published records shared by other members of DocHub.
          </p>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading published articles…
          </p>
        ) : publicItems.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No published records to explore yet.
          </p>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {publicItems.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-white/6 p-4 transition hover:border-[#45A29E]/40 hover:bg-white/[.02]"
              >
                <p className="font-semibold text-white">{a.title}</p>

                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                  {a.content.slice(0, 160).replace(/[#*`]/g, "")}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#45A29E]">
                    By {a.author_name || "DocHub member"}
                  </p>

                  <Link
                    to={`/articles/${a.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#66FCF1] hover:underline"
                  >
                    <BookOpen size={14} />
                    Read article
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
