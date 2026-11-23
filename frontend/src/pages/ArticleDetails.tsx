import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  Pencil,
  Tag,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";

import "highlight.js/styles/github-dark.css";

import articleService from "../services/articleService";
import categoryService from "../services/categoryService";

import type { Article } from "../types/article";
import type { Category } from "../types/category";

export default function ArticleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
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
      } catch {
        setError("Article could not be found or loaded.");
      } finally {
        setLoading(false);
      }
    }

    void loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[#C5C6C7]/60">
        <Loader2 size={22} className="animate-spin text-[#66FCF1]" />
        <span className="text-sm">Loading article...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-xl border border-[#45A29E]/25 bg-[#1F2833] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#45A29E]/15 text-[#66FCF1]">
            <AlertCircle size={24} />
          </div>

          <h2 className="text-lg font-semibold text-[#C5C6C7]">
            Unable to load article
          </h2>

          <p className="mt-2 text-sm text-[#C5C6C7]/55">
            {error || "Article not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#66FCF1] px-4 py-2.5 text-sm font-semibold text-[#0B0C10] transition hover:bg-[#45A29E] hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const category = categories.find(
    (item) => item.id === article.category_id
  );

  const statusStyles: Record<string, string> = {
    draft: "border-[#45A29E]/30 bg-[#45A29E]/10 text-[#C5C6C7]",
    review: "border-[#66FCF1]/30 bg-[#66FCF1]/10 text-[#66FCF1]",
    published: "border-[#45A29E]/50 bg-[#45A29E]/20 text-[#66FCF1]",
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 text-[#C5C6C7] sm:px-6 lg:py-12">
      {/* Back navigation */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#C5C6C7]/55 transition hover:text-[#66FCF1]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#45A29E]/25 bg-[#1F2833]">
        {/* Article header */}
        <header className="border-b border-[#45A29E]/20 px-6 py-8 sm:px-10 sm:py-10">
          {/* Metadata */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {category && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#45A29E]/30 bg-[#45A29E]/10 px-3 py-1.5 text-xs font-medium text-[#66FCF1]">
                <Tag size={13} />
                {category.name}
              </span>
            )}

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                statusStyles[article.status] ||
                "border-[#45A29E]/30 bg-[#0B0C10] text-[#C5C6C7]"
              }`}
            >
              {article.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#C5C6C7] sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {/* Article information */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#C5C6C7]/50">
            <span className="inline-flex items-center gap-2">
              <Hash size={15} className="text-[#45A29E]" />
              Article #{article.id}
            </span>

            <span className="inline-flex items-center gap-2">
              <FileText size={15} className="text-[#45A29E]" />
              Author: {article.author_id}
            </span>

            {article.created_at && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={15} className="text-[#45A29E]" />
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={`/articles/${article.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#66FCF1] px-5 py-2.5 text-sm font-semibold text-[#0B0C10] transition hover:bg-[#45A29E] hover:text-white"
            >
              <Pencil size={16} />
              Edit article
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-[#45A29E]/30 px-5 py-2.5 text-sm font-medium text-[#C5C6C7]/70 transition hover:border-[#66FCF1]/50 hover:text-[#66FCF1]"
            >
              <BookOpen size={16} />
              Dashboard
            </Link>
          </div>
        </header>

        {/* Markdown content */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div
            className="
              prose prose-invert max-w-none
              prose-headings:font-semibold
              prose-headings:tracking-tight
              prose-headings:text-[#C5C6C7]
              prose-p:leading-8
              prose-p:text-[#C5C6C7]/75
              prose-strong:text-[#C5C6C7]
              prose-a:text-[#66FCF1]
              prose-a:no-underline
              hover:prose-a:underline
              prose-blockquote:border-l-[#66FCF1]
              prose-blockquote:text-[#C5C6C7]/65
              prose-li:text-[#C5C6C7]/75
              prose-hr:border-[#45A29E]/25
              prose-th:border-[#45A29E]/30
              prose-th:bg-[#0B0C10]
              prose-th:px-4
              prose-th:py-3
              prose-th:text-[#66FCF1]
              prose-td:border-[#45A29E]/20
              prose-td:px-4
              prose-td:py-3
              prose-pre:overflow-x-auto
              prose-pre:rounded-xl
              prose-pre:border
              prose-pre:border-[#45A29E]/25
              prose-pre:bg-[#0B0C10]
              prose-code:text-[#66FCF1]
              prose-code:before:content-none
              prose-code:after:content-none
              prose-img:rounded-xl
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Article footer */}
        <footer className="flex flex-col justify-between gap-3 border-t border-[#45A29E]/20 px-6 py-5 sm:flex-row sm:items-center sm:px-10">
          <div className="flex items-center gap-2 text-xs text-[#C5C6C7]/40">
            <BookOpen size={14} />
            DocHub Knowledge Platform
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#66FCF1] transition hover:text-[#45A29E]"
          >
            <ArrowLeft size={15} />
            Back to articles
          </button>
        </footer>
      </article>
    </main>
  );
}
