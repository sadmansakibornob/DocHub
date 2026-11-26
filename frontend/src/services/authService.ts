import api from "./api";

import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
  User,
  AuthSession,
} from "../types/user";

const authService = {
  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      data
    );

    return response.data;
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
      "/auth/signup",
      data
    );

    return response.data;
  },

  async refresh(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/refresh"
    );

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");

    return response.data;
  },

  async updateProfile(name: string): Promise<User> {
    const response = await api.patch<User>(
      "/auth/me",
      { name }
    );

    return response.data;
  },

  async changePassword(
    current_password: string,
    new_password: string
  ): Promise<void> {
    await api.post("/auth/change-password", {
      current_password,
      new_password,
    });

    localStorage.removeItem("access_token");
  },

  async getSessions(): Promise<AuthSession[]> {
    const response = await api.get<AuthSession[]>(
      "/auth/sessions"
    );

    return response.data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("access_token");
    }
  },


};

export default authService;
