/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import type { User, UserRole } from "../types/user";
import type { Article } from "../types/article";

export type ArticleStatus = "draft" | "review" | "published";

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminStats {
  users_total: number;
  banned_users: number;
  records_total: number;
  groups_total: number;
  new_users_7d: number;
  new_records_7d: number;
  new_groups_7d: number;
}

const adminService = {
  // Dashboard statistics
  async dashboard() {
    return (await api.get<AdminStats>("/admin/dashboard")).data;
  },

  // User management
  async users(params: Record<string, string | number | undefined>) {
    return (await api.get<Page<User>>("/admin/users", { params })).data;
  },

  async user(id: string) {
    return (await api.get(`/admin/users/${id}`)).data;
  },

  async role(id: string, role: UserRole) {
    return (await api.patch(`/admin/users/${id}/role`, { role })).data;
  },

  // Ban a user
  async ban(id: string, reason: string) {
    return (
      await api.post(`/admin/users/${id}/ban`, {
        is_banned: true,
        reason,
      })
    ).data;
  },

  // Unban a user
  async unban(id: string) {
    return (
      await api.post(`/admin/users/${id}/ban`, {
        is_banned: false,
        reason: null,
      })
    ).data;
  },

  // Ban multiple users
  async bulkBan(user_ids: string[], reason: string) {
    return (
      await api.post("/admin/users/bulk-ban", {
        user_ids,
        reason,
      })
    ).data;
  },

  // Unban multiple users
  async bulkUnban(ids: string[]) {
    return (await api.post("/admin/users/bulk-unban", ids)).data;
  },

  // Session management
  async revokeSessions(id: string) {
    return (await api.post(`/admin/users/${id}/revoke-sessions`)).data;
  },

  // Article moderation
  async articles(params: Record<string, string | number | undefined>) {
    return (
      await api.get<Page<Article>>("/admin/moderation/articles", { params })
    ).data;
  },

  async updateArticleStatus(id: number, status: ArticleStatus) {
    return (
      await api.patch(`/admin/moderation/articles/${id}/status`, { status })
    ).data;
  },

  async deleteArticle(id: number) {
    await api.delete(`/admin/moderation/articles/${id}`);
  },

  async bulkDeleteArticles(article_ids: number[]) {
    return (
      await api.post("/admin/moderation/articles/bulk-delete", {
        article_ids,
      })
    ).data;
  },

  // Group moderation
  async groups(params: Record<string, string | number | undefined>) {
    return (await api.get<Page<any>>("/admin/moderation/groups", { params }))
      .data;
  },

  async deleteGroup(id: string) {
    await api.delete(`/admin/moderation/groups/${id}`);
  },

  async bulkDeleteGroups(ids: string[]) {
    return (await api.post("/admin/moderation/groups/bulk-delete", ids)).data;
  },

  // Audit logs
  async audit(params: Record<string, string | number | undefined>) {
    return (await api.get<Page<any>>("/admin/audit-logs", { params })).data;
  },

  // Security events
  async failedLogins() {
    return (await api.get("/admin/security/failed-logins")).data;
  },

  // CSV export
  async export(path: string, params?: Record<string, string>) {
    const r = await api.get(`/admin/export/${path}.csv`, {
      params,
      responseType: "blob",
    });

    const url = URL.createObjectURL(r.data);
    const a = document.createElement("a");

    a.href = url;
    a.download = `dochub-${path}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  },
};

export default adminService;
