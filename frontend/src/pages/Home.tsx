import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Plus,
  LogOut,
  ArrowRight,
  FileText,
  Layers,
  X,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import articleService from "../services/articleService";
import categoryService from "../services/categoryService";
import MarkdownEditor from "../components/MarkdownEditor";

import type { Article } from "../types/article";
import type { Category } from "../types/category";

export default function Home() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditor, setShowEditor] = useState(
    searchParams.get("create") === "1"
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadContent() {
    try {
      setError("");

      const [articleData, categoryData] = await Promise.all([
        articleService.getAll(),
        categoryService.getAll(),
      ]);

      setArticles(articleData);
      setCategories(categoryData);
    } catch {
      setError("Could not load articles. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContent();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.content.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        String(article.category_id) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, selectedCategory]);

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and article content.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await articleService.create({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId ? Number(categoryId) : null,
      });

      setTitle("");
      setContent("");
      setCategoryId("");
      setShowEditor(false);
      setSearchParams({});

      await loadContent();
    } catch {
      setError("Could not create the post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleEditor() {
    const nextState = !showEditor;

    setShowEditor(nextState);
    setError("");
    setSearchParams(nextState ? { create: "1" } : {});
  }

  function getCategoryName(id: number | null) {
    if (!id) return "General";

    return categories.find(
      (category) => String(category.id) === String(id)
    )?.name || "General";
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-[#C5C6C7]">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#45A29E]/20 bg-[#0B0C10]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">

          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#C5C6C7]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#66FCF1]/10 text-[#66FCF1]">
              <BookOpen size={20} />
            </span>
            <span>
              Doc<span className="text-[#66FCF1]">Hub</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden text-sm font-medium text-[#C5C6C7]/70 transition hover:text-[#66FCF1] sm:block"
                >
                  Dashboard
                </Link>

                <span className="hidden text-sm font-semibold text-[#C5C6C7] sm:block">
                  {user.name}
                </span>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="flex items-center gap-2 rounded-lg border border-[#45A29E]/30 px-3 py-2 text-sm text-[#C5C6C7]/80 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-400"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-[#66FCF1] px-4 py-2 text-sm font-bold text-[#0B0C10] transition hover:bg-[#45A29E]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Introduction */}
        <section className="mb-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#66FCF1]">
            <BookOpen size={17} />
            Welcome to DocHub
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#C5C6C7] sm:text-4xl">
            Knowledge, shared.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-[#C5C6C7]/60">
            Explore articles, discover new ideas, and share your knowledge
            with the DocHub community.
          </p>

          {user && (
            <button
              onClick={toggleEditor}
              className="mt-6 flex items-center gap-2 rounded-lg bg-[#66FCF1] px-5 py-3 text-sm font-bold text-[#0B0C10] transition hover:bg-[#45A29E]"
            >
              {showEditor ? <X size={17} /> : <Plus size={17} />}
              {showEditor ? "Cancel" : "Create post"}
            </button>
          )}
        </section>

        {/* Create Article */}
        {user && showEditor && (
          <section className="mb-10 rounded-xl border border-[#45A29E]/25 bg-[#1F2833] p-6">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#C5C6C7]">
                  Create a post
                </h2>
                <p className="mt-1 text-sm text-[#C5C6C7]/60">
                  Share something useful with the community.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleEditor}
                className="rounded-lg p-2 text-[#C5C6C7]/50 transition hover:bg-[#0B0C10] hover:text-[#66FCF1]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5">

              <div>
                <label htmlFor="post-title" className="mb-2 block text-sm font-semibold text-[#C5C6C7]">
                  Title
                </label>
                <input
                  id="post-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter your article title"
                  required
                  className="w-full rounded-lg border border-[#45A29E]/25 bg-[#0B0C10] px-4 py-3 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
                />
              </div>

              <div>
                <label htmlFor="post-category" className="mb-2 block text-sm font-semibold text-[#C5C6C7]">
                  Category
                </label>

                <div className="relative">
                  <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45A29E]" />
                  <select
                    id="post-category"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#45A29E]/25 bg-[#0B0C10] py-3 pl-10 pr-10 text-sm text-[#C5C6C7] outline-none transition focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#45A29E]" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C5C6C7]">
                  Content
                </label>
                <MarkdownEditor value={content} onChange={setContent} />
              </div>

              <div className="flex flex-col gap-3 border-t border-[#45A29E]/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#C5C6C7]/50">
                  New posts are saved as drafts for review.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#66FCF1] px-5 py-3 text-sm font-bold text-[#0B0C10] transition hover:bg-[#45A29E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16} />
                  {saving ? "Creating..." : "Create post"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Articles */}
        <section>

          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#C5C6C7]">
                Articles
              </h2>
              <p className="mt-1 text-sm text-[#C5C6C7]/50">
                Explore knowledge shared by the community.
              </p>
            </div>

            <span className="flex w-fit items-center gap-2 rounded-lg border border-[#45A29E]/25 bg-[#1F2833] px-3 py-2 text-sm font-semibold text-[#66FCF1]">
              <FileText size={16} />
              {filteredArticles.length} posts
            </span>
          </div>

          {/* Search and filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45A29E]" />
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-[#45A29E]/25 bg-[#1F2833] py-3 pl-10 pr-4 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/30 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
              />
            </div>

            <div className="relative sm:w-56">
              <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45A29E]" />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full appearance-none rounded-lg border border-[#45A29E]/25 bg-[#1F2833] py-3 pl-10 pr-10 text-sm text-[#C5C6C7] outline-none transition focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#45A29E]" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
              {error}
              <button onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#C5C6C7]/60">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#45A29E]/30 border-t-[#66FCF1]" />
              Loading articles...
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#45A29E]/30 bg-[#1F2833] py-16 text-center">
              <BookOpen size={32} className="mx-auto text-[#45A29E]" />
              <h3 className="mt-4 font-semibold text-[#C5C6C7]">
                No articles found.
              </h3>
              <p className="mt-2 text-sm text-[#C5C6C7]/50">
                Try another search or category.
              </p>
            </div>
          )}

          {/* Article cards */}
          {!loading && filteredArticles.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group rounded-xl border border-[#45A29E]/20 bg-[#1F2833] p-5 transition hover:-translate-y-1 hover:border-[#66FCF1]/50 hover:shadow-lg hover:shadow-[#66FCF1]/5"
                >
                  <Link to={`/articles/${article.id}`} className="block">

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 rounded-md bg-[#66FCF1]/10 px-2.5 py-1.5 text-xs font-semibold text-[#66FCF1]">
                        <Layers size={13} />
                        {getCategoryName(article.category_id)}
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-[#45A29E] transition group-hover:translate-x-1 group-hover:text-[#66FCF1]"
                      />
                    </div>

                    <h3 className="mt-5 line-clamp-2 text-lg font-bold text-[#C5C6C7] transition group-hover:text-[#66FCF1]">
                      {article.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#C5C6C7]/55">
                      {article.content.length > 180
                        ? `${article.content.slice(0, 180)}...`
                        : article.content}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-[#45A29E]/20 pt-4">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#66FCF1]">
                        Read article <ArrowRight size={14} />
                      </span>

                      {article.status !== "published" && (
                        <span className="rounded-full border border-[#E9A45B]/30 bg-[#E9A45B]/10 px-2.5 py-1 text-xs font-medium capitalize text-[#E9A45B]">
                          {article.status}
                        </span>
                      )}
                    </div>

                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#45A29E]/20 bg-[#0B0C10]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:flex-row">
          <Link to="/" className="flex items-center gap-2 font-bold text-[#C5C6C7]">
            <BookOpen size={18} className="text-[#66FCF1]" />
            DocHub
          </Link>

          <p className="text-xs text-[#C5C6C7]/40">
            Knowledge grows when shared.
          </p>

          <span className="text-xs text-[#C5C6C7]/40">
            © {new Date().getFullYear()} DocHub
          </span>
        </div>
      </footer>
    </main>
  );
}
