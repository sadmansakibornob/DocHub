
import api from "./api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "../types/user";

const authService = {
  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/users/login",
      data
    );

    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>(
      "/users/register",
      data
    );

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/users/me");

    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users/");

    return response.data;
  },

  async updateUser(
    id: string,
    data: Partial<Pick<User, "name" | "role">>
  ): Promise<User> {
    const response = await api.patch<User>(
      `/users/${id}`,
      data
    );

    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export default authService;
