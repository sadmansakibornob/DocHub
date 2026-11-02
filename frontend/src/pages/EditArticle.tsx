
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileEdit,
  FileText,
  Tag,
  Save,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import articleService from "../services/articleService";
import categoryService from "../services/categoryService";
import MarkdownEditor from "../components/MarkdownEditor";

import type { Article, ArticleUpdate } from "../types/article";
import type { Category } from "../types/category";

export default function EditArticle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
        setError("Invalid article ID.");
        setLoading(false);
        return;
      }

      try {
        const [articleData, categoryData] = await Promise.all([
          articleService.getById(Number(id)),
          categoryService.getAll(),
        ]);

        setArticle(articleData);
        setCategories(categoryData);

        setTitle(articleData.title);
        setContent(articleData.content || "");
        setCategoryId(
          articleData.category_id != null
            ? String(articleData.category_id)
            : ""
        );
      } catch {
        setError("Could not load article. Check your permissions.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!article) return;

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updateData: ArticleUpdate = {
        title: title.trim(),
        content,
        category_id: categoryId ? Number(categoryId) : null,
      };

      await articleService.update(article.id, updateData);

      navigate("/dashboard");
    } catch {
      setError(
        "Could not save changes. Check your permissions and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[#C5C6C7]/60">
        <Loader2 size={21} className="animate-spin text-[#66FCF1]" />
        <span className="text-sm">Loading editor...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
        <div className="rounded-xl border border-[#45A29E]/25 bg-[#1F2833] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#45A29E]/15 text-[#66FCF1]">
            <AlertCircle size={24} />
          </div>

          <h2 className="font-semibold text-[#C5C6C7]">
            Unable to open editor
          </h2>

          <p className="mt-2 text-sm text-[#C5C6C7]/55">
            {error || "Article not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#66FCF1] px-5 py-2.5 text-sm font-semibold text-[#0B0C10] transition hover:bg-[#45A29E] hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 text-[#C5C6C7] sm:px-6 lg:py-10">
      {/* Page heading */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#C5C6C7]/55 transition hover:text-[#66FCF1]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#45A29E]/30 bg-[#45A29E]/15 text-[#66FCF1]">
            <FileEdit size={21} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#C5C6C7]">
              Edit article
            </h1>

            <p className="mt-1 text-sm text-[#C5C6C7]/50">
              Update your documentation and save your changes.
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#45A29E]/40 bg-[#1F2833] p-4">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-[#66FCF1]"
          />

          <p className="text-sm text-[#C5C6C7]">{error}</p>
        </div>
      )}

      {/* Edit form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-[#45A29E]/25 bg-[#1F2833]"
      >
        <div className="space-y-7 p-5 sm:p-8">
          {/* Article title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#C5C6C7]"
            >
              <FileText size={16} className="text-[#66FCF1]" />
              Article title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Enter article title"
              className="w-full rounded-lg border border-[#45A29E]/30 bg-[#0B0C10] px-4 py-3 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#C5C6C7]"
            >
              <Tag size={16} className="text-[#66FCF1]" />
              Category
            </label>

            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-lg border border-[#45A29E]/30 bg-[#0B0C10] px-4 py-3 text-sm text-[#C5C6C7] outline-none transition focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
            >
              <option value="">No category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Markdown editor */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#C5C6C7]">
              <BookOpen size={16} className="text-[#66FCF1]" />
              Article content
              <span className="text-xs font-normal text-[#C5C6C7]/40">
                (Markdown)
              </span>
            </label>

            <div className="overflow-hidden rounded-lg border border-[#45A29E]/30 bg-[#0B0C10]">
              <MarkdownEditor
                value={content}
                onChange={setContent}
              />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#C5C6C7]/45">
              Markdown is supported. Use # for headings, **text** for bold,
              and fenced code blocks for code snippets.
            </p>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#45A29E]/20 bg-[#0B0C10]/40 px-5 py-5 sm:px-8">
          <p className="text-xs text-[#C5C6C7]/40">
            Make sure your changes are ready before saving.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-[#45A29E]/30 px-5 py-2.5 text-sm font-medium text-[#C5C6C7]/70 transition hover:border-[#66FCF1]/50 hover:text-[#66FCF1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#66FCF1] px-6 py-2.5 text-sm font-semibold text-[#0B0C10] transition hover:bg-[#45A29E] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
