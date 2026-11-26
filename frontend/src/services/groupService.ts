import type { Article, ArticleUpdate } from "../types/article";
import api from "./api";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  membership_role?: "owner" | "editor" | "member";
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: "owner" | "editor" | "member";
  created_at?: string;
  users?: { id: string; name: string; email: string };
}

const groupService = {
  async list(): Promise<Group[]> {
    return (await api.get<Group[]>("/groups")).data;
  },

  async create(data: { name: string; description: string }): Promise<Group> {
    return (await api.post<Group>("/groups", data)).data;
  },

  async get(id: string): Promise<Group> {
    return (await api.get<Group>(`/groups/${id}`)).data;
  },

  async update(
    id: string,
    data: { name: string; description: string },
  ): Promise<Group> {
    return (await api.patch<Group>(`/groups/${id}`, data)).data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/groups/${id}`);
  },

  async members(id: string): Promise<GroupMember[]> {
    return (await api.get<GroupMember[]>(`/groups/${id}/members`)).data;
  },

  // Add an existing user by email instead of requiring their user ID.
  async addMember(
    id: string,
    data: { email: string; role: "member" | "editor" },
  ): Promise<GroupMember> {
    return (
      await api.post<GroupMember>(`/groups/${id}/members`, {
        email: data.email.trim().toLowerCase(),
        role: data.role,
      })
    ).data;
  },

  async setMemberRole(
    id: string,
    uid: string,
    role: "member" | "editor",
  ): Promise<GroupMember> {
    return (
      await api.patch<GroupMember>(`/groups/${id}/members/${uid}`, {
        role,
      })
    ).data;
  },

  async removeMember(id: string, uid: string): Promise<void> {
    await api.delete(`/groups/${id}/members/${uid}`);
  },

  async articles(id: string): Promise<Article[]> {
    return (await api.get<Article[]>(`/groups/${id}/articles`)).data;
  },

  async assignArticle(id: string, article_id: number) {
    return (await api.post(`/groups/${id}/articles`, { article_id })).data;
  },

  async unassignArticle(id: string, article_id: number) {
    await api.delete(`/groups/${id}/articles/${article_id}`);
  },

  async updateArticle(
    id: string,
    articleId: number,
    data: ArticleUpdate,
  ): Promise<Article> {
    return (
      await api.patch<Article>(`/groups/${id}/articles/${articleId}`, data)
    ).data;
  },
};

export default groupService;
