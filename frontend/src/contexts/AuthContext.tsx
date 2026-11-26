import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import authService from "../services/authService";

import type {
  User,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
} from "../types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Share the initial refresh across StrictMode remounts because refresh tokens rotate.
let startupRefreshPromise: ReturnType<typeof authService.refresh> | null = null;

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session when the application starts.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (token) {
          // Axios automatically refreshes if this returns 401.
          const currentUser = await authService.getCurrentUser();

          if (active) {
            setUser(currentUser);
          }
        } else {
          // Try restoring through the HttpOnly refresh cookie.
          if (!startupRefreshPromise) {
            startupRefreshPromise = authService.refresh().finally(() => {
              startupRefreshPromise = null;
            });
          }
          const response = await startupRefreshPromise;

          if (active) {
            localStorage.setItem(
              "access_token",
              response.access_token
            );

            setUser(response.user);
          }
        }
      } catch {
        localStorage.removeItem("access_token");

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Listen for failed refresh attempts.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener(
      "dochub:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "dochub:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Login.
  const login = async (data: LoginCredentials) => {
    const response = await authService.login(data);

    localStorage.setItem(
      "access_token",
      response.access_token
    );

    setUser(response.user);
  };

  // Register.
  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await authService.register(data);

    // Signup may create an authenticated session immediately.
    if (response.access_token) {
      localStorage.setItem(
        "access_token",
        response.access_token
      );

      setUser(response.user);
    }
    return response;
  };

  // Reload the authenticated user's profile.
  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser();

    setUser(currentUser);
  };

  // Revoke the backend session and clear local state.
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
