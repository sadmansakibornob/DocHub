import { Navigate, Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, LayoutDashboard } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

import ContributorDashboard from "./ContributorDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-[#C5C6C7]">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#45A29E]/20 bg-[#0B0C10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[#C5C6C7] transition hover:text-[#66FCF1]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#66FCF1]/10 text-[#66FCF1]">
              <BookOpen size={21} />
            </span>
            Doc<span className="text-[#66FCF1]">Hub</span>
          </Link>

          {/* User information */}
          <div className="flex items-center gap-4">

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#45A29E]/15 text-[#66FCF1]">
                <LayoutDashboard size={19} />
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#C5C6C7]">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-[#45A29E]">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-[#45A29E]/30 px-4 py-2 text-sm font-medium text-[#C5C6C7] transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-400"
            >
              <LogOut size={16} />
              Sign out
            </button>

          </div>
        </div>
      </header>

      {/* Role-based Dashboard */}
      {user.role === "admin" ? (
        <AdminDashboard />
      ) : user.role === "contributor" ? (
        <ContributorDashboard />
      ) : (
        <Navigate to="/" replace />
      )}

    </main>
  );
}
