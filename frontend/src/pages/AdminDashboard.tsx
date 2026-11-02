
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  FileEdit,
  Clock3,
  Users,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Save,
  X,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  Tag,
  AlertCircle,
  Check,
} from "lucide-react";

import articleService from "../services/articleService";
import categoryService from "../services/categoryService";
import authService from "../services/authService";

import type { Article, ArticleStatus } from "../types/article";
import type { Category } from "../types/category";
import type { User } from "../types/user";

type ArticleEditForm = {
  title: string;
  content: string;
  category_id: string;
};

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingArticleId, setEditingArticleId] = useState<number | null>(
    null
  );

  const [editForm, setEditForm] = useState<ArticleEditForm>({
    title: "",
    content: "",
    category_id: "",
  });

  async function loadDashboard() {
    try {
      setError("");

      const [articleData, userData, categoryData] = await Promise.all([
        articleService.getAll(),
        authService.getAllUsers(),
        categoryService.getAll(),
      ]);

      setArticles(articleData);
      setUsers(userData);
      setCategories(categoryData);
    } catch {
      setError("Could not load dashboard data. Check your admin permissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  function startEditing(article: Article) {
    setEditingArticleId(article.id);

    setEditForm({
      title: article.title,
      content: article.content,
      category_id: article.category_id
        ? String(article.category_id)
        : "",
    });

    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingArticleId(null);

    setEditForm({
      title: "",
      content: "",
      category_id: "",
    });
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingArticleId === null) return;

    if (!editForm.title.trim() || !editForm.content.trim()) {
      setError("Article title and content are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await articleService.update(editingArticleId, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        category_id: editForm.category_id
          ? Number(editForm.category_id)
          : null,
      });

      cancelEditing();
      setSuccess("Article updated successfully.");

      await loadDashboard();
    } catch {
      setError("Could not update article.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: number, status: ArticleStatus) {
    try {
      setError("");
      setSuccess("");

      await articleService.update(id, { status });

      setSuccess("Article status updated successfully.");
      await loadDashboard();
    } catch {
      setError("Could not update article status.");
    }
  }

  async function deleteArticle(id: number) {
    if (!window.confirm("Delete this article permanently?")) return;

    try {
      setError("");
      setSuccess("");

      await articleService.delete(id);

      if (editingArticleId === id) {
        cancelEditing();
      }

      setSuccess("Article deleted successfully.");
      await loadDashboard();
    } catch {
      setError("Could not delete article.");
    }
  }

  async function changeUserRole(id: string, role: User["role"]) {
    try {
      setError("");
      setSuccess("");

      await authService.updateUser(id, { role });

      setSuccess("User role updated successfully.");
      await loadDashboard();
    } catch {
      setError("Could not update user role.");
    }
  }

  async function deleteUser(id: string) {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      setError("");
      setSuccess("");

      await authService.deleteUser(id);

      setSuccess("User deleted successfully.");
      await loadDashboard();
    } catch {
      setError("Could not delete user.");
    }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const categoryName = newCategory.trim();

    if (!categoryName) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await categoryService.create({ name: categoryName });

      setNewCategory("");
      setSuccess("Category created successfully.");

      await loadDashboard();
    } catch {
      setError("Could not create category.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: number) {
    if (!window.confirm("Delete this category?")) return;

    try {
      setError("");
      setSuccess("");

      await categoryService.delete(id);

      setSuccess("Category deleted successfully.");
      await loadDashboard();
    } catch {
      setError(
        "Could not delete category. It may be assigned to existing articles."
      );
    }
  }

  const stats = {
    total: articles.length,
    published: articles.filter((article) => article.status === "published")
      .length,
    draft: articles.filter((article) => article.status === "draft").length,
    review: articles.filter((article) => article.status === "review").length,
    totalContributors: users.filter((user) => user.role === "contributor")
      .length,
  };

  const statCards = [
    {
      label: "Total articles",
      value: stats.total,
      icon: BookOpen,
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle2,
    },
    {
      label: "Drafts",
      value: stats.draft,
      icon: FileEdit,
    },
    {
      label: "In review",
      value: stats.review,
      icon: Clock3,
    },
    {
      label: "Contributors",
      value: stats.totalContributors,
      icon: Users,
    },
  ];

  const inputStyle =
    "w-full rounded-lg border border-[#45A29E]/30 bg-[#0B0C10] px-4 py-2.5 text-sm text-[#C5C6C7] outline-none transition placeholder:text-[#C5C6C7]/35 focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10";

  const selectStyle =
    "rounded-lg border border-[#45A29E]/30 bg-[#0B0C10] px-3 py-2.5 text-sm text-[#C5C6C7] outline-none transition focus:border-[#66FCF1] focus:ring-2 focus:ring-[#66FCF1]/10";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#66FCF1] px-4 py-2.5 text-sm font-semibold text-[#0B0C10] transition hover:bg-[#45A29E] disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[#45A29E]/40 bg-[#1F2833] px-3 py-2 text-sm font-medium text-[#C5C6C7] transition hover:border-[#66FCF1]/60 hover:text-[#66FCF1]";

  const dangerButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/25 bg-red-400/5 px-3 py-2 text-sm font-medium text-red-400 transition hover:border-red-400/60 hover:bg-red-400/10";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0C10]">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={30}
            className="animate-spin text-[#66FCF1]"
          />
          <p className="text-sm text-[#C5C6C7]/60">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#0B0C10] px-4 py-8 text-[#C5C6C7] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#66FCF1]">
              <ShieldCheck size={17} />
              Administration
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#C5C6C7]">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#C5C6C7]/55">
              Manage articles, contributors, and categories across DocHub.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-lg border border-[#45A29E]/30 bg-[#1F2833] px-4 py-2.5">
            <ShieldCheck size={17} className="text-[#66FCF1]" />
            <span className="text-sm font-medium">Administrator</span>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/5 p-4 text-sm text-red-300"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-[#45A29E]/40 bg-[#45A29E]/10 p-4 text-sm text-[#66FCF1]"
          >
            <Check size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Dashboard statistics */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-[#45A29E]/20 bg-[#1F2833] p-5 transition hover:border-[#66FCF1]/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#C5C6C7]/55">
                    {item.label}
                  </span>

                  <Icon size={19} className="text-[#66FCF1]" />
                </div>

                <p className="text-3xl font-bold tracking-tight text-[#C5C6C7]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Article management */}
        <section className="mb-8 overflow-hidden rounded-xl border border-[#45A29E]/20 bg-[#1F2833]">
          <div className="border-b border-[#45A29E]/20 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#66FCF1]/10 p-2.5">
                <BookOpen size={20} className="text-[#66FCF1]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#C5C6C7]">
                  Article management
                </h2>
                <p className="mt-1 text-xs text-[#C5C6C7]/50">
                  Read, edit, delete, and manage publication status.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#45A29E]/15">
            {articles.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <FileText size={30} className="text-[#45A29E]" />
                <p className="text-sm text-[#C5C6C7]/55">
                  No articles available.
                </p>
              </div>
            ) : (
              articles.map((article) => (
                <div
                  key={article.id}
                  className="p-5 transition hover:bg-[#0B0C10]/20"
                >
                  {editingArticleId === article.id ? (
                    <form onSubmit={saveArticle} className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pencil size={17} className="text-[#66FCF1]" />
                          <h3 className="font-semibold text-[#C5C6C7]">
                            Edit article
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg p-2 text-[#C5C6C7]/50 transition hover:bg-[#0B0C10] hover:text-[#66FCF1]"
                          aria-label="Close editor"
                        >
                          <X size={19} />
                        </button>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#C5C6C7]">
                          Article title
                        </label>

                        <input
                          value={editForm.title}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              title: event.target.value,
                            })
                          }
                          placeholder="Article title"
                          className={inputStyle}
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#C5C6C7]">
                          Article content
                        </label>

                        <textarea
                          value={editForm.content}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              content: event.target.value,
                            })
                          }
                          placeholder="Write article content..."
                          rows={10}
                          className={`${inputStyle} resize-y`}
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#C5C6C7]">
                          Category
                        </label>

                        <select
                          value={editForm.category_id}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              category_id: event.target.value,
                            })
                          }
                          className={inputStyle}
                        >
                          <option value="">No category</option>

                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className={primaryButton}
                        >
                          {saving ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {saving ? "Saving..." : "Save changes"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          className={secondaryButton}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0">
                        <Link
                          to={`/articles/${article.id}`}
                          className="inline-flex items-center gap-2 font-semibold text-[#C5C6C7] transition hover:text-[#66FCF1]"
                        >
                          {article.title}
                          <Eye size={15} className="opacity-50" />
                        </Link>

                        <p className="mt-1 text-xs text-[#C5C6C7]/45">
                          Article #{article.id} · Author {article.author_id}
                        </p>

                        <span
                          className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                            article.status === "published"
                              ? "border-[#45A29E]/40 bg-[#45A29E]/10 text-[#66FCF1]"
                              : article.status === "review"
                                ? "border-[#66FCF1]/20 bg-[#66FCF1]/5 text-[#C5C6C7]"
                                : "border-[#C5C6C7]/15 bg-[#0B0C10]/40 text-[#C5C6C7]/60"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {article.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={article.status}
                          onChange={(event) =>
                            void changeStatus(
                              article.id,
                              event.target.value as ArticleStatus
                            )
                          }
                          className={selectStyle}
                          aria-label={`Change status of ${article.title}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="review">Review</option>
                          <option value="published">Published</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => startEditing(article)}
                          className={secondaryButton}
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteArticle(article.id)}
                          className={dangerButton}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* User management */}
        <section className="mb-8 overflow-hidden rounded-xl border border-[#45A29E]/20 bg-[#1F2833]">
          <div className="border-b border-[#45A29E]/20 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#66FCF1]/10 p-2.5">
                <Users size={20} className="text-[#66FCF1]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#C5C6C7]">
                  User management
                </h2>
                <p className="mt-1 text-xs text-[#C5C6C7]/50">
                  Manage user accounts and assign access roles.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#45A29E]/15">
            {users.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <Users size={30} className="text-[#45A29E]" />
                <p className="text-sm text-[#C5C6C7]/55">
                  No users available.
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-[#0B0C10]/20 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#45A29E]/30 bg-[#0B0C10]">
                      <UserRound size={19} className="text-[#66FCF1]" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#C5C6C7]">
                        {user.name}
                      </p>
                      <p className="truncate text-sm text-[#C5C6C7]/50">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        void changeUserRole(
                          user.id,
                          event.target.value as User["role"]
                        )
                      }
                      className={selectStyle}
                      aria-label={`Change role of ${user.name}`}
                    >
                      <option value="reader">Reader</option>
                      <option value="contributor">Contributor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => void deleteUser(user.id)}
                      className={dangerButton}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Category management */}
        <section className="overflow-hidden rounded-xl border border-[#45A29E]/20 bg-[#1F2833]">
          <div className="border-b border-[#45A29E]/20 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#66FCF1]/10 p-2.5">
                <FolderOpen size={20} className="text-[#66FCF1]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#C5C6C7]">
                  Category management
                </h2>
                <p className="mt-1 text-xs text-[#C5C6C7]/50">
                  Create and manage categories for organizing articles.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={createCategory}
            className="flex flex-col gap-3 border-b border-[#45A29E]/15 p-5 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Tag
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45A29E]"
              />

              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Enter category name"
                className={`${inputStyle} pl-10`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={primaryButton}
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              {saving ? "Adding..." : "Add category"}
            </button>
          </form>

          <div className="divide-y divide-[#45A29E]/15">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <FolderOpen size={30} className="text-[#45A29E]" />
                <p className="text-sm text-[#C5C6C7]/55">
                  No categories available.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 p-5 transition hover:bg-[#0B0C10]/20"
                >
                  <div className="flex items-center gap-3">
                    <Tag size={17} className="text-[#45A29E]" />
                    <span className="text-sm font-medium text-[#C5C6C7]">
                      {category.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => void deleteCategory(category.id)}
                    className={dangerButton}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#C5C6C7]/30">
          <ShieldCheck size={14} />
          DocHub Administration
        </div>
      </div>
    </section>
  );
}
