/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import MarkdownEditor from "../components/MarkdownEditor";
import articleService from "../services/articleService";
import categoryService from "../services/categoryService";
import type { Category } from "../types/category";
import { useAuth } from "../contexts/AuthContext";
export default function EditArticle() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const cats = await categoryService.getAll();
        if (live) setCategories(cats);
        if (!isNew) {
          const a = await articleService.getById(Number(id));
          if (a.author_id !== user?.id && user?.role !== "admin") {
            setError("You do not have permission to edit this record.");
            return;
          }
          if (live) {
            setTitle(a.title);
            setContent(a.content);
            setCategoryId(a.category_id ? String(a.category_id) : "");
          }
        }
      } catch {
        if (live)
          setError(
            "Could not load the record. It may not exist or you may not have access.",
          );
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [id, isNew, user?.id, user?.role]);
  async function save() {
    setError("");
    if (title.trim().length < 3 || !content.trim()) {
      setError("Enter a title (at least 3 characters) and some content.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        category_id: categoryId ? Number(categoryId) : null,
      };
      const a = isNew
        ? await articleService.create(payload)
        : await articleService.update(Number(id), payload);
      navigate(`/articles/${a.id}`, { replace: true });
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Could not save. Check your permissions and try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <AppShell
      title={isNew ? "Create record" : "Edit record"}
      description="Write structured documentation with Markdown and preview it before saving."
      action={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={15} /> Back
        </Link>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading editor…</p>
      ) : (
        <div className="mx-auto max-w-5xl space-y-5">
          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
          <section className="rounded-2xl border border-white/8 bg-[#11151c] p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Record title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Give your documentation a clear title"
              className="w-full border-0 bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-slate-700"
            />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <label className="text-xs text-slate-500">
                Category
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="ml-3 rounded-lg border border-white/10 bg-[#0B0C10] px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-xs text-slate-600">
                New records start as drafts. Only admins can change status.
              </span>
            </div>
          </section>
          <MarkdownEditor value={content} onChange={setContent} />
          <div className="flex justify-end gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Link>
            <button
              disabled={saving}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#66FCF1] px-5 py-3 text-sm font-bold text-[#0B0C10] disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save draft"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
