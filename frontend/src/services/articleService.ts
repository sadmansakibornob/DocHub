import api from "./api";
import type {
  Article,
  ArticleCreate,
  ArticleUpdate,
  ArticleStatus,
} from "../types/article";

const articleService = {
  async getAll(params?: {
    status?: ArticleStatus;
    category_id?: number;
  }): Promise<Article[]> {
    const response = await api.get<Article[]>("/articles/", {
      params,
    });

    return response.data;
  },

  async getById(id: number): Promise<Article> {
    const response = await api.get<Article>(`/articles/${id}`);

    return response.data;
  },

  async create(data: ArticleCreate): Promise<Article> {
    const response = await api.post<Article>("/articles/", data);

    return response.data;
  },

  async update(
    id: number,
    data: ArticleUpdate
  ): Promise<Article> {
    const response = await api.patch<Article>(
      `/articles/${id}`,
      data
    );

    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/articles/${id}`);
  },
};

export default articleService;