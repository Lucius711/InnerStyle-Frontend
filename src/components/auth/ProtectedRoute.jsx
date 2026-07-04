import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Guards a route: redirects unauthenticated users to /login (preserving the intended path).
 * When {@code customerOnly} is set, staff accounts (operators) are sent to their
 * fulfilment dashboard instead — they have no customer-facing features.
 */
export default function ProtectedRoute({ children, customerOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();
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
  const isStaff = Array.isArray(user?.roles) && user.roles.includes("STAFF");
  if (customerOnly && isStaff) {
    return <Navigate to="/staff" replace />;
  }
  return children;
}
