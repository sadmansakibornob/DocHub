import api from "./api";
import type { User } from "../types/user";

const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>("/users/");
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};

export default userService;
