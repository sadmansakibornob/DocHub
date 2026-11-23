import api from "./api";
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
} from "../types/category";

const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>("/categories/");

    return response.data;
  },

  async getById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);

    return response.data;
  },

  async create(data: CategoryCreate): Promise<Category> {
    const response = await api.post<Category>(
      "/categories/",
      data
    );

    return response.data;
  },

  async update(
    id: number,
    data: CategoryUpdate
  ): Promise<Category> {
    const response = await api.patch<Category>(
      `/categories/${id}`,
      data
    );

    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService;