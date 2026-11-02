
import api from "./api";
import type { User, UserRole } from "../types/user";

const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>("/users/");
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async update(
    id: string,
    data: { name?: string; role?: UserRole }
  ): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
