import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, CalendarDays, Edit3, Trash2 } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import articleService from "../services/articleService";
import type { Article } from "../types/article";
import { useAuth } from "../contexts/AuthContext";
import "highlight.js/styles/github-dark.css";
export default function ArticleDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    articleService
      .getById(Number(id))
      .then((a) => {
        if (live) setArticle(a);
      })
      .catch(() => {
        if (live)
          setError(
            "This record is unavailable or you do not have permission to view it.",
          );
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id]);
  async function remove() {
    if (!article || !confirm("Delete this record permanently?")) return;
    try {
      await articleService.delete(article.id);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Delete failed. You may not own this record.");
    }
  }
  const canEdit =
    !!article && (user?.role === "admin" || article.author_id === user?.id);
  return (
    <AppShell
      title="Knowledge record"
      description="Read and review documentation."
      action={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={15} /> Workspace
        </Link>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300">
          {error}
        </p>
      ) : (
        article && (
          <article className="mx-auto max-w-4xl">
            <header className="mb-8 border-b border-white/8 pb-7">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#45A29E]/10 px-3 py-1 text-xs capitalize text-[#66FCF1]">
                  {article.status}
                </span>
                <span className="text-xs text-slate-500">
                  Record #{article.id}
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>By {article.author_name || "Unknown author"}</span>
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  {article.created_at
                    ? new Date(article.created_at).toLocaleDateString()
                    : "Date unavailable"}
                </span>
              </div>
              {canEdit && (
                <div className="mt-5 flex gap-2">
                  <Link
                    to={`/articles/${article.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#66FCF1] px-3 py-2 text-xs font-bold text-[#0B0C10]"
                  >
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button
                    onClick={() => void remove()}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 px-3 py-2 text-xs text-rose-300"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </header>
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-[#66FCF1] prose-code:text-[#66FCF1] prose-pre:border prose-pre:border-white/10 prose-pre:bg-[#11151c]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </article>
        )
      )}
    </AppShell>
  );
}
