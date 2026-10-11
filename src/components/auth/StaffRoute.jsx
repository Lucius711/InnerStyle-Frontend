import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/** True when the signed-in account holds the STAFF role. */
export function isStaff(user) {
  return Array.isArray(user?.roles) && user.roles.includes("STAFF");
}

/**
 * Guards role-only routes (STAFF by default, or `role`): unauthenticated users go to /login; signed-in non-staff
 * users are redirected home.
 */
export default function StaffRoute({ children, role = "STAFF" }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!user?.roles?.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
