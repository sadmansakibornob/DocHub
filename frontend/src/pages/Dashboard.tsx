import { useAuth } from "../contexts/AuthContext";
import AppShell from "../components/layout/AppShell";
import UserDashboard from "./ContributorDashboard";
import { lazy, Suspense } from "react";
import Loading from "../components/common/Loading";
const AdminDashboard = lazy(() => import("./AdminDashboard"));
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin")
    return (
      <AppShell
        title="Administration"
        description="Manage platform access, content moderation, and security activity."
      >
        <Suspense fallback={<Loading />}>
          <AdminDashboard embedded />
        </Suspense>
      </AppShell>
    );
  return (
    <AppShell
      title="Your workspace"
      description="Create, organize, and share your knowledge."
    >
      <UserDashboard />
    </AppShell>
  );
}
