import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LoadingState, ErrorState } from "./StatusStates";
import AdminLayout from "./AdminLayout";

export default function AdminRoute({ children }) {
  const { session, profile, profileStatus, loading, signOut } = useAuth();

  if (loading) return <LoadingState label="Checking access…" />;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (profileStatus === "loading" || profileStatus === "idle") {
    return <LoadingState label="Loading your account…" />;
  }
  if (profileStatus === "error") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <ErrorState message="We couldn't verify your account. Please sign in again." onRetry={signOut} />
      </div>
    );
  }
  if (profile?.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="font-serif text-xl mb-2">Access restricted</p>
        <p className="text-sm text-muted">This account does not have admin access.</p>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}