import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  FileEdit,
  Clock3,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  Loader2,
  LayoutList,
  UserRound,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import articleService from "../services/articleService";

import type { Article, ArticleStatus } from "../types/article";

type ArticleScope = "all" | "mine";

const statusStyles: Record<ArticleStatus, string> = {
  draft: "border-[#45A29E]/30 bg-[#45A29E]/10 text-[#C5C6C7]",
  review: "border-[#66FCF1]/30 bg-[#66FCF1]/10 text-[#66FCF1]",
  published: "border-[#45A29E]/50 bg-[#45A29E]/20 text-[#66FCF1]",
};

export default function ContributorDashboard() {
  const { user } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [scope, setScope] = useState<ArticleScope>("all");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadArticles = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      const data = await articleService.getAll();
      setArticles(data);
    } catch {
      setError("Could not load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const myArticles = useMemo(
    () => articles.filter((article) => article.author_id === user?.id),
    [articles, user?.id]
  );

  const scopedArticles = useMemo(
    () => (scope === "mine" ? myArticles : articles),
    [scope, myArticles, articles]
  );

  const filteredArticles = useMemo(() => {
    if (filter === "all") return scopedArticles;

    return scopedArticles.filter(
      (article) => article.status === filter
    );
  }, [scopedArticles, filter]);

  const stats = {
    total: myArticles.length,
    draft: myArticles.filter((article) => article.status === "draft").length,
    review: myArticles.filter((article) => article.status === "review").length,
    published: myArticles.filter(
      (article) => article.status === "published"
    ).length,
  };

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      setError("");
      setDeletingId(id);
      await articleService.delete(id);
      await loadArticles();
    } catch {
      setError("Could not delete the article. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const statCards = [
    {
      label: "My articles",
      value: stats.total,
      icon: FileText,
      description: "Total articles created",
    },
    {
      label: "Drafts",
      value: stats.draft,
      icon: FileEdit,
      description: "Still in progress",
    },
    {
      label: "In review",
      value: stats.review,
      icon: Clock3,
      description: "Waiting for review",
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle2,
      description: "Available to readers",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 text-[#C5C6C7] sm:px-6 lg:py-10">
      {/* Dashboard heading */}
      <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#66FCF1]">
            <LayoutList size={17} />
            Contributor workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#C5C6C7] sm:text-4xl">
            Welcome, {user?.name}
          </h1>

          <p className="mt-2 text-sm text-[#C5C6C7]/60 sm:text-base">
            Manage your articles and explore published content.
          </p>
        </div>

        <Link
          to="/?create=1"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#66FCF1] px-5 py-3 text-sm font-semibold text-[#0B0C10] transition hover:bg-[#45A29E] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#66FCF1] focus:ring-offset-2 focus:ring-offset-[#0B0C10]"
        >
          <Plus size={18} />
          Create new article
        </Link>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#45A29E]/25 bg-[#1F2833] p-5 transition duration-200 hover:border-[#66FCF1]/50"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#C5C6C7]/65">
                  {item.label}
                </p>

                <div className="rounded-lg bg-[#45A29E]/15 p-2.5 text-[#66FCF1]">
                  <Icon size={19} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-[#C5C6C7]">
                {item.value}
              </p>

              <p className="mt-1 text-xs text-[#C5C6C7]/45">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Article management */}
      <div className="overflow-hidden rounded-xl border border-[#45A29E]/25 bg-[#1F2833]">
        {/* Toolbar */}
        <div className="flex flex-col justify-between gap-5 border-b border-[#45A29E]/20 p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={19} className="text-[#66FCF1]" />

              <h2 className="text-lg font-semibold text-[#C5C6C7]">
                {scope === "all" ? "All Articles" : "My Articles"}
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#C5C6C7]/50">
              {scope === "all"
                ? "Browse published articles and your own unpublished articles."
                : "Manage articles created by you."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Article scope */}
            <div className="flex rounded-lg border border-[#45A29E]/30 bg-[#0B0C10]/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setScope("all");
                  setFilter("all");
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  scope === "all"
                    ? "bg-[#66FCF1] text-[#0B0C10]"
                    : "text-[#C5C6C7]/65 hover:bg-[#45A29E]/15 hover:text-[#66FCF1]"
                }`}
              >
                All Articles
              </button>

              <button
                type="button"
                onClick={() => {
                  setScope("mine");
                  setFilter("all");
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  scope === "mine"
                    ? "bg-[#66FCF1] text-[#0B0C10]"
                    : "text-[#C5C6C7]/65 hover:bg-[#45A29E]/15 hover:text-[#66FCF1]"
                }`}
              >
                My Articles
              </button>
            </div>

            {/* Status filter */}
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-[#45A29E]/30 bg-[#0B0C10] px-3 py-2 text-sm text-[#C5C6C7] outline-none transition focus:border-[#66FCF1] focus:ring-1 focus:ring-[#66FCF1]/30"
            >
              <option value="all">Status</option>
              <option value="draft">Drafts</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
            </select>

            <button
              type="button"
              onClick={() => void loadArticles()}
              disabled={loading}
              title="Refresh articles"
              className="inline-flex items-center justify-center rounded-lg border border-[#45A29E]/30 px-3 py-2 text-[#C5C6C7]/70 transition hover:border-[#66FCF1]/50 hover:text-[#66FCF1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Article list */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-[#C5C6C7]/60">
            <Loader2 size={19} className="animate-spin text-[#66FCF1]" />
            Loading articles...
          </div>
        ) : error ? (
          <div className="m-5 rounded-lg border border-[#45A29E]/30 bg-[#0B0C10] p-4">
            <p className="text-sm text-[#66FCF1]">{error}</p>
            <button
              type="button"
              onClick={() => void loadArticles()}
              className="mt-3 text-sm font-medium text-[#66FCF1] hover:text-[#45A29E]"
            >
              Try again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#45A29E]/15 text-[#66FCF1]">
              {scope === "mine" ? (
                <FileText size={22} />
              ) : (
                <Search size={22} />
              )}
            </div>

            <p className="font-semibold text-[#C5C6C7]">
              No articles found
            </p>

            <p className="mt-2 text-sm text-[#C5C6C7]/50">
              {scope === "mine"
                ? "You haven't created any articles yet."
                : "There are no articles matching this filter."}
            </p>

            {scope === "mine" && (
              <Link
                to="/?create=1"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#66FCF1] transition hover:text-[#45A29E]"
              >
                <Plus size={16} />
                Create your first article
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#45A29E]/15">
            {filteredArticles.map((article) => {
              const isOwner = article.author_id === user?.id;

              return (
                <div
                  key={article.id}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-[#0B0C10]/30 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/articles/${article.id}`}
                      className="font-semibold text-[#C5C6C7] transition hover:text-[#66FCF1]"
                    >
                      {article.title}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C5C6C7]/45">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={13} />
                        {article.author_name || "Unknown author"}
                      </span>

                      <span>
                        {article.created_at
                          ? new Date(article.created_at).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                        statusStyles[article.status]
                      }`}
                    >
                      {article.status}
                    </span>

                    <Link
                      to={`/articles/${article.id}`}
                      title="Read article"
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#C5C6C7]/65 transition hover:bg-[#45A29E]/15 hover:text-[#66FCF1]"
                    >
                      <Eye size={15} />
                      Read
                    </Link>

                    {isOwner && (
                      <>
                        <Link
                          to={`/articles/${article.id}/edit`}
                          title="Edit article"
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#66FCF1] transition hover:bg-[#66FCF1]/10"
                        >
                          <Pencil size={15} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === article.id}
                          onClick={() => void handleDelete(article.id)}
                          title="Delete article"
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#C5C6C7]/55 transition hover:bg-[#45A29E]/15 hover:text-[#66FCF1] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === article.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
